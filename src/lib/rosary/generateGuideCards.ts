import { prayersById } from "@/content/prayers";
import { getMysterySetForConfig } from "@/lib/rosary/buildRosaryFlow";
import {
  clampCardCount,
  getCardsPerPage,
  normalizeGuideCardLayoutOptions,
} from "@/lib/rosary/cardUtils";
import { createDefaultUserConfigFromTemplate, normalizeRosaryConfig } from "@/lib/rosary/configUtils";
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

const sideCapacity: Record<GuideCardLayoutOptions["cardSize"], number> = {
  pocket: 29,
  large: 50,
  "full-page": 82,
};

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
  const { front, back, extraSides } = buildGuideCardSides(config, mysterySet, layoutOptions, warnings);
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
    warnings,
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
  back: GuideCardSide,
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

function buildGuideCardSides(
  config: UserRosaryConfig,
  mysterySet: MysterySet,
  options: GuideCardLayoutOptions,
  warnings: string[],
): { front: GuideCardSide; back: GuideCardSide; extraSides: GuideCardSide[] } {
  const title = config.name?.trim() || "Rosary Walk Guide";
  const frontBlocks = buildFrontBlocks(config, mysterySet, options, warnings);
  const backBlocks = buildBackBlocks(config, options, warnings);
  const capacity = sideCapacity[options.cardSize];
  const front = createSide("front", title, `${mysterySet.title} guide`, frontBlocks);
  const back = createSide("back", title, "Closing prayers and leader reminders", backBlocks);

  rebalanceFrontToBack(front, back, capacity, warnings, options);
  const extraSides = moveOverflowToExtraSides(back, title, capacity, warnings, options);

  if (options.includeOverflowWarnings) {
    addDensityWarnings(front, back, extraSides, capacity, warnings, options);
  }

  return { front, back, extraSides };
}

function buildFrontBlocks(
  config: UserRosaryConfig,
  mysterySet: MysterySet,
  options: GuideCardLayoutOptions,
  warnings: string[],
): GuideCardBlock[] {
  return [
    headingBlock("opening-heading", "Opening"),
    ...buildOpeningPrayerBlocks(config, options),
    instructionBlock("intentions", "Intentions", [
      "At this time, please offer your intentions.",
      "[pause]",
      ...buildConciseGuidance(config, guidancePointsForFront, warnings),
    ]),
    instructionBlock("each-decade", "Each Decade", buildDecadeSummary(config)),
    {
      id: "mystery-set",
      type: "mystery-list",
      heading: mysterySet.title,
      lines: buildMysterySummary(mysterySet),
      estimatedWeight: estimateLines(buildMysterySummary(mysterySet), 42) + 3,
      keepTogether: true,
      priority: "required",
    },
  ];
}

function buildBackBlocks(
  config: UserRosaryConfig,
  options: GuideCardLayoutOptions,
  warnings: string[],
): GuideCardBlock[] {
  const closingBlocks = buildClosingPrayerBlocks(config, options);
  const saintBlock = buildSaintInvocationBlock(config);
  const guidanceLines = buildConciseGuidance(config, guidancePointsForBack, warnings);
  const leaderLines = buildLeaderNoteSummary(config, warnings);

  return [
    headingBlock("closing-heading", "Closing"),
    ...(closingBlocks.length > 0
      ? closingBlocks
      : [instructionBlock("closing-empty", undefined, ["Conclude with the Sign of the Cross."])]),
    instructionBlock("holy-father-intentions", "Holy Father's Intentions", [
      compactPrayerText("our-father"),
      compactPrayerText("hail-mary"),
      compactPrayerText("glory-be"),
    ]),
    ...(saintBlock ? [saintBlock] : []),
    ...(guidanceLines.length > 0
      ? [instructionBlock("custom-guidance", "Guide Notes", guidanceLines, "custom-guidance")]
      : []),
    ...(leaderLines.length > 0
      ? [instructionBlock("leader-notes", "Leader Notes", leaderLines, "custom-guidance", true)]
      : []),
    prayerBlock("final-sign", "sign-of-the-cross", false),
  ];
}

function buildOpeningPrayerBlocks(
  config: UserRosaryConfig,
  options: GuideCardLayoutOptions,
): GuideCardBlock[] {
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

  return steps.map((step) => {
    if (step.prayerId === "hail-mary" && (step.repeatCount ?? step.repeat ?? 1) === 3) {
      return instructionBlock("opening-three-hail-marys", undefined, [
        "Three Hail Marys for faith, hope, and charity",
      ]);
    }

    if (step.prayerId) {
      return prayerBlock(`opening-${step.prayerId}`, step.prayerId, options.fullPrayerIds.includes(step.prayerId));
    }

    return instructionBlock(step.id, undefined, [step.title]);
  });
}

function buildClosingPrayerBlocks(
  config: UserRosaryConfig,
  options: GuideCardLayoutOptions,
): GuideCardBlock[] {
  return closingOrder
    .filter((prayerId) => config.selectedClosingPrayerIds.includes(prayerId))
    .map((prayerId) =>
      prayerBlock(`closing-${prayerId}`, prayerId, options.fullPrayerIds.includes(prayerId)),
    );
}

function prayerBlock(id: string, prayerId: PrayerId, full: boolean): GuideCardBlock {
  const prayer = prayersById[prayerId];
  const body = full ? prayer.text : compactPrayerText(prayerId);

  return {
    id,
    type: "prayer",
    heading: full ? prayer.title : undefined,
    body,
    prayerId,
    printMode: full ? "full" : "short",
    estimatedWeight: estimateText(body, full ? 58 : 42) + (full ? 2 : 0),
    keepTogether: true,
    priority: "required",
    compact: !full,
  };
}

function compactPrayerText(prayerId: PrayerId): string {
  const prayer = prayersById[prayerId];
  return `${prayer.title}...`;
}

function headingBlock(id: string, heading: string): GuideCardBlock {
  return {
    id,
    type: "heading",
    heading,
    estimatedWeight: 1.2,
    keepTogether: true,
    priority: "required",
  };
}

function instructionBlock(
  id: string,
  heading: string | undefined,
  lines: string[],
  type: GuideCardBlock["type"] = "instruction",
  leaderOnly = false,
): GuideCardBlock {
  return {
    id,
    type,
    heading,
    lines,
    estimatedWeight: estimateLines(lines, 48) + (heading ? 1.4 : 0),
    keepTogether: true,
    priority: type === "custom-guidance" ? "optional" : "required",
    compact: true,
    leaderOnly,
  };
}

function buildSaintInvocationBlock(config: UserRosaryConfig): GuideCardBlock | undefined {
  if (!config.saintInvocations.enabled) {
    return undefined;
  }

  const saints = config.saintInvocations.saints.map((saint) => saint.trim()).filter(Boolean);

  if (saints.length === 0) {
    return undefined;
  }

  return {
    id: "saint-invocations",
    type: "invocation-list",
    heading: "Saint Invocations",
    lines: saints.map((saint) => `${saint}, pray for us.`),
    estimatedWeight: estimateLines(saints, 26) + 1.5,
    keepTogether: true,
    priority: "required",
    compact: true,
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

function rebalanceFrontToBack(
  front: GuideCardSide,
  back: GuideCardSide,
  capacity: number,
  warnings: string[],
  options: GuideCardLayoutOptions,
) {
  while (sideWeight(front) > capacity) {
    const movableIndex = findMovableFrontBlockIndex(front.blocks);

    if (movableIndex < 0) {
      warnings.push("This guide may be too dense for the front side. Choose Large cards or reduce full prayer text.");
      front.overflowWarnings?.push("Front side may be too dense for the selected card size.");
      return;
    }

    const [movedBlock] = front.blocks.splice(movableIndex, 1);
    back.blocks.splice(1, 0, movedBlock);
    trimTrailingHeading(front.blocks);

    if (options.includeOverflowWarnings) {
      warnings.push(`${movedBlock.heading ?? blockLabel(movedBlock)} was moved to the back to keep the front readable.`);
    }
  }
}

function moveOverflowToExtraSides(
  back: GuideCardSide,
  title: string,
  capacity: number,
  warnings: string[],
  options: GuideCardLayoutOptions,
): GuideCardSide[] {
  const extraSides: GuideCardSide[] = [];

  while (sideWeight(back) > capacity) {
    const movableIndex = findMovableBackBlockIndex(back.blocks);

    if (movableIndex < 0) {
      back.overflowWarnings?.push("Back side may be too dense for the selected card size.");
      warnings.push("Some content may require a larger card size. No required content was dropped.");
      break;
    }

    const movedBlocks = back.blocks.splice(movableIndex);
    trimTrailingHeading(back.blocks);
    const extraSide = createSide(
      `extra-${extraSides.length + 1}`,
      title,
      `Overflow notes ${extraSides.length + 1}`,
      movedBlocks,
    );
    extraSides.push(extraSide);

    if (options.includeOverflowWarnings) {
      warnings.push("Some closing or note content moved to an extra side to avoid crowding.");
    }

    if (sideWeight(extraSide) > capacity) {
      extraSide.overflowWarnings?.push("This extra side is still dense. Choose a larger card size if possible.");
      warnings.push("Some content may still be dense on an extra side. Large or Full page cards are recommended.");
      break;
    }
  }

  return extraSides;
}

function addDensityWarnings(
  front: GuideCardSide,
  back: GuideCardSide,
  extraSides: GuideCardSide[],
  capacity: number,
  warnings: string[],
  options: GuideCardLayoutOptions,
) {
  const denseLimit = capacity * 0.92;
  const sides = [front, back, ...extraSides];

  if (sides.some((side) => sideWeight(side) > denseLimit)) {
    warnings.push(
      `This ${options.cardSize.replace("-", " ")} layout is dense. Choose a larger card size or print fewer prayers in full if readability matters.`,
    );
  }
}

function findMovableFrontBlockIndex(blocks: GuideCardBlock[]): number {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    if (blocks[index].type !== "heading") {
      return index;
    }
  }

  return -1;
}

function findMovableBackBlockIndex(blocks: GuideCardBlock[]): number {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    if (blocks[index].type !== "heading") {
      return index;
    }
  }

  return -1;
}

function trimTrailingHeading(blocks: GuideCardBlock[]) {
  while (blocks.at(-1)?.type === "heading") {
    blocks.pop();
  }
}

function sideWeight(side: GuideCardSide): number {
  return side.blocks.reduce((total, block) => total + block.estimatedWeight, 0);
}

function blockLabel(block: GuideCardBlock): string {
  if (block.prayerId) {
    return prayersById[block.prayerId].title;
  }

  return block.lines?.[0] ?? "A card section";
}

export function buildMysterySummary(mysterySet: MysterySet): string[] {
  return mysterySet.mysteries.map((mystery) => {
    const fruit = mystery.fruitOfMystery
      ? ` Fruit: ${mystery.fruitOfMystery}.`
      : "";

    return `${mystery.number}. ${mystery.title}.${fruit}`;
  });
}

export function buildOpeningSummary(config: UserRosaryConfig): string[] {
  return buildOpeningPrayerBlocks(config, normalizeGuideCardLayoutOptions({})).map((block) =>
    block.body ?? block.lines?.join(" ") ?? block.heading ?? "",
  );
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

export function buildClosingSummary(config: UserRosaryConfig): string[] {
  return closingOrder
    .filter((prayerId) => config.selectedClosingPrayerIds.includes(prayerId))
    .map((prayerId) => compactPrayerText(prayerId));
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
  const cleaned = text.replace(/\s+/g, " ").trim();

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
  return Math.max(1, Math.ceil(text.replace(/\s+/g, " ").trim().length / charsPerWeight));
}
