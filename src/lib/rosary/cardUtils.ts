import type {
  CardSlot,
  GuideCardLayoutOptions,
  GuideCardSize,
  RosaryCardContent,
  RosaryCardSet,
} from "@/lib/rosary/types";
import {
  GUIDE_CARD_LAYOUTS,
  getGuideCardLayout,
  normalizeGuideCardSize,
} from "@/lib/rosary/guideCardLayouts";

export const DEFAULT_CARD_COUNT = 4;
export const MIN_CARD_COUNT = 1;
export const MAX_CARD_COUNT = 24;
export const CARDS_PER_PRINT_PAGE = 4;
export const DEFAULT_GUIDE_CARD_SIZE: GuideCardSize = "pocket-4";
export const DEFAULT_FULL_PRAYER_IDS = ["apostles-creed"] as const;

export const GUIDE_CARD_SIZE_OPTIONS = GUIDE_CARD_LAYOUTS;

export function clampCardCount(count: number): number {
  return Math.min(MAX_CARD_COUNT, Math.max(MIN_CARD_COUNT, Math.round(count)));
}

export function getCardsPerPage(cardSize: GuideCardSize): number {
  return getGuideCardLayout(cardSize).cardsPerPage;
}

export function isGuideCardSize(value: string | null | undefined): value is GuideCardSize {
  return Boolean(value && normalizeGuideCardSize(value) === value);
}

export function createDefaultGuideCardLayoutOptions(): GuideCardLayoutOptions {
  return {
    cardSize: DEFAULT_GUIDE_CARD_SIZE,
    cardCount: DEFAULT_CARD_COUNT,
    fullPrayerIds: [...DEFAULT_FULL_PRAYER_IDS],
    includeOverflowWarnings: true,
  };
}

export function normalizeGuideCardLayoutOptions(
  options: Partial<GuideCardLayoutOptions> | undefined,
): GuideCardLayoutOptions {
  const defaults = createDefaultGuideCardLayoutOptions();
  const fullPrayerIds = Array.isArray(options?.fullPrayerIds) ? options.fullPrayerIds : defaults.fullPrayerIds;

  return {
    cardSize: normalizeGuideCardSize(options?.cardSize),
    cardCount: clampCardCount(Number(options?.cardCount ?? defaults.cardCount)),
    fullPrayerIds: [...new Set(fullPrayerIds)],
    includeOverflowWarnings: options?.includeOverflowWarnings ?? defaults.includeOverflowWarnings,
  };
}

export function resolveCardSlotContent(
  cardSet: RosaryCardSet,
  cardSlot: CardSlot,
): RosaryCardContent {
  if (cardSlot.useMasterCard || !cardSlot.overrideContent) {
    return cardSet.masterCard;
  }

  return cardSlot.overrideContent;
}

export function ensureCardSlots(cardSet: RosaryCardSet): RosaryCardSet {
  const cardCount = clampCardCount(cardSet.cardCount);
  const slots = [...cardSet.cardSlots];

  for (let index = slots.length; index < cardCount; index += 1) {
    slots.push(createCardSlot(index + 1));
  }

  return {
    ...cardSet,
    cardCount,
    cardSlots: slots.map((slot, index) => ({
      ...slot,
      cardNumber: index + 1,
    })),
  };
}

export function createCardSlot(cardNumber: number): CardSlot {
  return {
    id: `card-slot-${cardNumber}`,
    cardNumber,
    useMasterCard: true,
  };
}

export function getVisibleCardSlots(cardSet: RosaryCardSet): CardSlot[] {
  return ensureCardSlots(cardSet).cardSlots.slice(0, cardSet.cardCount);
}

export function chunkCardsForPrint<T>(cards: T[], cardsPerPage = CARDS_PER_PRINT_PAGE): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < cards.length; index += cardsPerPage) {
    chunks.push(cards.slice(index, index + cardsPerPage));
  }

  return chunks;
}
