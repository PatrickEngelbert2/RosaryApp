import { PrintCard } from "@/components/cards/PrintCard";
import type { GeneratedGuideCard } from "@/lib/rosary/types";

type PrintCardPageProps = {
  cards: GeneratedGuideCard[];
  side: "front" | "back";
  pageLabel: string;
};

export function PrintCardPage({ cards, side, pageLabel }: PrintCardPageProps) {
  const gridSlots = Array.from({ length: 4 }, (_, index) => cards[index]);

  return (
    <section className="print-page" aria-label={pageLabel}>
      {gridSlots.map((card, index) =>
        card ? (
          <PrintCard key={card.id} card={card} side={side} />
        ) : (
          <div key={`blank-${index}`} className="blank-print-slot" aria-hidden="true" />
        ),
      )}
    </section>
  );
}
