"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PrintCardPage } from "@/components/cards/PrintCardPage";
import { clampCardCount } from "@/lib/rosary/cardUtils";
import {
  chunkCardsForPrint,
  createDefaultGeneratedGuideConfig,
  generateGuideCardsFromConfig,
} from "@/lib/rosary/generateGuideCards";
import { getActiveRosaryConfig, getSavedRosaryConfigs } from "@/lib/rosary/storage";
import type { UserRosaryConfig } from "@/lib/rosary/types";

const DEFAULT_GUIDE_ID = "default-guide";

export function PrintCardsClient() {
  const [guide, setGuide] = useState<UserRosaryConfig>(() => createDefaultGeneratedGuideConfig());
  const [cardCount, setCardCount] = useState(4);
  const [usedFallback, setUsedFallback] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const guideId = params.get("guide");
      const count = clampCardCount(Number(params.get("count") ?? 4));
      const savedGuides = getSavedRosaryConfigs();
      const wantsDefaultGuide = guideId === DEFAULT_GUIDE_ID;

      setCardCount(count);

      if (wantsDefaultGuide) {
        setGuide(createDefaultGeneratedGuideConfig());
        setUsedFallback(savedGuides.length === 0);
        return;
      }

      const selectedGuide =
        guideId ? savedGuides.find((item) => item.id === guideId) : undefined;
      const activeGuide = getActiveRosaryConfig();
      const nextGuide = selectedGuide ?? activeGuide ?? savedGuides[0];

      if (nextGuide) {
        setGuide(nextGuide);
        setUsedFallback(false);
        return;
      }

      setGuide(createDefaultGeneratedGuideConfig());
      setUsedFallback(true);
    });
  }, []);

  const generatedCardSet = useMemo(
    () => generateGuideCardsFromConfig(guide, cardCount),
    [cardCount, guide],
  );
  const printGroups = useMemo(
    () => chunkCardsForPrint(generatedCardSet.cards),
    [generatedCardSet.cards],
  );

  return (
    <>
      <div className="no-print mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-blue-900/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            Print Cards
          </p>
          <h1 className="mt-2 text-3xl font-bold text-blue-900">
            {generatedCardSet.sourceRosaryConfigName}
          </h1>
          <p className="mt-3 leading-7 text-slate-700">
            This print view renders {generatedCardSet.cardCount} generated pocket{" "}
            {generatedCardSet.cardCount === 1 ? "card" : "cards"} from the selected guide. Use
            your browser print dialog to print or save as PDF. For double-sided printing, try flip
            on long edge first; if backs are upside down, try flip on short edge.
          </p>
          <p className="mt-3 rounded-md bg-cream-100 px-4 py-3 text-sm font-medium text-slate-700">
            {generatedCardSet.mysterySetTitle} - front and back pages preserve matching grid slots.
          </p>
          {usedFallback ? (
            <p className="mt-3 rounded-md bg-cream-100 px-4 py-3 text-sm font-medium text-slate-700">
              No saved guide was found, so this page is showing a default generated guide.
            </p>
          ) : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.print()}
              className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-5 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            >
              Print / Save as PDF
            </button>
            <Link
              href="/cards"
              className="interactive-button interactive-button-secondary inline-flex items-center justify-center rounded-md border border-blue-900/20 bg-white px-5 py-3 font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            >
              Back to Guide Cards
            </Link>
          </div>
        </div>
      </div>

      <div className="print-document">
        {printGroups.map((cards, index) => (
          <div key={`print-group-${index}`}>
            <PrintCardPage
              cards={cards}
              side="front"
              pageLabel={`Sheet ${index + 1} fronts`}
            />
            <PrintCardPage
              cards={cards}
              side="back"
              pageLabel={`Sheet ${index + 1} backs`}
            />
          </div>
        ))}
      </div>
    </>
  );
}
