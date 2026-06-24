import { PrintCard } from "@/components/cards/PrintCard";
import { resolveCardSlotContent } from "@/lib/rosary/cardUtils";
import type { CardSlot, RosaryCardSet } from "@/lib/rosary/types";

type PrintCardPageProps = {
  cardSet: RosaryCardSet;
  slots: CardSlot[];
  side: "front" | "back";
  pageLabel: string;
};

export function PrintCardPage({ cardSet, slots, side, pageLabel }: PrintCardPageProps) {
  const gridSlots = Array.from({ length: 4 }, (_, index) => slots[index]);

  return (
    <section className="print-page" aria-label={pageLabel}>
      {gridSlots.map((slot, index) =>
        slot ? (
          <PrintCard
            key={slot.id}
            content={resolveCardSlotContent(cardSet, slot)}
            side={side}
            cardNumber={slot.cardNumber}
          />
        ) : (
          <div key={`blank-${index}`} className="blank-print-slot" aria-hidden="true" />
        ),
      )}
    </section>
  );
}
