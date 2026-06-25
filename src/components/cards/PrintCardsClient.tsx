"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PrintCardPage } from "@/components/cards/PrintCardPage";
import { chunkCardsForPrint, ensureCardSlots, getVisibleCardSlots } from "@/lib/rosary/cardUtils";
import { createDefaultCardSetFromRosaryConfig } from "@/lib/rosary/defaultCards";
import { getActiveCardSet } from "@/lib/rosary/storage";
import type { RosaryCardSet } from "@/lib/rosary/types";

export function PrintCardsClient() {
  const [cardSet, setCardSet] = useState<RosaryCardSet>(() =>
    createDefaultCardSetFromRosaryConfig(),
  );
  const [usedFallback, setUsedFallback] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      const active = getActiveCardSet();
      if (active) {
        setCardSet(ensureCardSlots(active));
        setUsedFallback(false);
      }
    });
  }, []);

  const printGroups = useMemo(
    () => chunkCardsForPrint(getVisibleCardSlots(cardSet)),
    [cardSet],
  );

  return (
    <>
      <div className="no-print mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-blue-900/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            Print Cards
          </p>
          <h1 className="mt-2 text-3xl font-bold text-blue-900">{cardSet.name}</h1>
          <p className="mt-3 leading-7 text-slate-700">
            Use your browser print dialog to print or save as PDF. For double-sided printing, try
            flip on long edge first. If the backs are upside down, try flip on short edge. Print a
            test page before printing many copies.
          </p>
          {usedFallback ? (
            <p className="mt-3 rounded-md bg-cream-100 px-4 py-3 text-sm font-medium text-slate-700">
              No active saved card set was found, so this page is showing a default card set.
            </p>
          ) : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Print / Save as PDF
            </button>
            <Link
              href="/cards"
              className="inline-flex items-center justify-center rounded-md border border-blue-900/20 bg-white px-5 py-3 font-semibold text-blue-900"
            >
              Back to card builder
            </Link>
          </div>
        </div>
      </div>

      <div className="print-document">
        {printGroups.map((slots, index) => (
          <div key={`print-group-${index}`}>
            <PrintCardPage
              cardSet={cardSet}
              slots={slots}
              side="front"
              pageLabel={`Sheet ${index + 1} fronts`}
            />
            <PrintCardPage
              cardSet={cardSet}
              slots={slots}
              side="back"
              pageLabel={`Sheet ${index + 1} backs`}
            />
          </div>
        ))}
      </div>
    </>
  );
}
