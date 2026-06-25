import { PrintCard } from "@/components/cards/PrintCard";
import type { GeneratedGuideCard, GuideCardSize } from "@/lib/rosary/types";

type PrintCardPageProps = {
  cards: GeneratedGuideCard[];
  side: "front" | "back";
  pageLabel: string;
  cardsPerPage: number;
  cardSize: GuideCardSize;
  extraSideIndex?: number;
};

export function PrintCardPage({
  cards,
  side,
  pageLabel,
  cardsPerPage,
  cardSize,
  extraSideIndex,
}: PrintCardPageProps) {
  const gridSlots = Array.from({ length: cardsPerPage }, (_, index) => cards[index]);

  return (
    <section className={`print-page print-page-${cardSize}`} aria-label={pageLabel}>
      {gridSlots.map((card, index) =>
        card ? (
          <PrintCard key={card.id} card={card} side={side} extraSideIndex={extraSideIndex} />
        ) : (
          <div key={`blank-${index}`} className="blank-print-slot" aria-hidden="true" />
        ),
      )}
    </section>
  );
}
