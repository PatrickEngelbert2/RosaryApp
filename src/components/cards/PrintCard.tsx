import { GuideCardFace } from "@/components/cards/GuideCardFace";
import type { GeneratedGuideCard, GuideCardSide } from "@/lib/rosary/types";

type PrintCardProps = {
  card: GeneratedGuideCard;
  side: "front" | "back";
  extraSideIndex?: number;
};

export function PrintCard({ card, side, extraSideIndex }: PrintCardProps) {
  const cardSide: GuideCardSide =
    typeof extraSideIndex === "number" ? card.extraSides?.[extraSideIndex] ?? card.front : card[side] ?? card.front;

  return <GuideCardFace side={cardSide} cardSize={card.layoutOptions.cardSize} mode="print" />;
}
