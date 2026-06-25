import { prayersById } from "@/content/prayers";
import { getMysterySetForConfig } from "@/lib/rosary/buildRosaryFlow";
import {
  clampCardCount,
  getCardsPerPage,
  normalizeGuideCardLayoutOptions,
} from "@/lib/rosary/cardUtils";
import { createDefaultUserConfigFromTemplate, normalizeRosaryConfig } from "@/lib/rosary/configUtils";
import {
  getCompactPrayerText,
  getFullPrayerTextForCards,
  normalizePrayerTextForCards,
} from "@/lib/rosary/prayerText";
import { getGuideCardLayout } from "@/lib/rosary/guideCardLayouts";
import type {
  CustomGuidanceInsertionPoint,
  GeneratedGuideCard,
  GeneratedGuideCardSet,
  GuideCardBlock,
  GuideCardLayoutOptions,
  GuideCardSide,
  MysterySet,
  Prayer,
  PrayerId,
  RosaryStep,
  UserRosaryConfig,
} from "@/lib/rosary/types";

const openingPrayerIds: PrayerId[] = [
  "sign-of-the-cross",
  "apostles-creed",
  "our-father",
  "hail-mary",
  "glory-be",
];

const prayerOptionOrder: PrayerId[] = [
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

const closingOrder: PrayerId[] = [
  "hail-holy-queen",
  "closing-prayer",
  "memorare",
  "st-michael-prayer",
];

const guidancePointsForFront: CustomGuidanceInsertionPoint[] = [
  "beginning",
  "before-opening",
  "after-opening",
  "before-decades",
];

const guidancePointsForBack: CustomGuidanceInsertionPoint[] = [
  "before-closing",
  "after-closing",
  "end",
];

export function createDefaultGeneratedGuideConfig(): UserRosaryConfig {
  return normalizeRosaryConfig(createDefaultUserConfigFromTemplate("standard-rosary"));
}

export function generateGuideCardsFromConfig(
  inputConfig: UserRosaryConfig,
  inputOptions: Partial<GuideCardLayoutOptions> | number = {},
  date = new Date(),
): GeneratedGuideCardSet {
  const config = normalizeRosaryConfig(inputConfig);
  const options =
    typeof inputOptions === "number"
      ? normalizeGuideCardLayoutOptions({ cardCount: inputOptions })
      : normalizeGuideCardLayoutOptions(inputOptions);
  const layoutOptions = {
    ...options,
    fullPrayerIds: options.fullPrayerIds.filter((id) =>
      getRelevantGuidePrayerOptions(config).some((prayer) => prayer.id === id),
    ),
  };
  const cardCount = clampCardCount(layoutOptions.cardCount);
  const mysterySet = getMysterySetForConfig(config, date);
  const warnings: string[] = [];
  const blocks = buildOrderedGuideBlocks(config, mysterySet, layoutOptions, warnings);
  const { front, back, extraSides } = layoutBlocksAcrossSides(
    blocks,
    config.name?.trim() || "Rosary Walk Guide",
    mysterySet.title,
    layoutOptions,
    warnings,
  );
  const cards = Array.from({ length: cardCount }, (_, index) =>
    buildGeneratedGuideCard(index + 1, front, back, extraSides, layoutOptions),
  );

  return {
    id: `generated-guide-cards-${config.id}`,
    name: `${config.name || "Rosary Walk Guide"} Cards`,
    sourceRosaryConfigId: config.id,
    sourceRosaryConfigName: config.name || "Rosary Walk Guide",
    cardCount,
    mysterySetTitle: mysterySet.title,
    mysterySetModeLabel:
      config.mysterySetMode === "today" ? "Today's mysteries" : "Manually selected mysteries",
    generatedAt: new Date().toISOString(),
    cards,
    warnings: [...new Set(warnings)],
    layoutOptions: { ...layoutOptions, cardCount },
    cardsPerPage: getCardsPerPage(layoutOptions.cardSize),
  };
}

export function getRelevantGuidePrayerOptions(config: UserRosaryConfig): Prayer[] {
  const normalizedConfig = normalizeRosaryConfig(config);
  const ids = new Set<PrayerId>();

  normalizedConfig.steps
    .filter((step) => step.enabled !== false && step.prayerId)
    .forEach((step) => {
      if (step.prayerId && prayerOptionOrder.includes(step.prayerId)) {
        ids.add(step.prayerId);
      }
    });

  if (hasFatimaPrayer(normalizedConfig)) {
    ids.add("fatima-prayer");
  }

  normalizedConfig.selectedClosingPrayerIds.forEach((id) => {
    if (prayerOptionOrder.includes(id)) {
      ids.add(id);
    }
  });

  return prayerOptionOrder
    .filter((id) => ids.has(id))
    .map((id) => prayersById[id])
    .filter(Boolean);
}

export function chunkCardsForPrint<T>(cards: T[], cardsPerPage: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < cards.length; index += cardsPerPage) {
    chunks.push(cards.slice(index, index + cardsPerPage));
  }

  return chunks;
}

function buildGeneratedGuideCard(
  cardNumber: number,
  front: GuideCardSide,
  back: GuideCardSide | undefined,
  extraSides: GuideCardSide[],
  layoutOptions: GuideCardLayoutOptions,
): GeneratedGuideCard {
  return {
    id: `generated-card-${cardNumber}`,
    cardNumber,
    front,
    back,
    extraSides,
    layoutOptions,
  };
}

function buildOrderedGuideBlocks(
  config: UserRosaryConfig,
  mysterySet: MysterySet,
  options: GuideCardLayoutOptions,
  warnings: string[],
): GuideCardBlock[] {
  const closingLines = buildClosingSummary(config, options);
  const saintBlock = buildSaintInvocationBlock(config);
  const guidanceLines = buildConciseGuidance(config, guidancePointsForBack, warnings);
  const leaderLines = buildLeaderNoteSummary(config, warnings);

  const blocks: GuideCardBlock[] = [
    sectionBlock("opening", "Opening", buildOpeningSummary(config, options), "prayer"),
    sectionBlock("intentions", "Intentions", [
      "At this time, please offer your intentions.",
      "[pause]",
      ...buildConciseGuidance(config, guidancePointsForFront, warnings),
    ]),
    sectionBlock("each-decade", "Each Decade", buildDecadeSummary(config)),
    {
      id: "mystery-set",
      type: "mystery-list",
      heading: mysterySet.title,
      lines: buildMysterySummary(mysterySet),
      estimatedWeight: estimateLines(buildMysterySummary(mysterySet), 44) + 2,
      keepTogether: true,
      priority: "required",
      sectionGroup: "mysteries",
    } satisfies GuideCardBlock,
    ...(closingLines.length > 0
      ? [sectionBlock("closing", "Closing", closingLines, "prayer")]
      : []),
    sectionBlock("holy-father-intentions", "Holy Father's Intentions", [
      compactPrayerText("our-father"),
      compactPrayerText("hail-mary"),
      compactPrayerText("glory-be"),
    ]),
    ...(saintBlock ? [saintBlock] : []),
    ...(guidanceLines.length > 0
      ? [sectionBlock("custom-guidance", "Guide Notes", guidanceLines, "custom-guidance", true)]
      : []),
    ...(leaderLines.length > 0
      ? [sectionBlock("leader-notes", "Leader Notes", leaderLines, "custom-guidance", true, true)]
      : []),
    sectionBlock("final-sign", "Final", [compactPrayerText("sign-of-the-cross")], "prayer"),
  ];

  return blocks.filter((block) => block.lines?.length || block.body);
}

function layoutBlocksAcrossSides(
  blocks: GuideCardBlock[],
  title: string,
  mysterySetTitle: string,
  options: GuideCardLayoutOptions,
  warnings: string[],
): { front: GuideCardSide; back?: GuideCardSide; extraSides: GuideCardSide[] } {
  const layout = getGuideCardLayout(options.cardSize);
  const capacity = layout.capacity;
  const totalWeight = blocks.reduce((total, block) => total + block.estimatedWeight, 0);

  blocks
    .filter((block) => block.estimatedWeight > capacity)
    .forEach((block) => {
      warnings.push(
        `${block.heading ?? "A section"} may be too large for one ${layout.shortLabel} card face. It is kept together to avoid awkward splits.`,
      );
    });

  if (totalWeight <= capacity) {
    return {
      front: createSide("front", title, `${mysterySetTitle} guide`, blocks),
      extraSides: [],
    };
  }

  if (totalWeight <= capacity * 2) {
    const splitIndex = findBalancedSplitIndex(blocks, capacity);
    const frontBlocks = blocks.slice(0, splitIndex);
    const backBlocks = blocks.slice(splitIndex);
    addSideDensityWarnings(frontBlocks, backBlocks, capacity, options, warnings);

    return {
      front: createSide("front", title, `${mysterySetTitle} guide`, frontBlocks),
      back: createSide("back", title, "Continued", backBlocks),
      extraSides: [],
    };
  }

  warnings.push(
    `This ${layout.shortLabel} layout is too dense for two sides. Choose a larger card size or print fewer prayers in full.`,
  );

  const sides = packBlocksIntoSides(blocks, capacity);
  const [frontBlocks, backBlocks, ...extraBlockGroups] = sides;

  return {
    front: createSide("front", title, `${mysterySetTitle} guide`, frontBlocks ?? []),
    back: backBlocks?.length ? createSide("back", title, "Continued", backBlocks) : undefined,
    extraSides: extraBlockGroups.map((extraBlocks, index) =>
      createSide(`extra-${index + 1}`, title, "Continued", extraBlocks),
    ),
  };
}

function findBalancedSplitIndex(blocks: GuideCardBlock[], capacity: number): number {
  const totalWeight = blocks.reduce((total, block) => total + block.estimatedWeight, 0);
  let bestIndex = 1;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let index = 1; index < blocks.length; index += 1) {
    const frontWeight = blocks.slice(0, index).reduce((total, block) => total + block.estimatedWeight, 0);
    const backWeight = totalWeight - frontWeight;
    const overflowPenalty =
      Math.max(0, frontWeight - capacity) * 20 + Math.max(0, backWeight - capacity) * 20;
    const balancePenalty = Math.abs(frontWeight - totalWeight / 2);
    const score = overflowPenalty + balancePenalty;

    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function packBlocksIntoSides(blocks: GuideCardBlock[], capacity: number): GuideCardBlock[][] {
  const sides: GuideCardBlock[][] = [];
  let current: GuideCardBlock[] = [];
  let currentWeight = 0;

  blocks.forEach((block) => {
    if (current.length > 0 && currentWeight + block.estimatedWeight > capacity) {
      sides.push(current);
      current = [];
      currentWeight = 0;
    }

    current.push(block);
    currentWeight += block.estimatedWeight;
  });

  if (current.length > 0) {
    sides.push(current);
  }

  return sides;
}

function addSideDensityWarnings(
  frontBlocks: GuideCardBlock[],
  backBlocks: GuideCardBlock[],
  capacity: number,
  options: GuideCardLayoutOptions,
  warnings: string[],
) {
  const layout = getGuideCardLayout(options.cardSize);
  const frontWeight = frontBlocks.reduce((total, block) => total + block.estimatedWeight, 0);
  const backWeight = backBlocks.reduce((total, block) => total + block.estimatedWeight, 0);

  if (frontWeight > capacity || backWeight > capacity) {
    warnings.push(
      `This ${layout.shortLabel} layout is dense. Choose a larger card size or print fewer prayers in full if readability matters.`,
    );
  }
}

function sectionBlock(
  id: string,
  heading: string,
  lines: string[],
  type: GuideCardBlock["type"] = "instruction",
  compact = true,
  leaderOnly = false,
): GuideCardBlock {
  return {
    id,
    type,
    heading,
    lines,
    estimatedWeight: estimateLines(lines, compact ? 50 : 58) + 1.6,
    keepTogether: true,
    priority: type === "custom-guidance" ? "optional" : "required",
    compact,
    leaderOnly,
    sectionGroup: id,
  };
}

function createSide(
  id: string,
  title: string,
  subtitle: string,
  blocks: GuideCardBlock[],
): GuideCardSide {
  return {
    id,
    title,
    subtitle,
    blocks,
    overflowWarnings: [],
  };
}

function buildOpeningSummary(
  config: UserRosaryConfig,
  options: GuideCardLayoutOptions = normalizeGuideCardLayoutOptions({}),
): string[] {
  const firstDecadeOrder =
    config.steps
      .filter((step) => step.enabled !== false && step.type === "decade")
      .map((step) => step.order)
      .sort((a, b) => a - b)[0] ?? Number.POSITIVE_INFINITY;
  const openingSteps = config.steps
    .filter((step) => step.enabled !== false)
    .filter((step) => step.order < firstDecadeOrder)
    .filter((step) => step.type === "prayer" || step.type === "prayer-group")
    .filter((step) => step.prayerId && openingPrayerIds.includes(step.prayerId))
    .sort((a, b) => a.order - b.order);
  const steps = openingSteps.length > 0 ? openingSteps : fallbackOpeningSteps();

  return steps.map((step) => formatOpeningStep(step, options));
}

function formatOpeningStep(step: RosaryStep, options: GuideCardLayoutOptions): string {
  if (step.prayerId === "hail-mary" && (step.repeatCount ?? step.repeat ?? 1) === 3) {
    return "Three Hail Marys for faith, hope, and charity";
  }

  if (step.prayerId) {
    return formatPrayerForCard(step.prayerId, options.fullPrayerIds.includes(step.prayerId));
  }

  return step.title;
}

function buildClosingSummary(
  config: UserRosaryConfig,
  options: GuideCardLayoutOptions = normalizeGuideCardLayoutOptions({}),
): string[] {
  return closingOrder
    .filter((prayerId) => config.selectedClosingPrayerIds.includes(prayerId))
    .map((prayerId) => formatPrayerForCard(prayerId, options.fullPrayerIds.includes(prayerId)));
}

export function buildMysterySummary(mysterySet: MysterySet): string[] {
  const setName = mysterySet.title.replace(" Mysteries", "");

  return mysterySet.mysteries.map((mystery) => {
    const fruit = mystery.fruitOfMystery
      ? ` The fruit of this mystery is ${mystery.fruitOfMystery}.`
      : "";

    return `${mystery.number}. The ${ordinalWord(mystery.number)} ${setName} Mystery is ${mystery.title}.${fruit}`;
  });
}

export function buildDecadeSummary(config: UserRosaryConfig): string[] {
  return [
    "Announce the mystery and fruit.",
    compactPrayerText("our-father"),
    "10 Hail Marys...",
    compactPrayerText("glory-be"),
    ...(hasFatimaPrayer(config) ? [compactPrayerText("fatima-prayer")] : []),
  ];
}

function formatPrayerForCard(prayerId: PrayerId, full: boolean): string {
  const prayer = prayersById[prayerId];

  if (!full) {
    return compactPrayerText(prayerId);
  }

  return `${prayer.title}: ${getFullPrayerTextForCards(prayer)}`;
}

function compactPrayerText(prayerId: PrayerId): string {
  return getCompactPrayerText(prayersById[prayerId]);
}

function buildSaintInvocationBlock(config: UserRosaryConfig): GuideCardBlock | undefined {
  if (!config.saintInvocations.enabled) {
    return undefined;
  }

  const saints = config.saintInvocations.saints.map((saint) => saint.trim()).filter(Boolean);

  if (saints.length === 0) {
    return undefined;
  }

  return sectionBlock(
    "saint-invocations",
    "Saint Invocations",
    saints.map((saint) => `${saint}, pray for us.`),
    "invocation-list",
  );
}

function buildConciseGuidance(
  config: UserRosaryConfig,
  insertionPoints: CustomGuidanceInsertionPoint[],
  warnings: string[],
): string[] {
  return config.customGuidance
    .filter((item) => insertionPoints.includes(item.insertionPoint))
    .slice(0, 3)
    .map((item) => `${item.title}: ${truncateForCard(item.text, warnings, item.title)}`);
}

function buildLeaderNoteSummary(config: UserRosaryConfig, warnings: string[]): string[] {
  const stepNotes = config.steps
    .filter((step) => step.enabled !== false && step.leaderOnly && step.text)
    .slice(0, 3)
    .map((step) => `${step.title}: ${truncateForCard(step.text ?? "", warnings, step.title)}`);

  const customNotes = config.customGuidance
    .filter((item) => item.stepType === "leader-note")
    .slice(0, 2)
    .map((item) => `${item.title}: ${truncateForCard(item.text, warnings, item.title)}`);

  return [...stepNotes, ...customNotes];
}

function fallbackOpeningSteps(): RosaryStep[] {
  return openingPrayerIds.map((prayerId, index) => ({
    id: `fallback-${prayerId}`,
    type: prayerId === "hail-mary" ? "prayer-group" : "prayer",
    title: prayersById[prayerId].title,
    prayerId,
    repeatCount: prayerId === "hail-mary" ? 3 : 1,
    order: index,
  }));
}

function hasFatimaPrayer(config: UserRosaryConfig): boolean {
  return config.steps.some(
    (step) =>
      step.enabled !== false &&
      ((step.prayerId === "fatima-prayer") ||
        (step.type === "decade" && (step.text ?? "").toLowerCase().includes("fatima"))),
  );
}

function truncateForCard(text: string, warnings: string[], label: string): string {
  const cleaned = normalizePrayerTextForCards(text);

  if (cleaned.length <= 160) {
    return cleaned;
  }

  warnings.push(`${label} was shortened for pocket card fit.`);
  return `${cleaned.slice(0, 157).trim()}...`;
}

function estimateLines(lines: string[], charsPerWeight: number): number {
  return lines.reduce((total, line) => total + estimateText(line, charsPerWeight), 0);
}

function estimateText(text: string, charsPerWeight: number): number {
  return Math.max(1, Math.ceil(normalizePrayerTextForCards(text).length / charsPerWeight));
}

function ordinalWord(value: number): string {
  if (value === 1) return "First";
  if (value === 2) return "Second";
  if (value === 3) return "Third";
  if (value === 4) return "Fourth";
  if (value === 5) return "Fifth";
  return `${value}th`;
}
