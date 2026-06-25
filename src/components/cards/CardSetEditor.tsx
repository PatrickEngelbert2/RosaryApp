"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GeneratedGuideCardPreview } from "@/components/cards/GeneratedGuideCardPreview";
import { Card } from "@/components/ui/Card";
import { DEFAULT_CARD_COUNT, MAX_CARD_COUNT, MIN_CARD_COUNT, clampCardCount } from "@/lib/rosary/cardUtils";
import {
  createDefaultGeneratedGuideConfig,
  generateGuideCardsFromConfig,
} from "@/lib/rosary/generateGuideCards";
import {
  getActiveRosaryConfig,
  getSavedRosaryConfigs,
  setActiveRosaryConfig,
} from "@/lib/rosary/storage";
import type { UserRosaryConfig } from "@/lib/rosary/types";

const DEFAULT_GUIDE_ID = "default-guide";

export function CardSetEditor() {
  const [savedGuides, setSavedGuides] = useState<UserRosaryConfig[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState(DEFAULT_GUIDE_ID);
  const [cardCount, setCardCount] = useState(DEFAULT_CARD_COUNT);
  const defaultGuide = useMemo(() => createDefaultGeneratedGuideConfig(), []);

  useEffect(() => {
    queueMicrotask(() => {
      const guides = getSavedRosaryConfigs();
      const activeGuide = getActiveRosaryConfig();
      setSavedGuides(guides);

      if (activeGuide) {
        setSelectedGuideId(activeGuide.id);
        return;
      }

      if (guides[0]) {
        setSelectedGuideId(guides[0].id);
      }
    });
  }, []);

  const selectedGuide =
    savedGuides.find((guide) => guide.id === selectedGuideId) ?? defaultGuide;
  const generatedCardSet = useMemo(
    () => generateGuideCardsFromConfig(selectedGuide, cardCount),
    [cardCount, selectedGuide],
  );
  const previewCard = generatedCardSet.cards[0];
  const printHref = `/cards/print?guide=${encodeURIComponent(
    savedGuides.some((guide) => guide.id === selectedGuide.id) ? selectedGuide.id : DEFAULT_GUIDE_ID,
  )}&count=${generatedCardSet.cardCount}`;

  function handleGuideChange(id: string) {
    setSelectedGuideId(id);
    if (id !== DEFAULT_GUIDE_ID) {
      setActiveRosaryConfig(id);
    }
  }

  function handleCardCountChange(value: number) {
    setCardCount(clampCardCount(value));
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.6fr]">
          <div>
            <h2 className="text-2xl font-semibold text-blue-900">Generate from a saved guide</h2>
            <p className="mt-3 leading-7 text-slate-700">
              These pocket cards are generated from your selected rosary guide. To change prayers,
              mysteries, saint invocations, or leader notes, edit the guide and save it again.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Direct card editing will come later; this version focuses on useful cards that match
              the guide you already built.
            </p>
          </div>
          <div className="rounded-lg bg-cream-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Selected guide</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{selectedGuide.name}</p>
            <p className="mt-1 text-sm text-slate-700">{generatedCardSet.mysterySetTitle}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-blue-900" htmlFor="guide-select">
              Rosary guide
            </label>
            <select
              id="guide-select"
              value={selectedGuideId}
              onChange={(event) => handleGuideChange(event.target.value)}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
            >
              {savedGuides.length === 0 ? (
                <option value={DEFAULT_GUIDE_ID}>Default Standard Rosary</option>
              ) : null}
              {savedGuides.map((guide) => (
                <option key={guide.id} value={guide.id}>
                  {guide.name}
                </option>
              ))}
              {savedGuides.length > 0 ? (
                <option value={DEFAULT_GUIDE_ID}>Default Standard Rosary</option>
              ) : null}
            </select>
            {savedGuides.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-700">
                No saved guides were found, so this page is showing useful default cards. You can{" "}
                <Link className="interactive-link font-semibold text-blue-900 underline" href="/builder">
                  build and save a guide
                </Link>{" "}
                when you are ready.
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900" htmlFor="card-count">
              Number of cards needed
            </label>
            <input
              id="card-count"
              type="number"
              min={MIN_CARD_COUNT}
              max={MAX_CARD_COUNT}
              value={cardCount}
              onChange={(event) => handleCardCountChange(Number(event.target.value))}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
            />
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Cards print four per US Letter sheet. Blank slots stay invisible so front and back
              alignment is preserved.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={printHref}
            onClick={() => {
              if (selectedGuideId !== DEFAULT_GUIDE_ID) {
                setActiveRosaryConfig(selectedGuideId);
              }
            }}
            className="interactive-button interactive-button-primary inline-flex items-center justify-center rounded-md bg-blue-900 px-5 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            Print / Save as PDF
          </Link>
          <Link
            href="/builder"
            className="interactive-button interactive-button-secondary inline-flex items-center justify-center rounded-md border border-blue-900/20 bg-white px-5 py-3 font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            Build or edit guide
          </Link>
        </div>
      </Card>

      <section aria-labelledby="generated-card-preview">
        <div className="mb-4">
          <h2 id="generated-card-preview" className="text-2xl font-semibold text-blue-900">
            Generated pocket card preview
          </h2>
          <p className="mt-2 leading-7 text-slate-700">
            Previewing card 1 of {generatedCardSet.cardCount}. Each generated card currently uses
            the same practical front and back so groups can print consistent participant cards.
          </p>
        </div>
        {generatedCardSet.warnings.length > 0 ? (
          <div className="mb-4 rounded-md bg-cream-100 px-4 py-3 text-sm font-medium text-slate-700">
            {generatedCardSet.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}
        {previewCard ? (
          <GeneratedGuideCardPreview front={previewCard.front} back={previewCard.back} />
        ) : null}
      </section>
    </div>
  );
}
