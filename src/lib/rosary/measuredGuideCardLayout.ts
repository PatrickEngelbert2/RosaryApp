import { getGuideCardLayout } from "@/lib/rosary/guideCardLayouts";
import type {
  GeneratedGuideCard,
  GeneratedGuideCardSet,
  GuideCardBlock,
  GuideCardSide,
} from "@/lib/rosary/types";

export type GuideCardBlockMeasurement = {
  key: string;
  height: number;
};

export type MeasuredGuideCardLayoutInput = {
  cardSet: GeneratedGuideCardSet;
  blockMeasurements: GuideCardBlockMeasurement[];
  faceContentHeight: number;
};

type PackedBlockResult = {
  sides: GuideCardBlock[][];
  warnings: string[];
};

export function getGuideCardBlockKey(block: GuideCardBlock): string {
  return block.layoutInstanceId ?? block.id;
}

export function getGuideCardSourceBlocks(card: GeneratedGuideCard): GuideCardBlock[] {
  if (card.sourceBlocks && card.sourceBlocks.length > 0) {
    return card.sourceBlocks;
  }

  return [
    ...card.front.blocks,
    ...(card.back?.blocks ?? []),
    ...(card.extraSides?.flatMap((side) => side.blocks) ?? []),
  ];
}

export function getGuideCardRenderableSides(card: GeneratedGuideCard): GuideCardSide[] {
  return [card.front, ...(card.back ? [card.back] : []), ...(card.extraSides ?? [])];
}

export function applyMeasuredGuideCardLayout({
  cardSet,
  blockMeasurements,
  faceContentHeight,
}: MeasuredGuideCardLayoutInput): GeneratedGuideCardSet {
  const heightByKey = new Map(blockMeasurements.map((measurement) => [measurement.key, measurement.height]));
  const cards = cardSet.cards.map((card) => applyMeasuredLayoutToCard(card, heightByKey, faceContentHeight));
  const firstCardSides = cards[0] ? getGuideCardRenderableSides(cards[0]) : [];
  const layout = getGuideCardLayout(cardSet.layoutOptions.cardSize);
  const measuredWarnings = cards[0]
    ? packGuideCardBlocksByHeight(getGuideCardSourceBlocks(cards[0]), heightByKey, faceContentHeight).warnings
    : [];
  const continuationWarnings =
    firstCardSides.length > 2
      ? [
          `This ${layout.shortLabel} layout needs continuation faces. All generated content is preserved, but choose a larger card size or print fewer prayers in full for fewer faces.`,
        ]
      : [];

  return {
    ...cardSet,
    cards,
    warnings: [
      ...filterNonMeasuredLayoutWarnings(cardSet.warnings),
      ...measuredWarnings,
      ...continuationWarnings,
    ].filter((warning, index, warnings) => warnings.indexOf(warning) === index),
  };
}

export function packGuideCardBlocksByHeight(
  blocks: GuideCardBlock[],
  heightByKey: Map<string, number>,
  faceContentHeight: number,
): PackedBlockResult {
  const warnings: string[] = [];
  const sides: GuideCardBlock[][] = [];
  let currentSide: GuideCardBlock[] = [];
  let currentHeight = 0;
  let index = 0;
  const capacity = Math.max(1, faceContentHeight);

  while (index < blocks.length) {
    const block = blocks[index];
    const blockHeight = getMeasuredBlockHeight(block, heightByKey, warnings);
    const nextBlock = blocks[index + 1];

    if (block.type === "heading" && nextBlock) {
      const nextHeight = getMeasuredBlockHeight(nextBlock, heightByKey, warnings);
      const pairHeight = blockHeight + nextHeight;
      const remaining = capacity - currentHeight;

      if (currentSide.length > 0 && blockHeight <= remaining && nextHeight > remaining && pairHeight <= capacity) {
        sides.push(currentSide);
        currentSide = [];
        currentHeight = 0;
        continue;
      }
    }

    if (currentHeight + blockHeight <= capacity) {
      currentSide.push(block);
      currentHeight += blockHeight;
      index += 1;
      continue;
    }

    if (currentSide.length > 0) {
      sides.push(currentSide);
      currentSide = [];
      currentHeight = 0;
      continue;
    }

    currentSide.push(block);
    currentHeight = blockHeight;
    warnings.push(`${block.heading ?? block.editableItems?.[0]?.title ?? "A card item"} is too tall for one card face and is placed on its own face.`);
    sides.push(currentSide);
    currentSide = [];
    currentHeight = 0;
    index += 1;
  }

  if (currentSide.length > 0) {
    sides.push(currentSide);
  }

  return {
    sides,
    warnings,
  };
}

export function filterNonMeasuredLayoutWarnings(warnings: string[]): string[] {
  return warnings.filter((warning) => !isEstimateLayoutWarning(warning));
}

function applyMeasuredLayoutToCard(
  card: GeneratedGuideCard,
  heightByKey: Map<string, number>,
  faceContentHeight: number,
): GeneratedGuideCard {
  const sourceBlocks = getGuideCardSourceBlocks(card);
  const { sides } = packGuideCardBlocksByHeight(sourceBlocks, heightByKey, faceContentHeight);
  const [frontBlocks, backBlocks, ...extraBlockGroups] = sides;

  return {
    ...card,
    front: createMeasuredSide("front", card.front.title, card.front.subtitle, frontBlocks ?? []),
    back: backBlocks?.length ? createMeasuredSide("back", card.front.title, "Continued", backBlocks) : undefined,
    extraSides: extraBlockGroups.map((blocks, index) =>
      createMeasuredSide(`extra-${index + 1}`, card.front.title, `Continued ${index + 2}`, blocks),
    ),
    sourceBlocks,
  };
}

function createMeasuredSide(
  id: string,
  title: string,
  subtitle: string | undefined,
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

function getMeasuredBlockHeight(
  block: GuideCardBlock,
  heightByKey: Map<string, number>,
  warnings: string[],
): number {
  const key = getGuideCardBlockKey(block);
  const measuredHeight = heightByKey.get(key);

  if (typeof measuredHeight === "number" && Number.isFinite(measuredHeight) && measuredHeight > 0) {
    return measuredHeight;
  }

  warnings.push(`Measured layout could not read ${block.heading ?? key}, so it used a conservative fallback.`);
  return Number.MAX_SAFE_INTEGER;
}

function isEstimateLayoutWarning(warning: string): boolean {
  return (
    warning.includes("layout needs continuation faces") ||
    warning.includes("layout is dense") ||
    warning.includes("continues on the next card face") ||
    warning.includes("split across card faces") ||
    warning.includes("too dense for one") ||
    warning.includes("too large for one") ||
    warning.includes("Layout integrity warning") ||
    warning.includes("not placed") ||
    warning.includes("estimated room")
  );
}
