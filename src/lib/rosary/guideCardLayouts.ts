import type { GuideCardSize } from "@/lib/rosary/types";

export type GuideCardLayoutDefinition = {
  id: GuideCardSize;
  label: string;
  shortLabel: string;
  description: string;
  cardsPerPage: number;
  gridColumns: number;
  gridRows: number;
  capacity: number;
  bodyCharsPerLine: number;
  compactCharsPerLine: number;
  headingWeight: number;
  sectionGapWeight: number;
};

export const GUIDE_CARD_LAYOUTS: GuideCardLayoutDefinition[] = [
  {
    id: "pocket-4",
    label: "Pocket - 4 per page",
    shortLabel: "pocket 4-up",
    description: "Four compact pocket cards in a 2 by 2 grid.",
    cardsPerPage: 4,
    gridColumns: 2,
    gridRows: 2,
    capacity: 34,
    bodyCharsPerLine: 64,
    compactCharsPerLine: 72,
    headingWeight: 1.1,
    sectionGapWeight: 0.5,
  },
  {
    id: "tall-3",
    label: "Tall - 3 per page",
    shortLabel: "tall 3-up",
    description: "Three tall, narrow cards across the sheet in 1 row by 3 columns.",
    cardsPerPage: 3,
    gridColumns: 3,
    gridRows: 1,
    capacity: 66,
    bodyCharsPerLine: 38,
    compactCharsPerLine: 44,
    headingWeight: 1,
    sectionGapWeight: 0.45,
  },
  {
    id: "wide-3",
    label: "Wide - 3 per page",
    shortLabel: "wide 3-up",
    description: "Three wide cards stacked down the sheet in 3 rows by 1 column.",
    cardsPerPage: 3,
    gridColumns: 1,
    gridRows: 3,
    capacity: 17,
    bodyCharsPerLine: 72,
    compactCharsPerLine: 84,
    headingWeight: 1.2,
    sectionGapWeight: 0.45,
  },
  {
    id: "tall-2",
    label: "Tall - 2 per page",
    shortLabel: "tall 2-up",
    description: "Two tall half-sheet cards across the sheet in 1 row by 2 columns.",
    cardsPerPage: 2,
    gridColumns: 2,
    gridRows: 1,
    capacity: 82,
    bodyCharsPerLine: 72,
    compactCharsPerLine: 82,
    headingWeight: 1.15,
    sectionGapWeight: 0.5,
  },
  {
    id: "wide-2",
    label: "Wide - 2 per page",
    shortLabel: "wide 2-up",
    description: "Two wide half-sheet cards stacked down the sheet in 2 rows by 1 column.",
    cardsPerPage: 2,
    gridColumns: 1,
    gridRows: 2,
    capacity: 34,
    bodyCharsPerLine: 82,
    compactCharsPerLine: 96,
    headingWeight: 1.3,
    sectionGapWeight: 0.55,
  },
  {
    id: "full-1",
    label: "Full page - 1 per page",
    shortLabel: "full page",
    description: "One full-page guide card for the most readable print layout.",
    cardsPerPage: 1,
    gridColumns: 1,
    gridRows: 1,
    capacity: 54,
    bodyCharsPerLine: 62,
    compactCharsPerLine: 74,
    headingWeight: 1.8,
    sectionGapWeight: 0.8,
  },
];

export const GUIDE_CARD_LAYOUT_BY_ID = new Map(
  GUIDE_CARD_LAYOUTS.map((layout) => [layout.id, layout]),
);

export function getGuideCardLayout(cardSize: GuideCardSize): GuideCardLayoutDefinition {
  return GUIDE_CARD_LAYOUT_BY_ID.get(cardSize) ?? GUIDE_CARD_LAYOUTS[0];
}

export function normalizeGuideCardSize(value: string | null | undefined): GuideCardSize {
  if (value && GUIDE_CARD_LAYOUT_BY_ID.has(value as GuideCardSize)) {
    return value as GuideCardSize;
  }

  if (value === "pocket") return "pocket-4";
  if (value === "tall") return "wide-3";
  if (value === "large") return "wide-2";
  if (value === "full-page") return "full-1";

  return "pocket-4";
}
