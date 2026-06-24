"use client";

import { CardContentEditor } from "@/components/cards/CardContentEditor";
import { CardPreview } from "@/components/cards/CardPreview";
import { resolveCardSlotContent } from "@/lib/rosary/cardUtils";
import { structuredCloneSafe } from "@/lib/rosary/defaultCards";
import type { CardSlot, RosaryCardSet } from "@/lib/rosary/types";

type CardSlotEditorProps = {
  cardSet: RosaryCardSet;
  slot: CardSlot;
  onChange: (slot: CardSlot) => void;
};

export function CardSlotEditor({ cardSet, slot, onChange }: CardSlotEditorProps) {
  const content = resolveCardSlotContent(cardSet, slot);

  function toggleUseMaster(useMasterCard: boolean) {
    onChange({
      ...slot,
      useMasterCard,
      overrideContent:
        useMasterCard || slot.overrideContent
          ? slot.overrideContent
          : structuredCloneSafe(cardSet.masterCard),
    });
  }

  return (
    <section className="rounded-lg border border-blue-900/10 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-blue-900">Card {slot.cardNumber}</h3>
          <p className="text-sm text-slate-700">
            {slot.useMasterCard ? "Uses the master card" : "Customized separately"}
          </p>
        </div>
        <label className="flex items-center gap-3 rounded-md bg-cream-50 px-4 py-3">
          <input
            type="checkbox"
            checked={slot.useMasterCard}
            onChange={(event) => toggleUseMaster(event.target.checked)}
          />
          <span className="font-medium text-slate-800">Use master card</span>
        </label>
      </div>

      {slot.useMasterCard ? (
        <div className="mt-4">
          <CardPreview content={content} label={`Card ${slot.cardNumber}`} />
        </div>
      ) : (
        <div className="mt-4">
          <CardContentEditor
            content={content}
            onChange={(nextContent) =>
              onChange({ ...slot, useMasterCard: false, overrideContent: nextContent })
            }
          />
          <div className="mt-4">
            <CardPreview content={content} label={`Card ${slot.cardNumber}`} />
          </div>
        </div>
      )}
    </section>
  );
}
