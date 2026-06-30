import { describe, expect, it } from "vitest";
import { prayersById } from "@/content/prayers";
import { buildRosaryFlow } from "@/lib/rosary/buildRosaryFlow";
import { normalizeGuideCardLayoutOptions } from "@/lib/rosary/cardUtils";
import { createDefaultUserConfigFromTemplate, normalizePrayerLanguageById } from "@/lib/rosary/configUtils";
import {
  clampPrayerStepIndex,
  createPrayerSteps,
  getNextPrayerStepIndex,
  getPreviousPrayerStepIndex,
} from "@/lib/rosary/createPrayerSteps";
import {
  defaultEasyGuideAnswers,
  buildDefaultEasyGuideName,
  createUserRosaryConfigFromWizardAnswers,
} from "@/lib/rosary/easyGuideBuilder";
import { findBestMatchingPrayerStepIndex } from "@/lib/rosary/prayerStepMatching";
import {
  generateGuideCardsFromConfig,
  getRelevantGuidePrayerOptions,
} from "@/lib/rosary/generateGuideCards";
import { GUIDE_CARD_LAYOUTS } from "@/lib/rosary/guideCardLayouts";
import {
  getGuideCardBlockKey,
  packGuideCardBlocksByHeight,
} from "@/lib/rosary/measuredGuideCardLayout";
import {
  createGuideBackupFile,
  createGuideBackupFilename,
  parseGuideBackupJson,
  prepareGuideBackupImport,
  validateGuideBackupFile,
} from "@/lib/rosary/guideBackups";
import {
  createGuideCardCustomItem,
  findDuplicateIds,
  getVisibleEditableItemIds,
  insertEditableItemAfter,
  insertEditableItemRelative,
  moveEditableItem,
  reorderEditableItem,
} from "@/lib/rosary/guideCardCustomizations";
import { getMobileGuideCardActionItems } from "@/lib/rosary/mobileGuideCardActions";
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
  GuideCardBlock,
  GuideCardCustomization,
  GuideCardSide,
  PrayerStep,
  PrayerId,
  PrayerLanguage,
  UserRosaryConfig,
} from "@/lib/rosary/types";

const fixedDate = new Date("2026-06-26T12:00:00-05:00");
const testedPrayerIds: PrayerId[] = [
  "sign-of-the-cross",
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
    expect(
      normalizePrayerLanguageById({ "our-father": "es", "hail-mary": "bad" } as unknown as Partial<
        Record<PrayerId, PrayerLanguage>
      >),
    ).toEqual({
      "our-father": "es",
      "hail-mary": "en",
    });
    expect(normalizePrayerLanguageById({ "not-a-prayer": "la" } as Record<string, "la">)).toEqual({});
  });

  it("renders mixed English, Latin, and Spanish in the same guide flow", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "our-father": "la",
        "hail-mary": "es",
        "fatima-prayer": "en",
      },
    });
    const flow = buildRosaryFlow(config);

    expect(flow.some((step) => step.title === "Pater Noster" && step.text?.includes("Pater noster"))).toBe(true);
    expect(flow.some((step) => step.title === "Ave María" && step.text?.includes("Dios te salve, María"))).toBe(true);
    expect(flow.some((step) => step.title === "Fatima Prayer" && step.text?.includes("O my Jesus"))).toBe(true);
  });

  it("resolves short and full prayer text from the selected language", () => {
    const hailMary = prayersById["hail-mary"];
    const fatimaPrayer = prayersById["fatima-prayer"];

    expect(getCompactPrayerText(fatimaPrayer, "la")).toBe("O mi Iesu...");
    expect(getCompactPrayerText(fatimaPrayer, "es")).toBe("Oh Jesús mío...");
    expect(getFullPrayerTextForCards(hailMary, "la")).toContain("Ave Maria, gratia plena");
    expect(getFullPrayerTextForCards(hailMary, "es")).toContain("Dios te salve, María");
    expect(getCompactPrayerText(hailMary, "en")).toContain("Hail Mary");
    expect(getFullPrayerTextForCards(hailMary, "en")).toContain("Hail Mary, full of grace");
  });

  it("uses compact English card incipits for common repeated prayers", () => {
    expect(getCompactPrayerText(prayersById["our-father"], "en")).toBe("Our Father...");
    expect(getCompactPrayerText(prayersById["hail-mary"], "en")).toBe("Hail Mary...");
    expect(getCompactPrayerText(prayersById["glory-be"], "en")).toBe("Glory be...");
    expect(getCompactPrayerText(prayersById["fatima-prayer"], "en")).toBe("O my Jesus...");
    expect(getCompactPrayerText(prayersById["hail-holy-queen"], "en")).toBe(
      "Hail, holy Queen, Mother of mercy...",
    );
    expect(getCompactPrayerText(prayersById["memorare"], "en")).toBe(
      "Remember, O most gracious Virgin Mary...",
    );
    expect(getCompactPrayerText(prayersById["st-michael-prayer"], "en")).toBe(
      "St. Michael the Archangel...",
    );
  });

  it.each(testedPrayerIds)("%s has short/full English, Latin, and Spanish text", (prayerId) => {
    const prayer = prayersById[prayerId];

    expect(getCompactPrayerText(prayer, "en")).toBeTruthy();
    expect(getFullPrayerTextForCards(prayer, "en")).toBeTruthy();
    expect(getCompactPrayerText(prayer, "la")).toBeTruthy();
    expect(getFullPrayerTextForCards(prayer, "la")).toBeTruthy();
    expect(getPrayerVariant(prayer, "la").language).toBe("la");
    expect(getCompactPrayerText(prayer, "es")).toBeTruthy();
    expect(getFullPrayerTextForCards(prayer, "es")).toBeTruthy();
    expect(getPrayerVariant(prayer, "es").language).toBe("es");
  });
});

describe("guide creation and builder output", () => {
  it("advanced-builder-style config can represent per-prayer language choices", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "our-father": "la",
        "hail-mary": "es",
      },
    });

    expect(config.prayerLanguageById?.["our-father"]).toBe("la");
    expect(getPrayerLanguage("hail-mary", config.prayerLanguageById)).toBe("es");
  });

  it("easy builder defaults remain English and produce stable non-empty names", () => {
    const result = createUserRosaryConfigFromWizardAnswers(defaultEasyGuideAnswers, fixedDate);

    expect(result.config.name).toBeTruthy();
    expect(result.defaultName).toBe(buildDefaultEasyGuideName(defaultEasyGuideAnswers));
    expect(result.config.prayerLanguageById).toEqual({});
  });

  it("easy builder only sets selected non-English prayers when requested", () => {
    const result = createUserRosaryConfigFromWizardAnswers(
      {
        ...defaultEasyGuideAnswers,
        languageChoice: "choose",
        prayerLanguageById: {
          "our-father": "la",
          "hail-mary": "es",
          "fatima-prayer": "en",
        },
      },
      fixedDate,
    );

    expect(result.config.prayerLanguageById).toEqual({
      "our-father": "la",
      "hail-mary": "es",
    });
  });
});

describe("step-by-step prayer mode", () => {
  it("creates stable unique steps with mysteries, closings, and saint invocations", () => {
    const steps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "group" });
    const ids = steps.map((step) => step.id);

    expect(steps.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(steps.some((step) => step.prayerId === "apostles-creed")).toBe(true);
    expect(steps.some((step) => step.type === "mystery" && step.mysteryName === "The Agony in the Garden")).toBe(true);
    expect(steps.some((step) => step.prayerId === "hail-holy-queen")).toBe(true);
    expect(steps.some((step) => step.prayerId === "st-michael-prayer")).toBe(true);
    expect(steps.some((step) => step.type === "saint-invocation" && step.body?.includes("Saint Joseph"))).toBe(true);
  });

  it("does not carry mystery context into closing prayers", () => {
    const steps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "group" });
    const closingPrayer = steps.find((step) => step.prayerId === "hail-holy-queen");
    const saintInvocations = steps.find((step) => step.type === "saint-invocation");

    expect(closingPrayer?.mysteryName).toBeUndefined();
    expect(closingPrayer?.decadeIndex).toBeUndefined();
    expect(saintInvocations?.mysteryName).toBeUndefined();
  });

  it("expands repeated prayers when counting each prayer", () => {
    const steps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "count" });
    const decadeHailMarys = steps.filter(
      (step) => step.prayerId === "hail-mary" && step.repeatTotal === 10,
    );
    const openingHailMarys = steps.filter(
      (step) => step.prayerId === "hail-mary" && step.repeatTotal === 3,
    );

    expect(decadeHailMarys).toHaveLength(50);
    expect(decadeHailMarys.slice(0, 10).map((step) => step.repeatIndex)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(decadeHailMarys[3].title).toContain("4 of 10");
    expect(openingHailMarys).toHaveLength(3);
  });

  it("groups repeated prayers when using a physical rosary", () => {
    const steps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "group" });
    const decadeHailMaryGroups = steps.filter(
      (step) => step.type === "repeated-prayer" && step.prayerId === "hail-mary" && step.repeatCount === 10,
    );
    const openingHailMaryGroups = steps.filter(
      (step) => step.type === "repeated-prayer" && step.prayerId === "hail-mary" && step.repeatCount === 3,
    );

    expect(decadeHailMaryGroups).toHaveLength(5);
    expect(decadeHailMaryGroups[0].title).toBe("Hail Mary x 10");
    expect(openingHailMaryGroups).toHaveLength(1);
  });

  it("maps counted Hail Mary progress to the matching grouped decade", () => {
    const countSteps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "count" });
    const groupSteps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "group" });
    const currentIndex = countSteps.findIndex(
      (step) => step.prayerId === "hail-mary" && step.decadeIndex === 1 && step.repeatIndex === 4,
    );
    const nextIndex = findBestMatchingPrayerStepIndex({
      currentStep: countSteps[currentIndex],
      nextSteps: groupSteps,
      currentIndex,
      currentTotal: countSteps.length,
    });

    expect(groupSteps[nextIndex].title).toBe("Hail Mary x 10");
    expect(groupSteps[nextIndex].decadeIndex).toBe(1);
    expect(groupSteps[nextIndex].repeatGroupId).toBe(countSteps[currentIndex].repeatGroupId);
  });

  it("maps grouped Hail Mary progress to the first counted step in the same decade", () => {
    const groupSteps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "group" });
    const countSteps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "count" });
    const currentIndex = groupSteps.findIndex(
      (step) => step.prayerId === "hail-mary" && step.decadeIndex === 2 && step.repeatCount === 10,
    );
    const nextIndex = findBestMatchingPrayerStepIndex({
      currentStep: groupSteps[currentIndex],
      nextSteps: countSteps,
      currentIndex,
      currentTotal: groupSteps.length,
    });

    expect(countSteps[nextIndex].title).toBe("Hail Mary 1 of 10");
    expect(countSteps[nextIndex].decadeIndex).toBe(2);
    expect(countSteps[nextIndex].repeatGroupId).toBe(groupSteps[currentIndex].repeatGroupId);
  });

  it("preserves non-repeated prayer position across repeated-prayer modes", () => {
    const countSteps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "count" });
    const groupSteps = createPrayerSteps(createTestGuide(), { repeatedPrayerMode: "group" });
    const ourFatherIndex = countSteps.findIndex(
      (step) => step.prayerId === "our-father" && step.decadeIndex === 3,
    );
    const gloryBeIndex = countSteps.findIndex(
      (step) => step.prayerId === "glory-be" && step.decadeIndex === 3,
    );
    const nextOurFatherIndex = findBestMatchingPrayerStepIndex({
      currentStep: countSteps[ourFatherIndex],
      nextSteps: groupSteps,
      currentIndex: ourFatherIndex,
      currentTotal: countSteps.length,
    });
    const nextGloryBeIndex = findBestMatchingPrayerStepIndex({
      currentStep: countSteps[gloryBeIndex],
      nextSteps: groupSteps,
      currentIndex: gloryBeIndex,
      currentTotal: countSteps.length,
    });

    expect(groupSteps[nextOurFatherIndex].prayerId).toBe("our-father");
    expect(groupSteps[nextOurFatherIndex].decadeIndex).toBe(3);
    expect(groupSteps[nextGloryBeIndex].prayerId).toBe("glory-be");
    expect(groupSteps[nextGloryBeIndex].decadeIndex).toBe(3);
  });

  it("falls back to approximate progress when no logical match exists", () => {
    const nextSteps: PrayerStep[] = Array.from({ length: 4 }, (_, index) => ({
      id: `fallback-${index}`,
      sourceFlowItemId: `fallback-${index}`,
      logicalStepKey: `fallback-${index}`,
      type: "text",
      title: `Fallback ${index}`,
    }));
    const currentStep: PrayerStep = {
      id: "missing",
      sourceFlowItemId: "missing",
      logicalStepKey: "missing",
      type: "text",
      title: "Missing",
    };

    expect(
      findBestMatchingPrayerStepIndex({
        currentStep,
        nextSteps,
        currentIndex: 5,
        currentTotal: 10,
      }),
    ).toBe(2);
  });

  it("respects mixed English, Latin, and Spanish guide settings", () => {
    const steps = createPrayerSteps(
      createTestGuide({
        prayerLanguageById: {
          "our-father": "la",
          "hail-mary": "es",
          "fatima-prayer": "en",
        },
      }),
      { repeatedPrayerMode: "group" },
    );

    expect(steps.some((step) => step.prayerId === "our-father" && step.body?.includes("Pater noster"))).toBe(true);
    expect(steps.some((step) => step.prayerId === "hail-mary" && step.body?.includes("Dios te salve, María"))).toBe(true);
    expect(steps.some((step) => step.prayerId === "fatima-prayer" && step.body?.includes("O my Jesus"))).toBe(true);
  });

  it("uses Spanish repeated Hail Mary text in grouped and counted modes", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "hail-mary": "es",
      },
    });
    const groupedSteps = createPrayerSteps(config, { repeatedPrayerMode: "group" });
    const countedSteps = createPrayerSteps(config, { repeatedPrayerMode: "count" });

    expect(groupedSteps.some((step) => step.prayerId === "hail-mary" && step.body?.includes("Dios te salve, María"))).toBe(true);
    expect(countedSteps.some((step) => step.prayerId === "hail-mary" && step.body?.includes("Dios te salve, María"))).toBe(true);
  });

  it("handles navigation boundaries", () => {
    expect(getNextPrayerStepIndex(0, 3)).toBe(1);
    expect(getNextPrayerStepIndex(2, 3)).toBe(3);
    expect(getNextPrayerStepIndex(3, 3)).toBe(3);
    expect(getPreviousPrayerStepIndex(2, 3)).toBe(1);
    expect(getPreviousPrayerStepIndex(0, 3)).toBe(0);
    expect(clampPrayerStepIndex(99, 3)).toBe(3);
    expect(clampPrayerStepIndex(-4, 3)).toBe(0);
  });
});

describe("card content generation", () => {
  it("includes selected sections, prayers, saints, and language variants", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "our-father": "es",
        "glory-be": "la",
      },
    });
    const generated = generateGuideCardsFromConfig(config, { cardSize: "full-1", cardCount: 1 }, fixedDate);
    const text = generatedText(generated.cards[0]);

    expect(text).toContain("Opening");
    expect(text).toContain("Hail, holy Queen");
    expect(text).toContain("St. Michael the Archangel");
    expect(text).toContain("Saint Joseph, pray for us.");
    expect(text).not.toContain("Memorare");
    expect(text).toContain("Padre nuestro");
    expect(text).toContain("Gloria Patri");
  });

  it("lets card-specific language overrides beat guide-level language", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "our-father": "en",
        "hail-mary": "es",
      },
    });
    const customization = createCustomization(config.id, {
      prayerLanguageOverrides: {
        "our-father": "la",
        "hail-mary": "en",
      },
    });
    const generated = generateGuideCardsFromConfig(config, { cardSize: "full-1", cardCount: 1 }, fixedDate, customization);

    expect(generatedText(generated.cards[0])).toContain("Pater noster");
    expect(generatedText(generated.cards[0])).toContain("Hail Mary...");
    expect(generatedText(generated.cards[0])).not.toContain("Dios te salve, María...");
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
    expect(text).toContain("Our Father, who art in heaven");
    expect(text).not.toContain("Our Father:");
    expect(text).not.toContain("Grip");
    expect(text).not.toContain("Remove");
  });

  it("renders compact and full prayer text without card-only label prefixes", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "hail-mary": "es",
        "fatima-prayer": "es",
      },
    });
    const generated = generateGuideCardsFromConfig(
      config,
      { cardSize: "full-1", cardCount: 1, fullPrayerIds: ["fatima-prayer", "sign-of-the-cross"] },
      fixedDate,
    );
    const text = generatedText(generated.cards[0]);

    expect(text).toContain("10x - Dios te salve, María...");
    expect(text).toContain("Glory be...");
    expect(text).toContain("Oh Jesús mío, perdona nuestros pecados");
    expect(text).toContain("In the name of the Father, and of the Son, and of the Holy Spirit. Amen.");
    expect(text).not.toContain("Oración de Fátima:");
    expect(text).not.toContain("Sign of the Cross:");
    expect(text).not.toContain("10 Ave Maria prayers");
  });

  it("renders Holy Father's Intentions as a compact group after the closing prayer", () => {
    const generated = generateGuideCardsFromConfig(createTestGuide(), { cardSize: "full-1", cardCount: 1 }, fixedDate);
    const sourceBlocks = generated.cards[0].sourceBlocks ?? allSides(generated.cards[0]).flatMap((side) => side.blocks);
    const compactGroupIndex = sourceBlocks.findIndex((block) =>
      block.sourceItemIds?.includes("holy-father-intentions:group"),
    );
    const closingPrayerIndex = sourceBlocks.findIndex((block) =>
      block.lines?.some((line) => line.includes("O God, whose Only Begotten Son")),
    );
    const additionalClosingIndex = sourceBlocks.findIndex((block) =>
      block.lines?.some((line) => line.includes("St. Michael the Archangel")),
    );
    const compactGroup = sourceBlocks[compactGroupIndex];

    expect(compactGroup?.type).toBe("compact-group");
    expect(compactGroup?.heading).toBe("Holy Father's Intentions");
    expect(compactGroup?.lines?.every((line) => line.startsWith("- "))).toBe(true);
    expect(compactGroup?.sourceItemIds).toEqual(["holy-father-intentions:group"]);
    expect(compactGroupIndex).toBeGreaterThan(closingPrayerIndex);
    expect(compactGroupIndex).toBeLessThan(additionalClosingIndex);
  });

  it("removes the Final heading while preserving the closing Sign of the Cross item", () => {
    const generated = generateGuideCardsFromConfig(
      createTestGuide({
        prayerLanguageById: {
          "sign-of-the-cross": "la",
        },
      }),
      { cardSize: "full-1", cardCount: 1, fullPrayerIds: ["sign-of-the-cross"] },
      fixedDate,
    );
    const sourceBlocks = generated.cards[0].sourceBlocks ?? allSides(generated.cards[0]).flatMap((side) => side.blocks);
    const finalSign = sourceBlocks.find((block) => block.id === "layout:final-sign:line-1");
    const text = generatedText(generated.cards[0]);

    expect(sourceBlocks.some((block) => block.heading === "Final")).toBe(false);
    expect(text).not.toContain("Final");
    expect(finalSign?.heading).toBeUndefined();
    expect(finalSign?.lines?.[0]).toBe("In nomine Patris, et Filii, et Spiritus Sancti. Amen.");
  });

  it("uses Spanish Sign of the Cross title for short cards and prayer text for full cards", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "sign-of-the-cross": "es",
      },
    });
    const compact = generateGuideCardsFromConfig(config, { cardSize: "full-1", cardCount: 1 }, fixedDate);
    const full = generateGuideCardsFromConfig(
      config,
      { cardSize: "full-1", cardCount: 1, fullPrayerIds: ["sign-of-the-cross"] },
      fixedDate,
    );

    expect(generatedText(compact.cards[0])).toContain("Señal de la Cruz");
    expect(generatedText(full.cards[0])).toContain("En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.");
    expect(generatedText(full.cards[0])).not.toContain("Señal de la Cruz:");
  });

  it("keeps mystery fruit text with its mystery as one editable unit", () => {
    const generated = generateGuideCardsFromConfig(
      createTestGuide(),
      { cardSize: "pocket-4", cardCount: 1 },
      fixedDate,
    );
    const mysteryItem = allSides(generated.cards[0])
      .flatMap((side) => side.blocks)
      .flatMap((block) => block.lines ?? [])
      .find((line) => line.includes("The First Sorrowful Mystery"));

    expect(mysteryItem).toBe(
      "1. The First Sorrowful Mystery is The Agony in the Garden. The fruit of this mystery is Sorrow for sin.",
    );
    expect(generatedText(generated.cards[0])).not.toMatch(/\nSorrow for sin\./);
  });

  it("renders added card-only items and reset removes them", () => {
    const config = createTestGuide();
    const customItems = [
      createGuideCardCustomItem({
        id: "custom-section",
        kind: "section",
        sectionId: "custom-section",
        text: "Walk Notes",
      }),
      createGuideCardCustomItem({
        id: "custom-note",
        kind: "note",
        sectionId: "custom-section",
        text: "Meet by the front steps.",
      }),
      createGuideCardCustomItem({
        id: "custom-leader-note",
        kind: "leader-note",
        sectionId: "custom-section",
        text: "Wait until the group has crossed safely.",
      }),
      createGuideCardCustomItem({
        id: "custom-intention",
        kind: "intention",
        sectionId: "custom-section",
        text: "For our parish families.",
      }),
      createGuideCardCustomItem({
        id: "custom-saint",
        kind: "saint-invocation",
        sectionId: "custom-section",
        text: "Saint Anne",
      }),
      createGuideCardCustomItem({
        id: "custom-prayer",
        kind: "prayer",
        sectionId: "custom-section",
        text: "Hail Mary",
        prayerId: "hail-mary",
        prayerLanguage: "es",
        printMode: "short",
      }),
      createGuideCardCustomItem({
        id: "custom-text",
        kind: "custom-text",
        sectionId: "custom-section",
        text: "Bring extra printed cards.",
      }),
    ];
    const customized = generateGuideCardsFromConfig(
      config,
      { cardSize: "full-1", cardCount: 1 },
      fixedDate,
      createCustomization(config.id, { customItems }),
    );
    const reset = generateGuideCardsFromConfig(
      config,
      { cardSize: "full-1", cardCount: 1 },
      fixedDate,
      createCustomization(config.id),
    );
    const text = generatedText(customized.cards[0]);

    expect(text).toContain("Walk Notes");
    expect(text).toContain("Meet by the front steps.");
    expect(text).toContain("Wait until the group has crossed safely.");
    expect(text).toContain("For our parish families.");
    expect(text).toContain("Saint Anne, pray for us.");
    expect(text).toContain("Dios te salve, María...");
    expect(text).toContain("Bring extra printed cards.");
    expect(generatedText(reset.cards[0])).not.toContain("Walk Notes");
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

  it("inserts added items after a visible target", () => {
    expect(insertEditableItemAfter(["a", "b", "c"], "new", "b")).toEqual(["a", "b", "new", "c"]);
    expect(insertEditableItemAfter(["a", "b", "c"], "new")).toEqual(["a", "b", "c", "new"]);
  });

  it("inserts added items above or below a selected visible target", () => {
    const ids = ["opening:heading", "opening:line-1", "opening:line-2"];

    expect(insertEditableItemRelative(ids, "new", "opening:line-1", "before")).toEqual([
      "opening:heading",
      "new",
      "opening:line-1",
      "opening:line-2",
    ]);
    expect(insertEditableItemRelative(ids, "new", "opening:line-1", "after")).toEqual([
      "opening:heading",
      "opening:line-1",
      "new",
      "opening:line-2",
    ]);
  });

  it("treats section headings as editable standalone items", () => {
    const config = createTestGuide();
    const baseline = generateGuideCardsFromConfig(config, { cardSize: "full-1", cardCount: 1 }, fixedDate);
    const itemIds = getVisibleEditableItemIds(allSides(baseline.cards[0]));
    const customized = generateGuideCardsFromConfig(
      config,
      { cardSize: "full-1", cardCount: 1 },
      fixedDate,
      createCustomization(config.id, {
        textOverrides: {
          "opening:heading": "Custom Opening",
        },
        removedItemIds: ["intentions:heading"],
      }),
    );
    const customizedIds = getVisibleEditableItemIds(allSides(customized.cards[0]));

    expect(itemIds).toContain("opening:heading");
    expect(itemIds).toContain("opening:line-1");
    expect(generatedText(customized.cards[0])).toContain("Custom Opening");
    expect(customizedIds).not.toContain("intentions:heading");
    expect(customizedIds).toContain("intentions:line-1");
    expect(findDuplicateIds(customizedIds)).toEqual([]);
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
  it("packs measured blocks front-first using the fewest faces", () => {
    const blocks = [
      createMeasuredTestBlock("a"),
      createMeasuredTestBlock("b"),
      createMeasuredTestBlock("c"),
    ];
    const heights = new Map(blocks.map((block) => [getGuideCardBlockKey(block), 5]));
    const packed = packGuideCardBlocksByHeight(blocks, heights, 10);

    expect(packed.sides.map((side) => side.map((block) => block.id))).toEqual([["a", "b"], ["c"]]);
    expect(packed.warnings).toEqual([]);
  });

  it("moves a heading with its first child instead of orphaning it", () => {
    const blocks = [
      createMeasuredTestBlock("intro"),
      createMeasuredTestBlock("section-heading", "heading", "Measured Section"),
      createMeasuredTestBlock("section-line"),
    ];
    const heights = new Map([
      ["intro", 8],
      ["section-heading", 4],
      ["section-line", 8],
    ]);
    const packed = packGuideCardBlocksByHeight(blocks, heights, 12);

    expect(packed.sides.map((side) => side.map((block) => block.id))).toEqual([
      ["intro"],
      ["section-heading", "section-line"],
    ]);
  });

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
    expect(sides.every((side) => side.blocks.every((block) => block.type === "heading" || !block.heading || (block.lines?.length ?? 0) > 0 || Boolean(block.body)))).toBe(true);

    if ((generated.cards[0].extraSides?.length ?? 0) > 0) {
      expect(generated.cards[0].front.blocks.length).toBeGreaterThan(0);
      expect(generated.cards[0].back?.blocks.length).toBeGreaterThan(0);
    }
  });
});

describe("mobile guide card actions", () => {
  it("shows full/short toggle for prayer items only", () => {
    const prayerActions = getMobileGuideCardActionItems(
      {
        itemType: "prayer",
        prayerId: "hail-mary",
        printMode: "short",
      },
      { canMoveUp: true, canMoveDown: true },
    );
    const headingActions = getMobileGuideCardActionItems(
      {
        itemType: "heading",
      },
      { canMoveUp: false, canMoveDown: true },
    );

    expect(prayerActions.map((action) => action.id)).toContain("toggle-full");
    expect(prayerActions.find((action) => action.id === "toggle-full")?.label).toBe("Show full prayer");
    expect(headingActions.map((action) => action.id)).not.toContain("toggle-full");
    expect(headingActions.find((action) => action.id === "move-up")?.enabled).toBe(false);
    expect(headingActions.find((action) => action.id === "move-down")?.enabled).toBe(true);
  });

  it("hides edit, remove, and full toggle when item capabilities do not support them", () => {
    const actions = getMobileGuideCardActionItems(
      {
        itemType: "prayer",
        prayerId: "our-father",
        printMode: "full",
        canToggleFullPrayer: false,
        canEdit: false,
        canDelete: false,
      },
      { canMoveUp: true, canMoveDown: false },
    );
    const actionIds = actions.map((action) => action.id);

    expect(actionIds).not.toContain("edit");
    expect(actionIds).not.toContain("toggle-full");
    expect(actionIds).not.toContain("remove");
    expect(actionIds).toEqual(["add-above", "add-below", "move-up", "move-down"]);
    expect(actions.find((action) => action.id === "move-down")?.enabled).toBe(false);
  });
});

describe("preview and print data parity", () => {
  it("uses the same generated content model for preview and print inputs", () => {
    const config = createTestGuide({
      prayerLanguageById: {
        "fatima-prayer": "es",
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
        "our-father": "es",
      },
      textOverrides: {
        "card:title": "Parity Test",
      },
    });
    const preview = generateGuideCardsFromConfig(config, options, fixedDate, customization);
    const print = generateGuideCardsFromConfig(config, options, fixedDate, customization);

    expect(print.cards[0]).toEqual(preview.cards[0]);
    expect(generatedText(print.cards[0])).toContain("Parity Test");
    expect(generatedText(print.cards[0])).toContain("Oh Jesús mío");
    expect(generatedText(print.cards[0])).toContain("Ave Maria");
    expect(generatedText(print.cards[0])).toContain("Padre nuestro");
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
        "our-father": "es",
        "not-a-prayer": "la",
      } as Record<string, "la" | "es">,
      customItems: [
        createGuideCardCustomItem({
          id: "good-custom-item",
          kind: "note",
          sectionId: "custom",
          text: "Keep me.",
        }),
        {
          id: "bad-custom-item",
          kind: "bad",
          sectionId: "custom",
          text: "Drop me.",
        },
      ] as unknown as GuideCardCustomization["customItems"],
      textOverrides: {
        keep: "yes",
        drop: 12 as unknown as string,
      },
    });
    const normalized = normalizeStoredGuideCardCustomizations([customization]);

    expect(normalized.items[0].itemOrder).toEqual(["a", "b"]);
    expect(normalized.items[0].removedItemIds).toEqual(["x"]);
    expect(normalized.items[0].fullPrayerOverrides).toEqual({ "our-father": true });
    expect(normalized.items[0].prayerLanguageOverrides).toEqual({ "our-father": "es" });
    expect(normalized.items[0].customItems?.map((item) => item.id)).toEqual(["good-custom-item"]);
    expect(normalized.items[0].textOverrides).toEqual({ keep: "yes" });
    expect(normalizeStoredGuideCardLayoutOptions({ cardSize: "bad", cardCount: 999 }).cardSize).toBe("pocket-4");
  });
});

describe("guide backup import and export", () => {
  it("exports a selected guide with backup metadata and related card customization", () => {
    const guide = createTestGuide({
      prayerLanguageById: {
        "our-father": "es",
        "hail-mary": "la",
      },
    });
    const customization = createCustomization(guide.id, {
      prayerLanguageOverrides: {
        "fatima-prayer": "es",
      },
      textOverrides: {
        "opening:line-1": "Custom backup line.",
      },
    });
    const backup = createGuideBackupFile({
      type: "single-guide",
      guides: [guide],
      cardCustomizations: [customization, createCustomization("other-guide")],
      exportedAt: fixedDate,
    });

    expect(backup.app).toBe("walk-the-rosary");
    expect(backup.version).toBe(1);
    expect(backup.exportedAt).toBe(fixedDate.toISOString());
    expect(backup.type).toBe("single-guide");
    expect(backup.guides).toHaveLength(1);
    expect(backup.guides[0].id).toBe(guide.id);
    expect(backup.guides[0].prayerLanguageById).toEqual({
      "our-father": "es",
      "hail-mary": "la",
    });
    expect(backup.cardCustomizations).toEqual([customization]);
    expect(backup.cardCustomizations[0].prayerLanguageOverrides).toEqual({
      "fatima-prayer": "es",
    });
    expect(createGuideBackupFilename(guide.name, "single-guide")).toBe(
      "walk-the-rosary-regression-test-guide.json",
    );
  });

  it("exports all guides with matching card customizations", () => {
    const firstGuide = createTestGuide({ id: "first-guide", name: "First Guide" });
    const secondGuide = createTestGuide({ id: "second-guide", name: "Second Guide" });
    const firstCustomization = createCustomization(firstGuide.id);
    const secondCustomization = createCustomization(secondGuide.id);
    const backup = createGuideBackupFile({
      type: "all-guides",
      guides: [firstGuide, secondGuide],
      cardCustomizations: [firstCustomization, secondCustomization, createCustomization("orphan")],
      exportedAt: fixedDate,
    });

    expect(backup.type).toBe("all-guides");
    expect(backup.guides.map((guide) => guide.id)).toEqual(["first-guide", "second-guide"]);
    expect(backup.cardCustomizations.map((customization) => customization.guideId)).toEqual([
      "first-guide",
      "second-guide",
    ]);
    expect(createGuideBackupFilename("", "all-guides")).toBe("walk-the-rosary-guides-backup.json");
  });

  it("imports a single guide and remaps duplicate guide IDs safely", () => {
    const existingGuide = createTestGuide({ id: "test-guide", name: "Regression Test Guide" });
    const backupGuide = createTestGuide({
      id: "test-guide",
      name: "Regression Test Guide",
      prayerLanguageById: {
        "hail-mary": "es",
      },
    });
    const backup = createGuideBackupFile({
      type: "single-guide",
      guides: [backupGuide],
      cardCustomizations: [createCustomization(backupGuide.id)],
      exportedAt: fixedDate,
    });
    const parsed = validateGuideBackupFile(backup);

    expect(parsed.ok).toBe(true);

    const result = prepareGuideBackupImport({
      backup,
      existingGuides: [existingGuide],
      existingCustomizations: [createCustomization(existingGuide.id)],
      createId: () => "imported-guide-id",
      now: fixedDate,
    });

    expect(result.importedGuideCount).toBe(1);
    expect(result.guides).toHaveLength(2);
    expect(result.guides[0].id).toBe(existingGuide.id);
    expect(result.guides[1].id).toBe("imported-guide-id");
    expect(result.guides[1].name).toBe("Regression Test Guide Copy");
    expect(result.guides[1].prayerLanguageById).toEqual(backupGuide.prayerLanguageById);
    expect(result.cardCustomizations.map((customization) => customization.guideId)).toEqual([
      "test-guide",
      "imported-guide-id",
    ]);
    expect(result.remappedGuideIds).toEqual({ "test-guide": "imported-guide-id" });
  });

  it("imports multiple guides and remaps related customizations", () => {
    const firstGuide = createTestGuide({ id: "first-guide", name: "First Guide" });
    const secondGuide = createTestGuide({ id: "second-guide", name: "Second Guide" });
    const backup = createGuideBackupFile({
      type: "all-guides",
      guides: [firstGuide, secondGuide],
      cardCustomizations: [createCustomization(firstGuide.id), createCustomization(secondGuide.id)],
      exportedAt: fixedDate,
    });
    const result = prepareGuideBackupImport({
      backup,
      existingGuides: [createTestGuide({ id: "first-guide", name: "First Guide" })],
      existingCustomizations: [],
      createId: () => "first-guide-copy",
      now: fixedDate,
    });

    expect(result.importedGuideCount).toBe(2);
    expect(result.guides.map((guide) => guide.id)).toEqual([
      "first-guide",
      "first-guide-copy",
      "second-guide",
    ]);
    expect(result.cardCustomizations.map((customization) => customization.guideId)).toEqual([
      "first-guide-copy",
      "second-guide",
    ]);
  });

  it("rejects invalid backup JSON without producing import data", () => {
    expect(parseGuideBackupJson("{bad json").ok).toBe(false);
    expect(parseGuideBackupJson(JSON.stringify({ app: "other", guides: [] })).ok).toBe(false);
    expect(parseGuideBackupJson(JSON.stringify({ app: "walk-the-rosary", version: 1, type: "single-guide", exportedAt: fixedDate.toISOString(), guides: [] })).ok).toBe(false);
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
    customItems: [],
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

function createMeasuredTestBlock(
  id: string,
  type: GuideCardBlock["type"] = "instruction",
  heading?: string,
): GuideCardBlock {
  return {
    id,
    layoutInstanceId: id,
    type,
    heading,
    lines: type === "heading" ? undefined : [`${id} text`],
    estimatedWeight: 1,
    sourceItemIds: [id],
    editableItems: [
      {
        id,
        type: type === "heading" ? "heading" : "text",
        sectionId: id,
        currentText: heading ?? `${id} text`,
        order: 0,
      },
    ],
  };
}

function hasEmptyFaceBeforeNonEmpty(sides: GuideCardSide[]): boolean {
  return sides.some(
    (side, index) => side.blocks.length > 0 && sides.slice(0, index).some((previous) => previous.blocks.length === 0),
  );
}
