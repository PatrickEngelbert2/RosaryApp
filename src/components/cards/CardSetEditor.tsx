"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GeneratedGuideCardPreview } from "@/components/cards/GeneratedGuideCardPreview";
import { Card } from "@/components/ui/Card";
import {
  GUIDE_CARD_SIZE_OPTIONS,
  MAX_CARD_COUNT,
  MIN_CARD_COUNT,
  clampCardCount,
  createDefaultGuideCardLayoutOptions,
  normalizeGuideCardLayoutOptions,
} from "@/lib/rosary/cardUtils";
import {
  createDefaultGeneratedGuideConfig,
  generateGuideCardsFromConfig,
  getRelevantGuidePrayerOptions,
} from "@/lib/rosary/generateGuideCards";
import {
  getActiveRosaryConfig,
  getGuideCardLayoutOptions,
  getGuideCardSelectedGuideId,
  getSavedRosaryConfigs,
  saveGuideCardLayoutOptions,
  saveGuideCardSelectedGuideId,
  setActiveRosaryConfig,
} from "@/lib/rosary/storage";
import type { GuideCardLayoutOptions, PrayerId, UserRosaryConfig } from "@/lib/rosary/types";

const DEFAULT_GUIDE_ID = "default-guide";

export function CardSetEditor() {
  const [savedGuides, setSavedGuides] = useState<UserRosaryConfig[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState(DEFAULT_GUIDE_ID);
  const [layoutOptions, setLayoutOptions] = useState<GuideCardLayoutOptions>(() =>
    createDefaultGuideCardLayoutOptions(),
  );
  const [hasLoadedOptions, setHasLoadedOptions] = useState(false);
  const defaultGuide = useMemo(() => createDefaultGeneratedGuideConfig(), []);

  useEffect(() => {
    queueMicrotask(() => {
      const guides = getSavedRosaryConfigs();
      const selectedGuide = getGuideCardSelectedGuideId();
      const activeGuide = getActiveRosaryConfig();
      setSavedGuides(guides);
      setLayoutOptions(getGuideCardLayoutOptions());

      if (selectedGuide === DEFAULT_GUIDE_ID || guides.some((guide) => guide.id === selectedGuide)) {
        setSelectedGuideId(selectedGuide ?? DEFAULT_GUIDE_ID);
      } else if (activeGuide) {
        setSelectedGuideId(activeGuide.id);
      } else if (guides[0]) {
        setSelectedGuideId(guides[0].id);
      }

      setHasLoadedOptions(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedOptions) {
      return;
    }

    saveGuideCardLayoutOptions(layoutOptions);
    saveGuideCardSelectedGuideId(selectedGuideId);
  }, [hasLoadedOptions, layoutOptions, selectedGuideId]);

  const selectedGuide =
    savedGuides.find((guide) => guide.id === selectedGuideId) ?? defaultGuide;
  const prayerOptions = useMemo(() => getRelevantGuidePrayerOptions(selectedGuide), [selectedGuide]);
  const selectedPrayerIdKey = prayerOptions.map((prayer) => prayer.id).join("|");
  const sanitizedLayoutOptions = useMemo(
    () => {
      const selectedPrayerIds = new Set(selectedPrayerIdKey.split("|").filter(Boolean));

      return normalizeGuideCardLayoutOptions({
        ...layoutOptions,
        fullPrayerIds: layoutOptions.fullPrayerIds.filter((id) => selectedPrayerIds.has(id)),
      });
    },
    [layoutOptions, selectedPrayerIdKey],
  );
  const generatedCardSet = useMemo(
    () => generateGuideCardsFromConfig(selectedGuide, sanitizedLayoutOptions),
    [sanitizedLayoutOptions, selectedGuide],
  );
  const previewCard = generatedCardSet.cards[0];
  const previewSides = previewCard
    ? [previewCard.front, previewCard.back, ...(previewCard.extraSides ?? [])]
    : [];
  const selectedGuideIsSaved = savedGuides.some((guide) => guide.id === selectedGuide.id);
  const printHref = `/cards/print?guide=${encodeURIComponent(
    selectedGuideIsSaved ? selectedGuide.id : DEFAULT_GUIDE_ID,
  )}`;

  function handleGuideChange(id: string) {
    setSelectedGuideId(id);
    saveGuideCardSelectedGuideId(id);
    if (id !== DEFAULT_GUIDE_ID) {
      setActiveRosaryConfig(id);
    }
  }

  function updateLayoutOptions(nextOptions: Partial<GuideCardLayoutOptions>) {
    setLayoutOptions((current) => normalizeGuideCardLayoutOptions({ ...current, ...nextOptions }));
  }

  function toggleFullPrayer(prayerId: PrayerId, checked: boolean) {
    const nextIds = checked
      ? [...layoutOptions.fullPrayerIds, prayerId]
      : layoutOptions.fullPrayerIds.filter((id) => id !== prayerId);
    updateLayoutOptions({ fullPrayerIds: [...new Set(nextIds)] });
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.6fr]">
          <div>
            <h2 className="text-2xl font-semibold text-blue-900">Generate from a saved guide</h2>
            <p className="mt-3 leading-7 text-slate-700">
              These cards are generated from your selected rosary guide. Choose the card size and
              which prayers print in full; the layout engine will keep prayer blocks together and
              warn when a guide is too dense.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Direct card editing will come later. This version focuses on practical cards that
              match the guide you already built.
            </p>
          </div>
          <div className="rounded-lg bg-cream-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Selected guide</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{selectedGuide.name}</p>
            <p className="mt-1 text-sm text-slate-700">{generatedCardSet.mysterySetTitle}</p>
            <p className="mt-2 text-sm text-slate-700">
              {generatedCardSet.cardsPerPage} per page - {generatedCardSet.layoutOptions.cardSize.replace("-", " ")}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="grid gap-5 lg:grid-cols-3">
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
              value={layoutOptions.cardCount}
              onChange={(event) => updateLayoutOptions({ cardCount: clampCardCount(Number(event.target.value)) })}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
            />
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Blank slots stay invisible so front and back alignment is preserved.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900" htmlFor="card-size">
              Card size
            </label>
            <select
              id="card-size"
              value={layoutOptions.cardSize}
              onChange={(event) => updateLayoutOptions({ cardSize: event.target.value as GuideCardLayoutOptions["cardSize"] })}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
            >
              {GUIDE_CARD_SIZE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} - {option.cardsPerPage} per page
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {GUIDE_CARD_SIZE_OPTIONS.find((option) => option.id === layoutOptions.cardSize)?.description}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-blue-900/10 pt-5">
          <h3 className="text-lg font-semibold text-blue-900">Prayer text on cards</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Choose which prayers should be printed in full. Other prayers use compact references to
            save space.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {prayerOptions.map((prayer) => (
              <label
                key={prayer.id}
                htmlFor={`full-prayer-${prayer.id}`}
                className="flex gap-3 rounded-md border border-blue-900/10 bg-white px-3 py-3 text-sm text-slate-700"
              >
                <input
                  id={`full-prayer-${prayer.id}`}
                  type="checkbox"
                  value={prayer.id}
                  checked={sanitizedLayoutOptions.fullPrayerIds.includes(prayer.id)}
                  disabled={!prayer.text}
                  onChange={(event) => toggleFullPrayer(prayer.id, event.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  <span className="block font-semibold text-blue-900">{prayer.title}</span>
                  <span className="block text-xs leading-5 text-slate-600">
                    {prayer.text ? "Print full text when checked." : "No full text is available."}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={printHref}
            onClick={() => {
              saveGuideCardLayoutOptions(sanitizedLayoutOptions);
              saveGuideCardSelectedGuideId(selectedGuideId);
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
            Generated card preview
          </h2>
          <p className="mt-2 leading-7 text-slate-700">
            Previewing card 1 of {generatedCardSet.cardCount}. The preview updates with guide,
            card count, card size, and full-prayer choices.
          </p>
        </div>
        {generatedCardSet.warnings.length > 0 ? (
          <div className="mb-4 space-y-2 rounded-md bg-cream-100 px-4 py-3 text-sm font-medium text-slate-700">
            {generatedCardSet.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}
        {previewSides.length > 0 ? (
          <GeneratedGuideCardPreview
            sides={previewSides}
            cardSize={generatedCardSet.layoutOptions.cardSize}
          />
        ) : null}
      </section>
    </div>
  );
}
