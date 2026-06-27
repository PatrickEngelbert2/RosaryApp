import { describe, expect, it } from "vitest";
import { prayersById } from "@/content/prayers";
import { buildRosaryFlow } from "@/lib/rosary/buildRosaryFlow";
import { normalizeGuideCardLayoutOptions } from "@/lib/rosary/cardUtils";
import { createDefaultUserConfigFromTemplate, normalizePrayerLanguageById } from "@/lib/rosary/configUtils";
import {
  defaultEasyGuideAnswers,
  buildDefaultEasyGuideName,
  createUserRosaryConfigFromWizardAnswers,
} from "@/lib/rosary/easyGuideBuilder";
import {
  generateGuideCardsFromConfig,
  getRelevantGuidePrayerOptions,
} from "@/lib/rosary/generateGuideCards";
import { GUIDE_CARD_LAYOUTS } from "@/lib/rosary/guideCardLayouts";
import {
  findDuplicateIds,
  getVisibleEditableItemIds,
  moveEditableItem,
  reorderEditableItem,
} from "@/lib/rosary/guideCardCustomizations";
import {
  getCompactPrayerText,
  getFullPrayerTextForCards,
  getPrayerLanguage,
  getPrayerVariant,
} from "@/lib/rosary/prayerText";
import {
  createStoredCollection,
  normalizeStoredGuideCardCustomizations,
  normalizeStoredGuideCardLayoutOptions,
  normalizeStoredRosaryConfigs,
} from "@/lib/rosary/storageSchema";
import type {
  GeneratedGuideCard,
  GuideCardCustomization,
  GuideCardSide,
  PrayerId,
  UserRosaryConfig,
} from "@/lib/rosary/types";

const fixedDate = new Date("2026-06-26T12:00:00-05:00");
const testedPrayerIds: PrayerId[] = [
  "apostles-creed",
  "our-father",
  "hail-mary",
  "glory-be",
  "fatima-prayer",
  "hail-holy-queen",
  "closing-prayer",
  "memorare",
  "st-michael-prayer",
];

describe("prayer language resolution", () => {
  it("defaults missing or invalid language settings to English", () => {
    expect(getPrayerLanguage("hail-mary")).toBe("en");
    expect(getPrayerLanguage("hail-mary", { "hail-mary": "la" })).toBe("la");
    expect(getPrayerLanguage("hail-mary", { "hail-mary": "es" })).toBe("es");
    expect(normalizePrayerLanguageById({ "not-a-prayer": "la" } as Record<string, "la">)).toEqual({});
  });

  it("renders mixed English and Latin in the same guide flow", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "our-father": "la",
        "fatima-prayer": "la",
      },
    });
    const flow = buildRosaryFlow(config);

    expect(flow.some((step) => step.title === "Pater Noster" && step.text?.includes("Pater noster"))).toBe(true);
    expect(flow.some((step) => step.title === "Oratio Fatimae" && step.text?.includes("O mi Iesu"))).toBe(true);
    expect(flow.some((step) => step.title === "Hail Mary" && step.text?.includes("Hail Mary"))).toBe(true);
  });

  it("resolves short and full prayer text from the selected language", () => {
    const hailMary = prayersById["hail-mary"];
    const fatimaPrayer = prayersById["fatima-prayer"];

    expect(getCompactPrayerText(fatimaPrayer, "la")).toBe("O mi Iesu...");
    expect(getFullPrayerTextForCards(hailMary, "la")).toContain("Ave Maria, gratia plena");
    expect(getCompactPrayerText(hailMary, "en")).toContain("Hail Mary");
    expect(getFullPrayerTextForCards(hailMary, "en")).toContain("Hail Mary, full of grace");
  });

  it.each(testedPrayerIds)("%s has short/full English and Latin text", (prayerId) => {
    const prayer = prayersById[prayerId];

    expect(getCompactPrayerText(prayer, "en")).toBeTruthy();
    expect(getFullPrayerTextForCards(prayer, "en")).toBeTruthy();
    expect(getCompactPrayerText(prayer, "la")).toBeTruthy();
    expect(getFullPrayerTextForCards(prayer, "la")).toBeTruthy();
    expect(getPrayerVariant(prayer, "la").language).toBe("la");
  });
});

describe("guide creation and builder output", () => {
  it("advanced-builder-style config can represent per-prayer language choices", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "our-father": "la",
        "hail-mary": "en",
      },
    });

    expect(config.prayerLanguageById?.["our-father"]).toBe("la");
    expect(getPrayerLanguage("hail-mary", config.prayerLanguageById)).toBe("en");
  });

  it("easy builder defaults remain English and produce stable non-empty names", () => {
    const result = createUserRosaryConfigFromWizardAnswers(defaultEasyGuideAnswers, fixedDate);

    expect(result.config.name).toBeTruthy();
    expect(result.defaultName).toBe(buildDefaultEasyGuideName(defaultEasyGuideAnswers));
    expect(result.config.prayerLanguageById).toEqual({});
  });

  it("easy builder only sets selected Latin prayers when requested", () => {
    const result = createUserRosaryConfigFromWizardAnswers(
      {
        ...defaultEasyGuideAnswers,
        latinChoice: "choose",
        latinPrayerIds: ["our-father", "fatima-prayer"],
      },
      fixedDate,
    );

    expect(result.config.prayerLanguageById).toEqual({
      "our-father": "la",
      "fatima-prayer": "la",
    });
  });
});

describe("card content generation", () => {
  it("includes selected sections, prayers, saints, and language variants", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "our-father": "la",
      },
    });
    const generated = generateGuideCardsFromConfig(config, { cardSize: "full-1", cardCount: 1 }, fixedDate);
    const text = generatedText(generated.cards[0]);

    expect(text).toContain("Opening");
    expect(text).toContain("Hail, holy Queen");
    expect(text).toContain("St. Michael the Archangel");
    expect(text).toContain("Saint Joseph, pray for us.");
    expect(text).not.toContain("Memorare");
    expect(text).toContain("Pater noster");
  });

  it("lets card-specific language overrides beat guide-level language", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "our-father": "en",
      },
    });
    const customization = createCustomization(config.id, {
      prayerLanguageOverrides: {
        "our-father": "la",
      },
    });
    const generated = generateGuideCardsFromConfig(config, { cardSize: "full-1", cardCount: 1 }, fixedDate, customization);

    expect(generatedText(generated.cards[0])).toContain("Pater noster");
  });

  it("applies text overrides, deleted items, and full-prayer overrides without changing source identity", () => {
    const config = createTestGuide();
    const baseline = generateGuideCardsFromConfig(config, { cardSize: "full-1", cardCount: 1 }, fixedDate);
    const itemIds = getVisibleEditableItemIds(allSides(baseline.cards[0]));
    const firstPrayerId = itemIds.find((id) => id.includes("opening")) ?? itemIds[0];
    const secondItemId = itemIds.find((id) => id !== firstPrayerId) ?? itemIds[1];
    const customization = createCustomization(config.id, {
      itemOrder: itemIds,
      removedItemIds: [secondItemId],
      fullPrayerOverrides: {
        "our-father": true,
      },
      textOverrides: {
        [firstPrayerId]: "Custom opening line.",
      },
    });
    const generated = generateGuideCardsFromConfig(config, { cardSize: "full-1", cardCount: 1 }, fixedDate, customization);
    const text = generatedText(generated.cards[0]);
    const visibleIds = getVisibleEditableItemIds(allSides(generated.cards[0]));

    expect(text).toContain("Custom opening line.");
    expect(visibleIds).not.toContain(secondItemId);
    expect(text).toContain("Our Father:");
    expect(text).not.toContain("Grip");
    expect(text).not.toContain("Remove");
  });

  it("empty customization behaves as a reset of card-only customizations", () => {
    const config = createTestGuide();
    const baseline = generateGuideCardsFromConfig(config, { cardSize: "full-1", cardCount: 1 }, fixedDate);
    const customized = generateGuideCardsFromConfig(
      config,
      { cardSize: "full-1", cardCount: 1 },
      fixedDate,
      createCustomization(config.id, {
        removedItemIds: [getVisibleEditableItemIds(allSides(baseline.cards[0]))[0]],
      }),
    );
    const reset = generateGuideCardsFromConfig(
      config,
      { cardSize: "full-1", cardCount: 1 },
      fixedDate,
      createCustomization(config.id),
    );

    expect(generatedText(customized.cards[0])).not.toBe(generatedText(baseline.cards[0]));
    expect(generatedText(reset.cards[0])).toBe(generatedText(baseline.cards[0]));
  });
});

describe("card ordering and reordering", () => {
  it("moves items up and down", () => {
    const ids = ["a", "b", "c"];

    expect(moveEditableItem(ids, "b", "up")).toEqual(["b", "a", "c"]);
    expect(moveEditableItem(ids, "b", "down")).toEqual(["a", "c", "b"]);
    expect(moveEditableItem(ids, "a", "up")).toBe(ids);
  });

  it("reorders drag/drop within and across sections without duplication or loss", () => {
    const ids = ["opening:line-1", "opening:line-2", "closing:line-1", "closing:line-2"];
    const sameSection = reorderEditableItem(ids, "opening:line-1", "opening:line-2", "after");
    const crossSection = reorderEditableItem(ids, "opening:line-1", "closing:line-1", "before");

    expect(sameSection).toEqual(["opening:line-2", "opening:line-1", "closing:line-1", "closing:line-2"]);
    expect(crossSection).toEqual(["opening:line-2", "opening:line-1", "closing:line-1", "closing:line-2"]);
    expect(new Set(crossSection).size).toBe(ids.length);
    expect(crossSection.sort()).toEqual([...ids].sort());
    expect(findDuplicateIds(crossSection)).toEqual([]);
  });

  it("preserves stable editable item IDs and unique rendered keys", () => {
    const generated = generateGuideCardsFromConfig(createTestGuide(), { cardSize: "full-1", cardCount: 1 }, fixedDate);
    const sides = allSides(generated.cards[0]);
    const itemIds = getVisibleEditableItemIds(sides);
    const renderedKeys = sides.flatMap((side) => side.blocks.map((block) => block.layoutInstanceId ?? block.id));

    expect(itemIds.length).toBeGreaterThan(0);
    expect(findDuplicateIds(itemIds)).toEqual([]);
    expect(findDuplicateIds(renderedKeys)).toEqual([]);
  });
});

describe("card layout packing", () => {
  it.each(GUIDE_CARD_LAYOUTS)("%s keeps tiny content front-only when it fits", (layout) => {
    const config = createTestGuide();
    const baseline = generateGuideCardsFromConfig(config, { cardSize: layout.id, cardCount: 1 }, fixedDate);
    const itemIds = getVisibleEditableItemIds(allSides(baseline.cards[0]));
    const keepIds = new Set(itemIds.slice(0, 2));
    const compact = generateGuideCardsFromConfig(
      config,
      { cardSize: layout.id, cardCount: 1 },
      fixedDate,
      createCustomization(config.id, {
        itemOrder: itemIds,
        removedItemIds: itemIds.filter((id) => !keepIds.has(id)),
      }),
    );

    expect(compact.cards[0].front.blocks.length).toBeGreaterThan(0);
    expect(compact.cards[0].back).toBeUndefined();
    expect(compact.cards[0].extraSides).toEqual([]);
    expect(compact.warnings.some((warning) => warning.includes("Layout integrity warning"))).toBe(false);
  });

  it.each(GUIDE_CARD_LAYOUTS)("%s preserves dense content without premature empty faces", (layout) => {
    const config = createTestGuide();
    const generated = generateGuideCardsFromConfig(
      config,
      {
        cardSize: layout.id,
        cardCount: layout.cardsPerPage,
        fullPrayerIds: getRelevantGuidePrayerOptions(config).map((prayer) => prayer.id),
      },
      fixedDate,
    );
    const sides = allSides(generated.cards[0]);

    expect(generated.warnings.some((warning) => warning.includes("not placed"))).toBe(false);
    expect(generated.warnings.some((warning) => warning.includes("even though face"))).toBe(false);
    expect(hasEmptyFaceBeforeNonEmpty(sides)).toBe(false);
    expect(findDuplicateIds(sides.flatMap((side) => side.blocks.map((block) => block.layoutInstanceId ?? block.id)))).toEqual([]);
    expect(sides.every((side) => side.blocks.every((block) => !block.heading || (block.lines?.length ?? 0) > 0 || Boolean(block.body)))).toBe(true);

    if ((generated.cards[0].extraSides?.length ?? 0) > 0) {
      expect(generated.cards[0].front.blocks.length).toBeGreaterThan(0);
      expect(generated.cards[0].back?.blocks.length).toBeGreaterThan(0);
    }
  });
});

describe("preview and print data parity", () => {
  it("uses the same generated content model for preview and print inputs", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "fatima-prayer": "la",
      },
    });
    const options = normalizeGuideCardLayoutOptions({
      cardSize: "pocket-4",
      cardCount: 4,
      fullPrayerIds: ["apostles-creed"],
    });
    const customization = createCustomization(config.id, {
      prayerLanguageOverrides: {
        "hail-mary": "la",
      },
      textOverrides: {
        "card:title": "Parity Test",
      },
    });
    const preview = generateGuideCardsFromConfig(config, options, fixedDate, customization);
    const print = generateGuideCardsFromConfig(config, options, fixedDate, customization);

    expect(print.cards[0]).toEqual(preview.cards[0]);
    expect(generatedText(print.cards[0])).toContain("Parity Test");
    expect(generatedText(print.cards[0])).not.toMatch(/Edit|Remove|Grip|Drag item/);
  });
});

describe("storage validation", () => {
  it("handles empty, invalid, old, and malformed saved guide data safely", () => {
    const validGuide = createTestGuide();

    expect(normalizeStoredRosaryConfigs(undefined)).toEqual({ items: [], recovered: false });
    expect(normalizeStoredRosaryConfigs("not-json-after-parse")).toEqual({ items: [], recovered: true });
    expect(normalizeStoredRosaryConfigs([{ nope: true }])).toEqual({ items: [], recovered: true });
    expect(normalizeStoredRosaryConfigs([validGuide]).items).toHaveLength(1);
    expect(normalizeStoredRosaryConfigs(createStoredCollection([validGuide])).items[0].id).toBe(validGuide.id);
  });

  it("handles malformed customization and layout option data safely", () => {
    const config = createTestGuide();
    const customization = createCustomization(config.id, {
      itemOrder: ["a", "a", "b"],
      removedItemIds: ["x", "x"],
      fullPrayerOverrides: {
        "our-father": true,
        "not-a-prayer": true,
      } as Record<string, boolean>,
      prayerLanguageOverrides: {
        "our-father": "la",
        "not-a-prayer": "la",
      } as Record<string, "la">,
      textOverrides: {
        keep: "yes",
        drop: 12 as unknown as string,
      },
    });
    const normalized = normalizeStoredGuideCardCustomizations([customization]);

    expect(normalized.items[0].itemOrder).toEqual(["a", "b"]);
    expect(normalized.items[0].removedItemIds).toEqual(["x"]);
    expect(normalized.items[0].fullPrayerOverrides).toEqual({ "our-father": true });
    expect(normalized.items[0].prayerLanguageOverrides).toEqual({ "our-father": "la" });
    expect(normalized.items[0].textOverrides).toEqual({ keep: "yes" });
    expect(normalizeStoredGuideCardLayoutOptions({ cardSize: "bad", cardCount: 999 }).cardSize).toBe("pocket-4");
  });
});

function createTestGuide(overrides: Partial<UserRosaryConfig> = {}): UserRosaryConfig {
  return {
    ...createDefaultUserConfigFromTemplate("rosary-walk-leader"),
    id: "test-guide",
    name: "Regression Test Guide",
    mysterySetMode: "manual",
    selectedMysterySetId: "sorrowful",
    selectedClosingPrayerIds: ["hail-holy-queen", "closing-prayer", "st-michael-prayer"],
    saintInvocations: {
      enabled: true,
      saints: ["Saint Joseph"],
    },
    ...overrides,
  };
}

function createCustomization(
  guideId: string,
  overrides: Partial<GuideCardCustomization> = {},
): GuideCardCustomization {
  return {
    guideId,
    itemOrder: [],
    removedItemIds: [],
    fullPrayerOverrides: {},
    prayerLanguageOverrides: {},
    textOverrides: {},
    updatedAt: "2026-06-26T00:00:00.000Z",
    ...overrides,
  };
}

function allSides(card: GeneratedGuideCard): GuideCardSide[] {
  return [card.front, ...(card.back ? [card.back] : []), ...(card.extraSides ?? [])];
}

function generatedText(card: GeneratedGuideCard): string {
  return allSides(card)
    .flatMap((side) => [
      side.title,
      side.subtitle ?? "",
      ...side.blocks.flatMap((block) => [block.heading ?? "", block.body ?? "", ...(block.lines ?? [])]),
    ])
    .join("\n");
}

function hasEmptyFaceBeforeNonEmpty(sides: GuideCardSide[]): boolean {
  return sides.some(
    (side, index) => side.blocks.length > 0 && sides.slice(0, index).some((previous) => previous.blocks.length === 0),
  );
}
