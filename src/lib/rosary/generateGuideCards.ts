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
  GuideCardCustomization,
  GuideCardEditableItem,
  GuideCardEditableItemType,
  GuideCardLayoutOptions,
  GuideCardSide,
  MysterySet,
  Prayer,
  PrayerId,
  RosaryStep,
  UserRosaryConfig,
} from "@/lib/rosary/types";

type GuideCardGeneratedLine = {
  text: string;
  type: GuideCardEditableItemType;
  prayerId?: PrayerId;
  title?: string;
  printMode?: "short" | "full";
  canToggleFullPrayer?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

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

const defaultGeneratedGuideId = "default-guide";

export function createDefaultGeneratedGuideConfig(): UserRosaryConfig {
  return normalizeRosaryConfig({
    ...createDefaultUserConfigFromTemplate("standard-rosary"),
    id: defaultGeneratedGuideId,
  });
}

export function generateGuideCardsFromConfig(
  inputConfig: UserRosaryConfig,
  inputOptions: Partial<GuideCardLayoutOptions> | number = {},
  date = new Date(),
  customization?: GuideCardCustomization,
): GeneratedGuideCardSet {
  const config = normalizeRosaryConfig(inputConfig);
  const options =
    typeof inputOptions === "number"
      ? normalizeGuideCardLayoutOptions({ cardCount: inputOptions })
      : normalizeGuideCardLayoutOptions(inputOptions);
  const normalizedLayoutOptions = {
    ...options,
    fullPrayerIds: options.fullPrayerIds.filter((id) =>
      getRelevantGuidePrayerOptions(config).some((prayer) => prayer.id === id),
    ),
  };
  const layoutOptions = applyFullPrayerOverrides(normalizedLayoutOptions, customization);
  const cardCount = clampCardCount(layoutOptions.cardCount);
  const mysterySet = getMysterySetForConfig(config, date);
  const warnings: string[] = [];
  const layout = getGuideCardLayout(layoutOptions.cardSize);
  const blocks = materializeEditableBlocks(
    buildOrderedGuideBlocks(config, mysterySet, layoutOptions, layout, warnings),
    layout,
    customization,
  );
  const { front, back, extraSides } = layoutBlocksAcrossSides(
    blocks,
    config.id,
    config.name?.trim() || "Rosary Walk Guide",
    mysterySet.title,
    layoutOptions,
    warnings,
    customization,
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
    sectionBlock(
      "intentions",
      "Intentions",
      [
        editableLine("At this time, please offer your intentions.", "instruction"),
        editableLine("[pause]", "pause", { canToggleFullPrayer: false }),
        ...buildConciseGuidance(config, guidancePointsForFront, warnings).map((text) =>
          editableLine(text, "instruction"),
        ),
      ],
      layout,
    ),
    sectionBlock("each-decade", "Each Decade", buildDecadeSummary(config, options), layout),
    {
      id: "mystery-set",
      type: "mystery-list",
      heading: mysterySet.title,
      lines: mysteryLines.map((line) => line.text),
      estimatedWeight: estimateBlockWeight(mysteryLines.map((line) => line.text), layout, false),
      sourceItemIds: makeLineSourceItemIds("mystery-set", mysteryLines.map((line) => line.text)),
      editableItems: makeEditableItems("mystery-set", mysterySet.title, mysteryLines),
      keepTogether: true,
      priority: "required",
      sectionGroup: "mysteries",
    } satisfies GuideCardBlock,
    ...(closingLines.length > 0
      ? [sectionBlock("closing", "Closing", closingLines, layout, "prayer")]
      : []),
    sectionBlock("holy-father-intentions", "Holy Father's Intentions", [
      formatPrayerLineForCard("our-father", options.fullPrayerIds.includes("our-father")),
      formatPrayerLineForCard("hail-mary", options.fullPrayerIds.includes("hail-mary")),
      formatPrayerLineForCard("glory-be", options.fullPrayerIds.includes("glory-be")),
    ], layout),
    ...(saintBlock ? [saintBlock] : []),
    ...(guidanceLines.length > 0
      ? [sectionBlock(
          "custom-guidance",
          "Guide Notes",
          guidanceLines.map((text) => editableLine(text, "instruction")),
          layout,
          "custom-guidance",
          true,
        )]
      : []),
    ...(leaderLines.length > 0
      ? [sectionBlock(
          "leader-notes",
          "Leader Notes",
          leaderLines.map((text) => editableLine(text, "instruction")),
          layout,
          "custom-guidance",
          true,
          true,
        )]
      : []),
    sectionBlock(
      "final-sign",
      "Final",
      [formatPrayerLineForCard("sign-of-the-cross", false)],
      layout,
      "prayer",
    ),
  ];

  return blocks.filter((block) => block.lines?.length || block.body);
}

function applyFullPrayerOverrides(
  options: GuideCardLayoutOptions,
  customization?: GuideCardCustomization,
): GuideCardLayoutOptions {
  if (!customization) {
    return options;
  }

  const fullPrayerIds = new Set(options.fullPrayerIds);

  Object.entries(customization.fullPrayerOverrides).forEach(([id, shouldUseFullText]) => {
    const prayerId = id as PrayerId;

    if (shouldUseFullText) {
      fullPrayerIds.add(prayerId);
      return;
    }

    fullPrayerIds.delete(prayerId);
  });

  return {
    ...options,
    fullPrayerIds: [...fullPrayerIds],
  };
}

function materializeEditableBlocks(
  blocks: GuideCardBlock[],
  layout: GuideCardLayoutDefinition,
  customization?: GuideCardCustomization,
): GuideCardBlock[] {
  const customizationForGuide = customization ?? {
    guideId: "",
    itemOrder: [],
    removedItemIds: [],
    fullPrayerOverrides: {},
    textOverrides: {},
    updatedAt: "",
  };
  const removedItemIds = new Set(customizationForGuide.removedItemIds);
  const flattenedItems = blocks.flatMap((block, blockIndex) =>
    (block.editableItems ?? []).map((item, lineIndex) => ({
      block,
      blockIndex,
      lineIndex,
      item,
    })),
  );
  const itemById = new Map(flattenedItems.map((entry) => [entry.item.id, entry]));
  const orderedIds = [
    ...customizationForGuide.itemOrder.filter((id) => itemById.has(id)),
    ...flattenedItems.map((entry) => entry.item.id).filter((id) => !customizationForGuide.itemOrder.includes(id)),
  ];
  const renderedSectionIds = new Set<string>();

  return orderedIds
    .map((id) => itemById.get(id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => !removedItemIds.has(entry.item.id))
    .map((entry, order) => {
      const sectionHeadingKey = getSectionHeadingOverrideKey(entry.item.sectionId);
      const heading =
        renderedSectionIds.has(entry.item.sectionId)
          ? undefined
          : customizationForGuide.textOverrides[sectionHeadingKey] ?? entry.block.heading;
      const text = customizationForGuide.textOverrides[entry.item.id] ?? entry.item.currentText;
      const lineItem: GuideCardEditableItem = {
        ...entry.item,
        currentText: text,
        order,
      };
      const block = createMaterializedBlock(entry.block, lineItem, text, heading, layout);

      renderedSectionIds.add(entry.item.sectionId);
      return block;
    });
}

function getSectionHeadingOverrideKey(sectionId: string): string {
  return `${sectionId}:heading`;
}

function createMaterializedBlock(
  sourceBlock: GuideCardBlock,
  item: GuideCardEditableItem,
  text: string,
  heading: string | undefined,
  layout: GuideCardLayoutDefinition,
): GuideCardBlock {
  const lines = [text];
  const layoutInstanceId = createLayoutInstanceId(item);

  return {
    ...sourceBlock,
    id: layoutInstanceId,
    layoutInstanceId,
    heading,
    lines,
    sourceItemIds: [item.id],
    editableItems: [item],
    estimatedWeight: estimateMaterializedBlockWeight(sourceBlock, lines, heading, layout),
  };
}

function createLayoutInstanceId(item: GuideCardEditableItem): string {
  return `layout:${item.id}`;
}

function estimateMaterializedBlockWeight(
  sourceBlock: GuideCardBlock,
  lines: string[],
  heading: string | undefined,
  layout: GuideCardLayoutDefinition,
): number {
  const charsPerLine =
    sourceBlock.type === "mystery-list"
      ? layout.compactCharsPerLine
      : getCharsPerLine(layout, sourceBlock.compact);
  const headingWeight = heading ? layout.headingWeight : 0;
  const spacingWeight = heading ? layout.sectionGapWeight : layout.sectionGapWeight * 0.35;

  return estimateLines(lines, charsPerLine) + headingWeight + spacingWeight;
}

function layoutBlocksAcrossSides(
  blocks: GuideCardBlock[],
  guideId: string,
  title: string,
  mysterySetTitle: string,
  options: GuideCardLayoutOptions,
  warnings: string[],
  customization?: GuideCardCustomization,
): { front: GuideCardSide; back?: GuideCardSide; extraSides: GuideCardSide[] } {
  const layout = getGuideCardLayout(options.cardSize);
  const capacity = layout.capacity;
  const sourceItemCounts = collectSourceItemCounts(blocks);

  blocks
    .filter((block) => block.estimatedWeight > capacity)
    .forEach((block) => {
      warnings.push(
        `${block.heading ?? "A section"} may be too large for one ${layout.shortLabel} card face. It will continue on another face if needed.`,
      );
    });

  const sides = packBlocksIntoSides(blocks, layout, warnings);
  const [frontBlocks, backBlocks, ...extraBlockGroups] = sides;
  addSideDensityWarnings(frontBlocks ?? [], backBlocks ?? [], capacity, options, warnings);

  if (sides.length > 2) {
    warnings.push(
      `This ${layout.shortLabel} layout needs continuation faces. All generated content is preserved, but choose a larger card size or print fewer prayers in full for fewer faces.`,
    );
  }

  const result = {
    front: createSide("front", title, `${mysterySetTitle} guide`, frontBlocks ?? [], customization),
    back: backBlocks?.length ? createSide("back", title, "Continued", backBlocks, customization) : undefined,
    extraSides: extraBlockGroups.map((extraBlocks, index) =>
      createSide(`extra-${index + 1}`, title, `Continued ${index + 2}`, extraBlocks, customization),
    ),
  };

  const renderedSides = [result.front, ...(result.back ? [result.back] : []), ...result.extraSides];

  warnIfSourceItemsMissing(sourceItemCounts, renderedSides, warnings);
  addDevelopmentLayoutInvariantWarnings(guideId, sourceItemCounts, renderedSides, layout, warnings);

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

    const remainingCapacity = capacity - currentWeight;

    if (block.estimatedWeight <= remainingCapacity) {
      current = [...current, block];
      currentWeight += block.estimatedWeight;
      continue;
    }

    const split = splitBlockForCapacity(block, remainingCapacity, layout);

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
    if (shouldKeepSingleLineBlockTogether(block)) {
      return undefined;
    }

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
    remainder: createSplitBlock(block, [chunks.slice(1).join(" ")], "continued", layout, true, []),
  };
}

function shouldKeepSingleLineBlockTogether(block: GuideCardBlock): boolean {
  return block.type === "mystery-list" || block.editableItems?.some((item) => item.type === "mystery") === true;
}

function createSplitBlock(
  block: GuideCardBlock,
  lines: string[],
  idSuffix: string,
  layout: GuideCardLayoutDefinition,
  continued: boolean,
  sourceItemIds = block.sourceItemIds,
): GuideCardBlock {
  const baseInstanceId = block.layoutInstanceId ?? block.id;
  const splitSourceItemIds = sourceItemIds?.slice(0, lines.length);
  const splitEditableItems =
    block.editableItems && splitSourceItemIds
      ? block.editableItems.filter((item) => splitSourceItemIds.includes(item.id))
      : block.editableItems;

  return {
    ...block,
    id: `${block.id}-${idSuffix}`,
    layoutInstanceId: `${baseInstanceId}:${idSuffix}`,
    heading: continued && block.heading ? `${block.heading} (continued)` : block.heading,
    lines,
    sourceItemIds: splitSourceItemIds,
    editableItems: splitEditableItems,
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
    editableItems: block.editableItems ? block.editableItems.map((item) => ({ ...item })) : undefined,
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
  lines: Array<string | GuideCardGeneratedLine>,
  layout: GuideCardLayoutDefinition,
  type: GuideCardBlock["type"] = "instruction",
  compact = true,
  leaderOnly = false,
): GuideCardBlock {
  const generatedLines = normalizeGeneratedLines(lines, type);
  const textLines = generatedLines.map((line) => line.text);

  return {
    id,
    type,
    heading,
    lines: textLines,
    estimatedWeight: estimateBlockWeight(textLines, layout, compact),
    sourceItemIds: makeLineSourceItemIds(id, textLines),
    editableItems: makeEditableItems(id, heading, generatedLines),
    keepTogether: true,
    priority: type === "custom-guidance" ? "optional" : "required",
    compact,
    leaderOnly,
    sectionGroup: id,
  };
}

function normalizeGeneratedLines(
  lines: Array<string | GuideCardGeneratedLine>,
  blockType: GuideCardBlock["type"],
): GuideCardGeneratedLine[] {
  return lines.map((line) =>
    typeof line === "string"
      ? editableLine(line, getEditableTypeForBlock(blockType, line))
      : line,
  );
}

function getEditableTypeForBlock(
  blockType: GuideCardBlock["type"],
  text: string,
): GuideCardEditableItemType {
  if (text.trim().toLowerCase() === "[pause]") {
    return "pause";
  }

  if (blockType === "prayer") {
    return "prayer";
  }

  if (blockType === "mystery-list") {
    return "mystery";
  }

  if (blockType === "invocation-list") {
    return "saint-invocation";
  }

  return "instruction";
}

function makeEditableItems(
  sectionId: string,
  heading: string,
  lines: GuideCardGeneratedLine[],
): GuideCardEditableItem[] {
  return lines.map((line, index) => ({
    id: `${sectionId}:line-${index + 1}`,
    type: line.type,
    sectionId,
    prayerId: line.prayerId,
    title: line.title ?? heading,
    shortText: line.prayerId ? getCompactPrayerText(prayersById[line.prayerId]) : undefined,
    fullText: line.prayerId ? getFullPrayerTextForCards(prayersById[line.prayerId]) : undefined,
    currentText: line.text,
    printMode: line.printMode,
    order: index,
    canToggleFullPrayer: line.canToggleFullPrayer ?? Boolean(line.prayerId),
    canEdit: line.canEdit ?? true,
    canDelete: line.canDelete ?? true,
  }));
}

function editableLine(
  text: string,
  type: GuideCardEditableItemType,
  options: Partial<Omit<GuideCardGeneratedLine, "text" | "type">> = {},
): GuideCardGeneratedLine {
  return {
    text,
    type,
    canEdit: true,
    canDelete: true,
    ...options,
  };
}

function createSide(
  id: string,
  title: string,
  subtitle: string,
  blocks: GuideCardBlock[],
  customization?: GuideCardCustomization,
): GuideCardSide {
  return {
    id,
    title: customization?.textOverrides["card:title"] ?? title,
    subtitle: customization?.textOverrides["card:subtitle"] ?? subtitle,
    blocks,
    overflowWarnings: [],
  };
}

function makeLineSourceItemIds(blockId: string, lines: string[]): string[] {
  return lines.map((_, index) => `${blockId}:line-${index + 1}`);
}

function collectSourceItemCounts(blocks: GuideCardBlock[]): Map<string, number> {
  const counts = new Map<string, number>();

  blocks.forEach((block) => {
    getBlockSourceItemIds(block).forEach((id) => {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    });
  });

  return counts;
}

function collectRenderedItemCounts(sides: GuideCardSide[]): Map<string, number> {
  const counts = new Map<string, number>();

  sides.forEach((side) => {
    side.blocks.forEach((block) => {
      getBlockSourceItemIds(block).forEach((id) => {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      });
    });
  });

  return counts;
}

function warnIfSourceItemsMissing(
  sourceItemCounts: Map<string, number>,
  sides: GuideCardSide[],
  warnings: string[],
) {
  const renderedItemCounts = collectRenderedItemCounts(sides);
  const missingIds = [...sourceItemCounts.keys()].filter((id) => !renderedItemCounts.has(id));

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

function addDevelopmentLayoutInvariantWarnings(
  guideId: string,
  sourceItemCounts: Map<string, number>,
  sides: GuideCardSide[],
  layout: GuideCardLayoutDefinition,
  warnings: string[],
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const invariantWarnings = [
    ...findSourceItemCountWarnings(guideId, sourceItemCounts, sides),
    ...findDuplicateLayoutKeyWarnings(guideId, sides),
    ...findEmptyFaceWarnings(sides),
    ...findFrontFirstPlacementWarnings(sides, layout),
    ...findOrphanHeadingWarnings(sides),
  ];

  if (invariantWarnings.length === 0) {
    return;
  }

  invariantWarnings.forEach((warning) => warnings.push(warning));
  console.warn("Guide card layout invariant warnings:", invariantWarnings);
}

function findSourceItemCountWarnings(
  guideId: string,
  sourceItemCounts: Map<string, number>,
  sides: GuideCardSide[],
): string[] {
  const renderedItemCounts = collectRenderedItemCounts(sides);
  const warnings: string[] = [];

  sourceItemCounts.forEach((expectedCount, id) => {
    const renderedCount = renderedItemCounts.get(id) ?? 0;

    if (renderedCount !== expectedCount) {
      warnings.push(
        `Layout integrity warning for guide ${guideId}: generated item ${id} rendered ${renderedCount} time(s), expected ${expectedCount}.`,
      );
    }
  });

  return warnings;
}

function findDuplicateLayoutKeyWarnings(guideId: string, sides: GuideCardSide[]): string[] {
  return sides.flatMap((side) => {
    const counts = new Map<string, number>();

    side.blocks.forEach((block) => {
      const key = block.layoutInstanceId ?? block.id;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const duplicateKeys = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([key]) => key);

    return duplicateKeys.length > 0
      ? [
          `Layout integrity warning for guide ${guideId}: duplicate rendered block keys on ${side.id}: ${duplicateKeys.join(", ")}.`,
        ]
      : [];
  });
}

function findEmptyFaceWarnings(sides: GuideCardSide[]): string[] {
  const firstNonEmptyAfterEmpty = sides.findIndex((side, index) =>
    side.blocks.length > 0 && sides.slice(0, index).some((previousSide) => previousSide.blocks.length === 0),
  );

  if (firstNonEmptyAfterEmpty === -1) {
    return [];
  }

  return ["Layout integrity warning: an empty guide-card face appears before a non-empty face."];
}

function findFrontFirstPlacementWarnings(
  sides: GuideCardSide[],
  layout: GuideCardLayoutDefinition,
): string[] {
  const warnings: string[] = [];

  sides.forEach((side, sideIndex) => {
    if (sideIndex === 0 || side.blocks.length === 0) {
      return;
    }

    const firstRenderableWeight = getMinimumRenderableBlockWeight(side.blocks[0], layout);

    sides.slice(0, sideIndex).forEach((previousSide, previousIndex) => {
      const remainingCapacity = layout.capacity - getBlocksWeight(previousSide.blocks);

      if (firstRenderableWeight <= remainingCapacity) {
        warnings.push(
          `Layout integrity warning: ${side.blocks[0].heading ?? "content"} appears on face ${
            sideIndex + 1
          } even though face ${previousIndex + 1} had estimated room for its next item.`,
        );
      }
    });
  });

  return warnings;
}

function findOrphanHeadingWarnings(sides: GuideCardSide[]): string[] {
  return sides.flatMap((side, sideIndex) => {
    const lastBlock = side.blocks.at(-1);

    if (!lastBlock?.heading) {
      return [];
    }

    const hasRenderableContent =
      Boolean(lastBlock.body?.trim()) || Boolean(lastBlock.lines && lastBlock.lines.length > 0);

    return hasRenderableContent
      ? []
      : [`Layout integrity warning: ${lastBlock.heading} is orphaned at the end of face ${sideIndex + 1}.`];
  });
}

function getBlockSourceItemIds(block: GuideCardBlock): string[] {
  if (block.sourceItemIds && block.sourceItemIds.length > 0) {
    return block.sourceItemIds;
  }

  return [`${block.continuationOf ?? block.id}:body`];
}

function getMinimumRenderableBlockWeight(
  block: GuideCardBlock,
  layout: GuideCardLayoutDefinition,
): number {
  if (block.lines && block.lines.length > 0) {
    return estimateBlockWeight([block.lines[0]], layout, Boolean(block.compact));
  }

  if (block.body) {
    return estimateBlockWeight([block.body], layout, Boolean(block.compact));
  }

  return block.estimatedWeight;
}

function buildOpeningSummary(
  config: UserRosaryConfig,
  options: GuideCardLayoutOptions = normalizeGuideCardLayoutOptions({}),
): GuideCardGeneratedLine[] {
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

function formatOpeningStep(step: RosaryStep, options: GuideCardLayoutOptions): GuideCardGeneratedLine {
  if (step.prayerId === "hail-mary" && (step.repeatCount ?? step.repeat ?? 1) === 3) {
    return formatRepeatedPrayerLineForCard(
      "hail-mary",
      "Three Hail Marys for faith, hope, and charity",
      options.fullPrayerIds.includes("hail-mary"),
    );
  }

  if (step.prayerId) {
    return formatPrayerLineForCard(step.prayerId, options.fullPrayerIds.includes(step.prayerId));
  }

  return editableLine(step.title, "instruction");
}

function buildClosingSummary(
  config: UserRosaryConfig,
  options: GuideCardLayoutOptions = normalizeGuideCardLayoutOptions({}),
): GuideCardGeneratedLine[] {
  return closingOrder
    .filter((prayerId) => config.selectedClosingPrayerIds.includes(prayerId))
    .map((prayerId) => formatPrayerLineForCard(prayerId, options.fullPrayerIds.includes(prayerId)));
}

export function buildMysterySummary(mysterySet: MysterySet): GuideCardGeneratedLine[] {
  const setName = mysterySet.title.replace(" Mysteries", "");

  return mysterySet.mysteries.map((mystery) => {
    const fruit = mystery.fruitOfMystery
      ? ` The fruit of this mystery is ${mystery.fruitOfMystery}.`
      : "";

    return editableLine(
      `${mystery.number}. The ${ordinalWord(mystery.number)} ${setName} Mystery is ${mystery.title}.${fruit}`,
      "mystery",
      { title: mystery.title },
    );
  });
}

export function buildDecadeSummary(
  config: UserRosaryConfig,
  options: GuideCardLayoutOptions = normalizeGuideCardLayoutOptions({}),
): GuideCardGeneratedLine[] {
  return [
    editableLine("Announce the mystery and fruit.", "instruction"),
    formatPrayerLineForCard("our-father", options.fullPrayerIds.includes("our-father")),
    formatRepeatedPrayerLineForCard(
      "hail-mary",
      "10 Hail Marys",
      options.fullPrayerIds.includes("hail-mary"),
    ),
    formatPrayerLineForCard("glory-be", options.fullPrayerIds.includes("glory-be")),
    ...(hasFatimaPrayer(config)
      ? [formatPrayerLineForCard("fatima-prayer", options.fullPrayerIds.includes("fatima-prayer"))]
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

function formatPrayerLineForCard(prayerId: PrayerId, full: boolean): GuideCardGeneratedLine {
  return editableLine(formatPrayerForCard(prayerId, full), "prayer", {
    prayerId,
    title: prayersById[prayerId].title,
    printMode: full ? "full" : "short",
    canToggleFullPrayer: prayerId !== "sign-of-the-cross",
  });
}

function formatRepeatedPrayerForCard(prayerId: PrayerId, label: string, full: boolean): string {
  const prayer = prayersById[prayerId];

  if (!full) {
    return `${label}: ${compactPrayerText(prayerId)}`;
  }

  return `${label}: ${getFullPrayerTextForCards(prayer)}`;
}

function formatRepeatedPrayerLineForCard(
  prayerId: PrayerId,
  label: string,
  full: boolean,
): GuideCardGeneratedLine {
  return editableLine(formatRepeatedPrayerForCard(prayerId, label, full), "prayer", {
    prayerId,
    title: label,
    printMode: full ? "full" : "short",
    canToggleFullPrayer: true,
  });
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
  const charsPerLine = getCharsPerLine(layout, compact);

  return estimateLines(lines, charsPerLine) + layout.headingWeight + layout.sectionGapWeight;
}

function getCharsPerLine(layout: GuideCardLayoutDefinition, compact: boolean | undefined): number {
  return compact ? layout.compactCharsPerLine : layout.bodyCharsPerLine;
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
