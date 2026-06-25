import type { CardSlot, RosaryCardContent, RosaryCardSet } from "@/lib/rosary/types";

export const DEFAULT_CARD_COUNT = 4;
export const MIN_CARD_COUNT = 1;
export const MAX_CARD_COUNT = 24;
export const CARDS_PER_PRINT_PAGE = 4;

export function clampCardCount(count: number): number {
  return Math.min(MAX_CARD_COUNT, Math.max(MIN_CARD_COUNT, Math.round(count)));
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
