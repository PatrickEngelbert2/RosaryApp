import { mysteriesById, mysterySetsById } from "@/content/mysteries";
import { prayersById } from "@/content/prayers";
import {
  createDefaultUserConfigFromTemplate,
  normalizeRosaryConfig,
} from "@/lib/rosary/configUtils";
import { getTodaysMysteries } from "@/lib/rosary/getTodaysMysteries";
import { getPrayerLanguage, getPrayerVariant } from "@/lib/rosary/prayerText";
import { getSaintInvocationNames } from "@/lib/rosary/saintInvocations";
import type {
  CustomGuidanceInsertionPoint,
  Mystery,
  MysterySet,
  PrayerId,
  RenderedRosaryStep,
  RosaryStep,
  UserRosaryConfig,
} from "@/lib/rosary/types";

type LegacyBuildOptions = {
  mysterySet: MysterySet;
};

export function buildRosaryFlow(
  input: UserRosaryConfig | LegacyBuildOptions = createDefaultUserConfigFromTemplate(),
): RenderedRosaryStep[] {
  if ("mysterySet" in input) {
    return buildFromSteps(createDefaultUserConfigFromTemplate(), input.mysterySet);
  }

  const config = normalizeRosaryConfig(input);
  const mysterySet =
    config.mysterySetMode === "today"
      ? getTodaysMysteries()
      : mysterySetsById[config.selectedMysterySetId];

  return buildFromSteps(config, mysterySet);
}

function buildFromSteps(config: UserRosaryConfig, mysterySet: MysterySet): RenderedRosaryStep[] {
  const sortedTemplateSteps = config.steps
    .filter((step) => step.enabled !== false)
    .filter((step) => !isTemplateClosingPrayer(step))
    .sort((a, b) => a.order - b.order)
    .filter((step) => !step.id.startsWith("custom-step"));

  const rendered: RenderedRosaryStep[] = [
    ...renderGuidance(config, "beginning", 1),
    ...renderGuidance(config, "before-opening", 2),
  ];

  sortedTemplateSteps.forEach((step) => {
    if (step.type === "decade") {
      rendered.push(...renderGuidance(config, "after-opening", step.order - 0.3));
      rendered.push(...renderGuidance(config, "before-decades", step.order - 0.2));
      rendered.push(...renderStep(step, mysterySet, config));
      return;
    }

    if (isClosingHeading(step)) {
      rendered.push(...renderGuidance(config, "before-closing", step.order - 0.2));
      rendered.push(...renderStep(step, mysterySet, config));
      rendered.push(...renderSelectedClosings(config, step.order + 0.1));
      rendered.push(...renderSaintInvocations(config, step.order + 0.2));
      rendered.push(...renderGuidance(config, "after-closing", step.order + 0.3));
      return;
    }

    rendered.push(...renderStep(step, mysterySet, config));
  });

  rendered.push(...renderGuidance(config, "end", 999));

  return rendered.sort((a, b) => a.order - b.order);
}

function renderStep(
  step: RosaryStep,
  mysterySet: MysterySet,
  config: UserRosaryConfig,
): RenderedRosaryStep[] {
  if (step.type === "decade") {
    return mysterySet.mysteries.flatMap((mystery) => renderDecade(step, mystery, config));
  }

  if (step.type === "prayer" && step.prayerId) {
    const prayer = getPrayerForConfig(step.prayerId, config);
    const repeat = step.repeat ?? 1;

    return [
      {
        id: step.id,
        type: repeat > 1 ? "prayer-group" : "prayer",
        title: prayer.title || step.title,
        prayer,
        text: prayer.text,
        repeatCount: repeat,
        description: step.description,
        defaultCollapsed: step.defaultCollapsed ?? config.preferences.defaultCollapseKnownPrayers,
        leaderOnly: step.leaderOnly ?? false,
        cardEligible: step.cardEligible ?? true,
        order: step.order,
      },
    ];
  }

  if (step.type === "prayer-group" && step.prayerId) {
    const prayer = getPrayerForConfig(step.prayerId, config);
    const repeat = step.repeatCount ?? step.repeat ?? 1;

    return [
      {
        id: step.id,
        type: "prayer-group",
        title: prayer.title || step.title,
        prayer,
        text: prayer.text,
        repeatCount: repeat,
        description: step.description,
        defaultCollapsed: step.defaultCollapsed ?? config.preferences.defaultCollapseKnownPrayers,
        leaderOnly: step.leaderOnly ?? false,
        cardEligible: step.cardEligible ?? true,
        order: step.order,
      },
    ];
  }

  if (step.type === "section-heading" && !step.title.trim()) {
    return [];
  }

  if (step.type === "section-heading") {
    return [
      {
        id: step.id,
        type: step.type,
        title: step.title,
        text: step.text,
        description: step.description,
        defaultCollapsed: false,
        leaderOnly: step.leaderOnly ?? false,
        cardEligible: false,
        order: step.order,
      },
    ];
  }

  const mystery = step.mysteryId ? mysteriesById[step.mysteryId] : undefined;

  return [
    {
      id: step.id,
      type: step.type,
      title: step.title,
      mystery,
      text: step.text,
      description: step.description,
      defaultCollapsed: step.defaultCollapsed ?? false,
      leaderOnly: step.leaderOnly ?? false,
      cardEligible: step.cardEligible ?? false,
      order: step.order,
    },
  ];
}

export function expandRepeatedPrayerStep(step: RenderedRosaryStep): RenderedRosaryStep[] {
  if (!step.prayer || (step.repeatCount ?? 1) <= 1) {
    return [step];
  }

  return Array.from({ length: step.repeatCount ?? 1 }, (_, index) => ({
    ...step,
    id: `${step.id}-${index + 1}`,
    type: "prayer",
    title: `${step.prayer?.title ?? step.title} ${index + 1}`,
    repeatCount: 1,
    order: step.order + index / 100,
  }));
}

function renderDecade(
  step: RosaryStep,
  mystery: Mystery,
  config: UserRosaryConfig,
): RenderedRosaryStep[] {
  const baseOrder = step.order + mystery.number;
  const collapse = step.defaultCollapsed ?? config.preferences.defaultCollapseKnownPrayers;

  const steps: RenderedRosaryStep[] = [
    ...renderGuidance(config, "before-each-decade", baseOrder - 0.05, mystery.number),
    {
      id: `${step.id}-${mystery.id}-mystery`,
      type: "mystery",
      title: mystery.title,
      mystery,
      text: mystery.reflection,
      description: mystery.description,
      defaultCollapsed: false,
      leaderOnly: false,
      cardEligible: true,
      order: baseOrder,
    },
    {
      id: `${step.id}-${mystery.id}-our-father`,
      type: "prayer",
      title: getPrayerForConfig("our-father", config).title,
      prayer: getPrayerForConfig("our-father", config),
      text: getPrayerForConfig("our-father", config).text,
      defaultCollapsed: collapse,
      leaderOnly: false,
      cardEligible: true,
      order: baseOrder + 0.1,
    },
  ];

  steps.push({
    id: `${step.id}-${mystery.id}-hail-marys`,
    type: "prayer-group",
    title: getPrayerForConfig("hail-mary", config).title,
    prayer: getPrayerForConfig("hail-mary", config),
    text: getPrayerForConfig("hail-mary", config).text,
    repeatCount: 10,
    defaultCollapsed: collapse,
    leaderOnly: false,
    cardEligible: true,
    order: baseOrder + 0.2,
  });

  steps.push(
    {
      id: `${step.id}-${mystery.id}-glory-be`,
      type: "prayer",
      title: getPrayerForConfig("glory-be", config).title,
      prayer: getPrayerForConfig("glory-be", config),
      text: getPrayerForConfig("glory-be", config).text,
      defaultCollapsed: collapse,
      leaderOnly: false,
      cardEligible: true,
      order: baseOrder + 0.3,
    },
    {
      id: `${step.id}-${mystery.id}-fatima-prayer`,
      type: "prayer",
      title: getPrayerForConfig("fatima-prayer", config).title,
      prayer: getPrayerForConfig("fatima-prayer", config),
      text: getPrayerForConfig("fatima-prayer", config).text,
      description: step.text,
      defaultCollapsed: collapse,
      leaderOnly: false,
      cardEligible: true,
      order: baseOrder + 0.4,
    },
  );

  steps.push(...renderGuidance(config, "after-each-decade", baseOrder + 0.5, mystery.number));

  return steps;
}

function renderSelectedClosings(config: UserRosaryConfig, baseOrder: number): RenderedRosaryStep[] {
  return config.selectedClosingPrayerIds
    .filter((prayerId) => prayersById[prayerId])
    .map((prayerId, index) => {
      const resolvedPrayer = getPrayerForConfig(prayerId, config);

      return {
        id: `selected-closing-${prayerId}`,
        type: "prayer",
        title: resolvedPrayer.title,
        prayer: resolvedPrayer,
        text: resolvedPrayer.text,
        defaultCollapsed: config.preferences.defaultCollapseKnownPrayers,
        leaderOnly: false,
        cardEligible: true,
        order: baseOrder + index / 10,
      };
    });
}

function getPrayerForConfig(prayerId: PrayerId, config: UserRosaryConfig) {
  const prayer = prayersById[prayerId];
  const variant = getPrayerVariant(prayer, getPrayerLanguage(prayerId, config.prayerLanguageById));

  return {
    ...prayer,
    title: variant.title,
    incipit: variant.incipit,
    text: variant.text,
    shortText: variant.shortText,
  };
}

function renderSaintInvocations(
  config: UserRosaryConfig,
  baseOrder: number,
): RenderedRosaryStep[] {
  if (!config.saintInvocations.enabled) {
    return [];
  }

  const saints = getSaintInvocationNames(config.saintInvocations);

  if (saints.length === 0) {
    return [];
  }

  return [
    {
      id: "saint-invocations",
      type: "custom-text",
      title: "Saint Invocations",
      text: saints.map((saint) => `${saint}, pray for us.`).join("\n"),
      defaultCollapsed: false,
      leaderOnly: false,
      cardEligible: true,
      order: baseOrder,
    },
  ];
}

function renderGuidance(
  config: UserRosaryConfig,
  insertionPoint: CustomGuidanceInsertionPoint,
  baseOrder: number,
  decadeNumber?: number,
): RenderedRosaryStep[] {
  return config.customGuidance
    .filter((item) => item.insertionPoint === insertionPoint)
    .map((item, index) => ({
      id: decadeNumber ? `${item.id}-decade-${decadeNumber}` : item.id,
      type: item.stepType,
      title: decadeNumber ? `${item.title} (${decadeNumber})` : item.title,
      text: item.text,
      defaultCollapsed: false,
      leaderOnly: item.stepType === "leader-note",
      cardEligible: true,
      order: baseOrder + index / 100,
    }));
}

function isTemplateClosingPrayer(step: RosaryStep): boolean {
  return step.optional === true && step.type === "prayer" && Boolean(step.prayerId);
}

function isClosingHeading(step: RosaryStep): boolean {
  return step.id.includes("closing") && step.type === "section-heading";
}

export function getMysterySetForConfig(config: UserRosaryConfig, date = new Date()): MysterySet {
  const normalized = normalizeRosaryConfig(config);

  return normalized.mysterySetMode === "today"
    ? getTodaysMysteries(date)
    : mysterySetsById[normalized.selectedMysterySetId];
}
