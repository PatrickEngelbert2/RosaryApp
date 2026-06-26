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
import type { GuideCardLayoutDefinition } from "@/lib/rosary/guideCardLayouts";
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
  const layout = getGuideCardLayout(layoutOptions.cardSize);
  const blocks = buildOrderedGuideBlocks(config, mysterySet, layoutOptions, layout, warnings);
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
  layout: GuideCardLayoutDefinition,
  warnings: string[],
): GuideCardBlock[] {
  const closingLines = buildClosingSummary(config, options);
  const saintBlock = buildSaintInvocationBlock(config, layout);
  const guidanceLines = buildConciseGuidance(config, guidancePointsForBack, warnings);
  const leaderLines = buildLeaderNoteSummary(config, warnings);
  const mysteryLines = buildMysterySummary(mysterySet);

  const blocks: GuideCardBlock[] = [
    sectionBlock("opening", "Opening", buildOpeningSummary(config, options), layout, "prayer"),
    sectionBlock("intentions", "Intentions", [
      "At this time, please offer your intentions.",
      "[pause]",
      ...buildConciseGuidance(config, guidancePointsForFront, warnings),
    ], layout),
    sectionBlock("each-decade", "Each Decade", buildDecadeSummary(config, options), layout),
    {
      id: "mystery-set",
      type: "mystery-list",
      heading: mysterySet.title,
      lines: mysteryLines,
      estimatedWeight: estimateBlockWeight(mysteryLines, layout, false),
      sourceItemIds: makeLineSourceItemIds("mystery-set", mysteryLines),
      keepTogether: true,
      priority: "required",
      sectionGroup: "mysteries",
    } satisfies GuideCardBlock,
    ...(closingLines.length > 0
      ? [sectionBlock("closing", "Closing", closingLines, layout, "prayer")]
      : []),
    sectionBlock("holy-father-intentions", "Holy Father's Intentions", [
      formatPrayerForCard("our-father", options.fullPrayerIds.includes("our-father")),
      formatPrayerForCard("hail-mary", options.fullPrayerIds.includes("hail-mary")),
      formatPrayerForCard("glory-be", options.fullPrayerIds.includes("glory-be")),
    ], layout),
    ...(saintBlock ? [saintBlock] : []),
    ...(guidanceLines.length > 0
      ? [sectionBlock("custom-guidance", "Guide Notes", guidanceLines, layout, "custom-guidance", true)]
      : []),
    ...(leaderLines.length > 0
      ? [sectionBlock("leader-notes", "Leader Notes", leaderLines, layout, "custom-guidance", true, true)]
      : []),
    sectionBlock("final-sign", "Final", [compactPrayerText("sign-of-the-cross")], layout, "prayer"),
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
  const sourceItemIds = collectSourceItemIds(blocks);

  blocks
    .filter((block) => block.estimatedWeight > capacity)
    .forEach((block) => {
      warnings.push(
        `${block.heading ?? "A section"} may be too large for one ${layout.shortLabel} card face. It will continue on another face if needed.`,
      );
    });

  if (totalWeight <= capacity) {
    const result = {
      front: createSide("front", title, `${mysterySetTitle} guide`, blocks),
      extraSides: [],
    };
    warnIfSourceItemsMissing(sourceItemIds, [result.front], warnings);
    return result;
  }

  const sides = packBlocksIntoSides(blocks, layout, warnings);
  const [frontBlocks, backBlocks, ...extraBlockGroups] = sides;
  addSideDensityWarnings(frontBlocks ?? [], backBlocks ?? [], capacity, options, warnings);

  if (sides.length > 2) {
    warnings.push(
      `This ${layout.shortLabel} layout needs continuation faces. All generated content is preserved, but choose a larger card size or print fewer prayers in full for fewer faces.`,
    );
  }

  const result = {
    front: createSide("front", title, `${mysterySetTitle} guide`, frontBlocks ?? []),
    back: backBlocks?.length ? createSide("back", title, "Continued", backBlocks) : undefined,
    extraSides: extraBlockGroups.map((extraBlocks, index) =>
      createSide(`extra-${index + 1}`, title, `Continued ${index + 2}`, extraBlocks),
    ),
  };

  warnIfSourceItemsMissing(
    sourceItemIds,
    [result.front, ...(result.back ? [result.back] : []), ...result.extraSides],
    warnings,
  );

  return result;
}

function packBlocksIntoSides(
  blocks: GuideCardBlock[],
  layout: GuideCardLayoutDefinition,
  warnings: string[],
): GuideCardBlock[][] {
  const capacity = layout.capacity;
  const sides: GuideCardBlock[][] = [];
  let current: GuideCardBlock[] = [];
  let currentWeight = 0;
  let queue = blocks.map((block) => cloneGuideCardBlock(block));

  while (queue.length > 0) {
    const [block, ...rest] = queue;
    queue = rest;

    if (block.estimatedWeight <= capacity - currentWeight) {
      current = [...current, block];
      currentWeight += block.estimatedWeight;
      continue;
    }

    const split = splitBlockForCapacity(block, capacity - currentWeight, layout);

    if (split && current.length > 0) {
      current = [...current, split.first];
      sides.push(current);
      current = [];
      currentWeight = 0;
      queue = [split.remainder, ...queue];
      warnings.push(`${block.heading ?? "A section"} continues on the next card face.`);
      continue;
    }

    if (current.length > 0) {
      sides.push(current);
      current = [];
      currentWeight = 0;
      queue = [block, ...queue];
      continue;
    }

    const emptySideSplit = splitBlockForCapacity(block, capacity, layout);

    if (emptySideSplit) {
      sides.push([emptySideSplit.first]);
      queue = [emptySideSplit.remainder, ...queue];
      warnings.push(`${block.heading ?? "A section"} is split across card faces to preserve all content.`);
      continue;
    }

    sides.push([block]);
    warnings.push(
      `${block.heading ?? "A section"} is too dense for one ${layout.shortLabel} face, so it is shown on its own continuation face.`,
    );
  }

  if (current.length > 0) {
    sides.push(current);
  }

  return sides;
}

function splitBlockForCapacity(
  block: GuideCardBlock,
  capacity: number,
  layout: GuideCardLayoutDefinition,
): { first: GuideCardBlock; remainder: GuideCardBlock } | undefined {
  const lines = block.lines ?? [];

  if (capacity <= layout.headingWeight + layout.sectionGapWeight || lines.length === 0) {
    return undefined;
  }

  if (lines.length === 1) {
    return splitSingleLineBlock(block, capacity, layout);
  }

  let fittingLineCount = 0;

  for (let count = 1; count < lines.length; count += 1) {
    const candidateLines = lines.slice(0, count);
    const candidateWeight = estimateBlockWeight(candidateLines, layout, Boolean(block.compact));

    if (candidateWeight <= capacity) {
      fittingLineCount = count;
    }
  }

  if (fittingLineCount === 0) {
    return undefined;
  }

  return {
    first: createSplitBlock(block, lines.slice(0, fittingLineCount), "part-1", layout, false),
    remainder: createSplitBlock(
      block,
      lines.slice(fittingLineCount),
      "continued",
      layout,
      true,
      (block.sourceItemIds ?? []).slice(fittingLineCount),
    ),
  };
}

function splitSingleLineBlock(
  block: GuideCardBlock,
  capacity: number,
  layout: GuideCardLayoutDefinition,
): { first: GuideCardBlock; remainder: GuideCardBlock } | undefined {
  const line = block.lines?.[0];

  if (!line || estimateBlockWeight([line], layout, Boolean(block.compact)) <= capacity) {
    return undefined;
  }

  const chunks = splitTextAtWordBoundaries(
    line,
    Math.max(24, Math.floor((block.compact ? layout.compactCharsPerLine : layout.bodyCharsPerLine) * 1.8)),
  );

  if (chunks.length < 2) {
    return undefined;
  }

  return {
    first: createSplitBlock(block, [chunks[0]], "part-1", layout, false),
    remainder: createSplitBlock(block, [chunks.slice(1).join(" ")], "continued", layout, true),
  };
}

function createSplitBlock(
  block: GuideCardBlock,
  lines: string[],
  idSuffix: string,
  layout: GuideCardLayoutDefinition,
  continued: boolean,
  sourceItemIds = block.sourceItemIds,
): GuideCardBlock {
  return {
    ...block,
    id: `${block.id}-${idSuffix}`,
    heading: continued && block.heading ? `${block.heading} (continued)` : block.heading,
    lines,
    sourceItemIds: sourceItemIds?.slice(0, lines.length),
    continuationOf: continued ? block.continuationOf ?? block.id : block.continuationOf,
    estimatedWeight: estimateBlockWeight(lines, layout, Boolean(block.compact)),
  };
}

function splitTextAtWordBoundaries(text: string, maxChunkLength: number): string[] {
  const words = normalizePrayerTextForCards(text).split(" ");
  const chunks: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxChunkLength && current) {
      chunks.push(current);
      current = word;
      return;
    }

    current = next;
  });

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function cloneGuideCardBlock(block: GuideCardBlock): GuideCardBlock {
  return {
    ...block,
    lines: block.lines ? [...block.lines] : undefined,
    sourceItemIds: block.sourceItemIds ? [...block.sourceItemIds] : undefined,
  };
}

function addSideDensityWarnings(
  frontBlocks: GuideCardBlock[],
  backBlocks: GuideCardBlock[],
  capacity: number,
  options: GuideCardLayoutOptions,
  warnings: string[],
) {
  const layout = getGuideCardLayout(options.cardSize);
  const frontWeight = getBlocksWeight(frontBlocks);
  const backWeight = getBlocksWeight(backBlocks);

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
  layout: GuideCardLayoutDefinition,
  type: GuideCardBlock["type"] = "instruction",
  compact = true,
  leaderOnly = false,
): GuideCardBlock {
  return {
    id,
    type,
    heading,
    lines,
    estimatedWeight: estimateBlockWeight(lines, layout, compact),
    sourceItemIds: makeLineSourceItemIds(id, lines),
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

function makeLineSourceItemIds(blockId: string, lines: string[]): string[] {
  return lines.map((_, index) => `${blockId}:line-${index + 1}`);
}

function collectSourceItemIds(blocks: GuideCardBlock[]): Set<string> {
  return new Set(
    blocks.flatMap((block) =>
      block.sourceItemIds && block.sourceItemIds.length > 0
        ? block.sourceItemIds
        : [`${block.id}:body`],
    ),
  );
}

function collectRenderedItemIds(sides: GuideCardSide[]): Set<string> {
  return new Set(
    sides.flatMap((side) =>
      side.blocks.flatMap((block) =>
        block.sourceItemIds && block.sourceItemIds.length > 0
          ? block.sourceItemIds
          : [`${block.continuationOf ?? block.id}:body`],
      ),
    ),
  );
}

function warnIfSourceItemsMissing(
  sourceItemIds: Set<string>,
  sides: GuideCardSide[],
  warnings: string[],
) {
  const renderedItemIds = collectRenderedItemIds(sides);
  const missingIds = [...sourceItemIds].filter((id) => !renderedItemIds.has(id));

  if (missingIds.length === 0) {
    return;
  }

  warnings.push(
    `A layout integrity warning was detected: ${missingIds.length} generated card item ${
      missingIds.length === 1 ? "was" : "were"
    } not placed. Try a larger card size and report this if it persists.`,
  );

  if (process.env.NODE_ENV !== "production") {
    console.warn("Guide card layout missing generated item IDs:", missingIds);
  }
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
    return formatRepeatedPrayerForCard(
      "hail-mary",
      "Three Hail Marys for faith, hope, and charity",
      options.fullPrayerIds.includes("hail-mary"),
    );
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

export function buildDecadeSummary(
  config: UserRosaryConfig,
  options: GuideCardLayoutOptions = normalizeGuideCardLayoutOptions({}),
): string[] {
  return [
    "Announce the mystery and fruit.",
    formatPrayerForCard("our-father", options.fullPrayerIds.includes("our-father")),
    formatRepeatedPrayerForCard(
      "hail-mary",
      "10 Hail Marys",
      options.fullPrayerIds.includes("hail-mary"),
    ),
    formatPrayerForCard("glory-be", options.fullPrayerIds.includes("glory-be")),
    ...(hasFatimaPrayer(config)
      ? [formatPrayerForCard("fatima-prayer", options.fullPrayerIds.includes("fatima-prayer"))]
      : []),
  ];
}

function formatPrayerForCard(prayerId: PrayerId, full: boolean): string {
  const prayer = prayersById[prayerId];

  if (!full) {
    return compactPrayerText(prayerId);
  }

  return `${prayer.title}: ${getFullPrayerTextForCards(prayer)}`;
}

function formatRepeatedPrayerForCard(prayerId: PrayerId, label: string, full: boolean): string {
  const prayer = prayersById[prayerId];

  if (!full) {
    return `${label}: ${compactPrayerText(prayerId)}`;
  }

  return `${label}: ${getFullPrayerTextForCards(prayer)}`;
}

function compactPrayerText(prayerId: PrayerId): string {
  return getCompactPrayerText(prayersById[prayerId]);
}

function buildSaintInvocationBlock(
  config: UserRosaryConfig,
  layout: GuideCardLayoutDefinition,
): GuideCardBlock | undefined {
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
    layout,
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

function getBlocksWeight(blocks: GuideCardBlock[]): number {
  return blocks.reduce((total, block) => total + block.estimatedWeight, 0);
}

function estimateBlockWeight(
  lines: string[],
  layout: GuideCardLayoutDefinition,
  compact: boolean,
): number {
  const charsPerLine = compact ? layout.compactCharsPerLine : layout.bodyCharsPerLine;

  return estimateLines(lines, charsPerLine) + layout.headingWeight + layout.sectionGapWeight;
}

function estimateLines(lines: string[], charsPerLine: number): number {
  return lines.reduce((total, line) => total + estimateText(line, charsPerLine), 0);
}

function estimateText(text: string, charsPerLine: number): number {
  return Math.max(1, Math.ceil(normalizePrayerTextForCards(text).length / charsPerLine));
}

function ordinalWord(value: number): string {
  if (value === 1) return "First";
  if (value === 2) return "Second";
  if (value === 3) return "Third";
  if (value === 4) return "Fourth";
  if (value === 5) return "Fifth";
  return `${value}th`;
}
