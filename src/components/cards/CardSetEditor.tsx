"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { prayersById } from "@/content/prayers";
import { GeneratedGuideCardPreview } from "@/components/cards/GeneratedGuideCardPreview";
import type {
  GuideCardDragState,
  GuideCardDropPosition,
  GuideCardEditAction,
} from "@/components/cards/GuideCardFace";
import { Card } from "@/components/ui/Card";
import {
  GUIDE_CARD_SIZE_OPTIONS,
  MAX_CARD_COUNT,
  MIN_CARD_COUNT,
  clampCardCount,
  createDefaultGuideCardLayoutOptions,
  getCardsPerPage,
  normalizeGuideCardLayoutOptions,
} from "@/lib/rosary/cardUtils";
import { createId } from "@/lib/rosary/configUtils";
import { getGuideCardLayout } from "@/lib/rosary/guideCardLayouts";
import {
  createDefaultGeneratedGuideConfig,
  generateGuideCardsFromConfig,
  getRelevantGuidePrayerOptions,
} from "@/lib/rosary/generateGuideCards";
import {
  applyFullPrayerOverrides,
  createGuideCardCustomItem,
  findDuplicateIds,
  getVisibleEditableItemIds,
  hasGuideCardCustomizationEdits,
  insertEditableItemAfter,
  moveEditableItem,
  removePrayerOverride,
  reorderEditableItem,
} from "@/lib/rosary/guideCardCustomizations";
import {
  getActiveRosaryConfig,
  createEmptyGuideCardCustomization,
  getGuideCardCustomization,
  getGuideCardLayoutOptions,
  getGuideCardSelectedGuideId,
  getSavedRosaryConfigs,
  resetGuideCardCustomization,
  saveGuideCardCustomization,
  saveGuideCardLayoutOptions,
  saveGuideCardSelectedGuideId,
  setActiveRosaryConfig,
} from "@/lib/rosary/storage";
import { getPrayerIncipit, getPrayerLanguage, getPrayerVariant, isPrayerId, latinPrayerIds } from "@/lib/rosary/prayerText";
import type {
  GuideCardCustomization,
  GuideCardCustomItemKind,
  GuideCardLayoutOptions,
  PrayerId,
  PrayerLanguage,
  UserRosaryConfig,
} from "@/lib/rosary/types";

const DEFAULT_GUIDE_ID = "default-guide";

export function CardSetEditor() {
  const [savedGuides, setSavedGuides] = useState<UserRosaryConfig[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState(DEFAULT_GUIDE_ID);
  const [layoutOptions, setLayoutOptions] = useState<GuideCardLayoutOptions>(() =>
    createDefaultGuideCardLayoutOptions(),
  );
  const [customization, setCustomization] = useState<GuideCardCustomization>(() =>
    createEmptyGuideCardCustomization(DEFAULT_GUIDE_ID),
  );
  const [editingText, setEditingText] = useState<{
    id: string;
    label: string;
    value: string;
    multiline: boolean;
  } | null>(null);
  const [addingItem, setAddingItem] = useState<{
    targetItemId?: string;
    sectionId?: string;
  } | null>(null);
  const [dragState, setDragState] = useState<GuideCardDragState>({});
  const [hasLoadedOptions, setHasLoadedOptions] = useState(false);
  const defaultGuide = useMemo(() => createDefaultGeneratedGuideConfig(), []);

  useEffect(() => {
    queueMicrotask(() => {
      const guides = getSavedRosaryConfigs();
      const selectedGuide = getGuideCardSelectedGuideId();
      const activeGuide = getActiveRosaryConfig();
      const nextSelectedGuideId =
        selectedGuide === DEFAULT_GUIDE_ID || guides.some((guide) => guide.id === selectedGuide)
          ? selectedGuide ?? DEFAULT_GUIDE_ID
          : activeGuide?.id ?? guides[0]?.id ?? DEFAULT_GUIDE_ID;
      setSavedGuides(guides);
      setLayoutOptions(getGuideCardLayoutOptions());
      setSelectedGuideId(nextSelectedGuideId);

      const nextGuide =
        guides.find((guide) => guide.id === nextSelectedGuideId) ??
        (nextSelectedGuideId === DEFAULT_GUIDE_ID ? createDefaultGeneratedGuideConfig() : undefined) ??
        activeGuide ??
        guides[0] ??
        createDefaultGeneratedGuideConfig();
      setCustomization(getGuideCardCustomization(nextGuide.id));

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
  const selectedCustomization =
    customization.guideId === selectedGuide.id
      ? customization
      : createEmptyGuideCardCustomization(selectedGuide.id);
  const prayerOptions = useMemo(() => getRelevantGuidePrayerOptions(selectedGuide), [selectedGuide]);
  const languagePrayerOptions = useMemo(() => {
    const ids = new Set<PrayerId>(["sign-of-the-cross", ...prayerOptions.map((prayer) => prayer.id)]);
    return latinPrayerIds.filter((prayerId) => ids.has(prayerId)).map((prayerId) => prayersById[prayerId]);
  }, [prayerOptions]);
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
  const effectiveFullPrayerIds = useMemo(
    () => applyFullPrayerOverrides(sanitizedLayoutOptions.fullPrayerIds, selectedCustomization),
    [sanitizedLayoutOptions.fullPrayerIds, selectedCustomization],
  );
  const generatedCardSet = useMemo(
    () => generateGuideCardsFromConfig(selectedGuide, sanitizedLayoutOptions, undefined, selectedCustomization),
    [sanitizedLayoutOptions, selectedCustomization, selectedGuide],
  );
  const currentLayout = getGuideCardLayout(sanitizedLayoutOptions.cardSize);
  const previewCard = generatedCardSet.cards[0];
  const previewSides = useMemo(
    () =>
      previewCard
        ? [previewCard.front, ...(previewCard.back ? [previewCard.back] : []), ...(previewCard.extraSides ?? [])]
        : [],
    [previewCard],
  );
  const hasBackSide = Boolean(previewCard?.back);
  const extraSideCount = previewCard?.extraSides?.length ?? 0;
  const sideUsageSummary =
    extraSideCount > 0
      ? `Needs front, back, and ${extraSideCount} extra ${extraSideCount === 1 ? "side" : "sides"}.`
      : hasBackSide
        ? "Uses front and back."
        : "Fits on one side with these settings.";
  const previewStatus =
    extraSideCount > 0
      ? `This guide needs front, back, and ${extraSideCount} extra ${
          extraSideCount === 1 ? "side" : "sides"
        } with the current settings.`
      : hasBackSide
        ? "This guide uses front and back with the current settings."
        : "This guide fits on one side with the current settings; no back page will print.";
  const selectedGuideIsSaved = savedGuides.some((guide) => guide.id === selectedGuide.id);
  const printHref = `/cards/print?guide=${encodeURIComponent(
    selectedGuideIsSaved ? selectedGuide.id : DEFAULT_GUIDE_ID,
  )}`;
  const visibleEditableItemIds = useMemo(() => getVisibleEditableItemIds(previewSides), [previewSides]);
  const hasCardEdits = hasGuideCardCustomizationEdits(selectedCustomization);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const duplicateItemIds = findDuplicateIds(visibleEditableItemIds);

    if (duplicateItemIds.length === 0) {
      return;
    }

    console.warn("Guide card editor invariant warning: duplicate editable item IDs.", {
      guideId: selectedGuide.id,
      duplicateItemIds,
      affectedSideIds: previewSides.map((side) => side.id),
    });
  }, [previewSides, selectedGuide.id, visibleEditableItemIds]);

  function handleGuideChange(id: string) {
    setSelectedGuideId(id);
    saveGuideCardSelectedGuideId(id);
    const nextGuide = savedGuides.find((guide) => guide.id === id) ?? defaultGuide;
    setCustomization(getGuideCardCustomization(nextGuide.id));
    if (id !== DEFAULT_GUIDE_ID) {
      setActiveRosaryConfig(id);
    }
  }

  function updateLayoutOptions(nextOptions: Partial<GuideCardLayoutOptions>) {
    setLayoutOptions((current) => normalizeGuideCardLayoutOptions({ ...current, ...nextOptions }));
  }

  function handleCardSizeChange(cardSize: GuideCardLayoutOptions["cardSize"]) {
    setLayoutOptions((current) => {
      const currentDefaultCount = getCardsPerPage(current.cardSize);
      const nextDefaultCount = getCardsPerPage(cardSize);
      const shouldUseLayoutDefault = current.cardCount === currentDefaultCount;

      return normalizeGuideCardLayoutOptions({
        ...current,
        cardSize,
        cardCount: shouldUseLayoutDefault ? nextDefaultCount : current.cardCount,
      });
    });
  }

  function handleCardCountChange(cardCount: number) {
    updateLayoutOptions({ cardCount: clampCardCount(cardCount) });
  }

  function toggleFullPrayer(prayerId: PrayerId, checked: boolean) {
    const nextIds = checked
      ? [...layoutOptions.fullPrayerIds, prayerId]
      : layoutOptions.fullPrayerIds.filter((id) => id !== prayerId);
    updateLayoutOptions({ fullPrayerIds: [...new Set(nextIds)] });
    updateCustomization((current) => ({
      ...current,
      fullPrayerOverrides: removePrayerOverride(current.fullPrayerOverrides, prayerId),
    }));
  }

  function toggleFullPrayerFromPreview(prayerId: string | undefined, checked: boolean) {
    if (!isPrayerId(prayerId)) {
      return;
    }

    updateCustomization((current) => ({
      ...current,
      fullPrayerOverrides: {
        ...current.fullPrayerOverrides,
        [prayerId]: checked,
      },
    }));
  }

  function updateCardPrayerLanguage(prayerId: PrayerId, value: PrayerLanguage | "guide-default") {
    updateCustomization((current) => {
      const nextOverrides = { ...(current.prayerLanguageOverrides ?? {}) };

      if (value === "guide-default") {
        delete nextOverrides[prayerId];
      } else {
        nextOverrides[prayerId] = value;
      }

      return {
        ...current,
        prayerLanguageOverrides: nextOverrides,
      };
    });
  }

  function updateCustomization(
    updater: (current: GuideCardCustomization) => GuideCardCustomization,
  ) {
    setCustomization((current) => {
      const currentForGuide =
        current.guideId === selectedGuide.id ? current : createEmptyGuideCardCustomization(selectedGuide.id);
      const next = updater(currentForGuide);
      saveGuideCardCustomization(next);
      return next;
    });
  }

  function handleDeleteItem(itemId: string) {
    updateCustomization((current) => ({
      ...current,
      removedItemIds: [...new Set([...current.removedItemIds, itemId])],
    }));
  }

  function handleMoveItem(itemId: string, direction: "up" | "down") {
    const nextOrder = moveEditableItem(visibleEditableItemIds, itemId, direction);

    if (nextOrder === visibleEditableItemIds) {
      return;
    }

    updateCustomization((current) => ({ ...current, itemOrder: nextOrder }));
  }

  function handleReorderItem(
    draggedItemId: string,
    targetItemId: string,
    position: GuideCardDropPosition,
  ) {
    const nextOrder = reorderEditableItem(visibleEditableItemIds, draggedItemId, targetItemId, position);

    if (nextOrder === visibleEditableItemIds) {
      return;
    }

    setDragState({});
    updateCustomization((current) => ({ ...current, itemOrder: nextOrder }));
  }

  function handleSaveEditedText() {
    if (!editingText) {
      return;
    }

    updateCustomization((current) => ({
      ...current,
      textOverrides: {
        ...current.textOverrides,
        [editingText.id]: editingText.value,
      },
    }));
    setEditingText(null);
  }

  function handleResetCardEdits() {
    resetGuideCardCustomization(selectedGuide.id);
    setCustomization(createEmptyGuideCardCustomization(selectedGuide.id));
    setDragState({});
    setAddingItem(null);
  }

  function openAddCardItem(target?: GuideCardEditAction) {
    setAddingItem({
      targetItemId: target?.itemId,
      sectionId: target?.sectionId,
    });
  }

  function handleAddCardItem(input: {
    kind: GuideCardCustomItemKind;
    text: string;
    prayerId?: PrayerId;
    prayerLanguage?: PrayerLanguage;
    printMode?: "short" | "full";
  }) {
    const itemId = createId("custom-card-item");
    const sectionId =
      input.kind === "section" ? itemId : addingItem?.sectionId ?? "custom-card-items";
    const item = createGuideCardCustomItem({
      id: itemId,
      kind: input.kind,
      sectionId,
      text: input.text,
      prayerId: input.prayerId,
      prayerLanguage: input.prayerLanguage,
      printMode: input.printMode,
    });

    updateCustomization((current) => ({
      ...current,
      customItems: [...(current.customItems ?? []), item],
      itemOrder: insertEditableItemAfter(visibleEditableItemIds, itemId, addingItem?.targetItemId),
    }));
    setAddingItem(null);
  }

  function persistPrintState() {
    saveGuideCardLayoutOptions(sanitizedLayoutOptions);
    saveGuideCardSelectedGuideId(selectedGuideId);
    saveGuideCardCustomization(selectedCustomization);
    if (selectedGuideId !== DEFAULT_GUIDE_ID) {
      setActiveRosaryConfig(selectedGuideId);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.6fr]">
          <div>
            <h2 className="text-2xl font-semibold text-blue-900">Generate from a saved guide</h2>
            <p className="mt-3 leading-7 text-slate-700">
              These cards are generated from your selected rosary guide. Choose the card size and
              which prayers print in full, then refine the preview before printing.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Card edits are stored locally as cards-only customizations, so your prayer guide
              remains recoverable.
            </p>
          </div>
          <div className="rounded-lg bg-cream-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Selected guide</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{selectedGuide.name}</p>
            <p className="mt-1 text-sm text-slate-700">{generatedCardSet.mysterySetTitle}</p>
            <p className="mt-2 text-sm text-slate-700">
              {generatedCardSet.cardsPerPage} per page - {currentLayout.label}
            </p>
            <p className="mt-2 text-sm text-slate-700">{sideUsageSummary}</p>
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
              onChange={(event) => handleCardCountChange(Number(event.target.value))}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
            />
            <p className="mt-3 text-sm leading-6 text-slate-700">
              This controls how many cards are generated. Use your print dialog&apos;s Copies
              setting to print more sets. Blank slots stay invisible so front and back alignment is
              preserved.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900" htmlFor="card-size">
              Card size
            </label>
            <select
              id="card-size"
              value={layoutOptions.cardSize}
              onChange={(event) => handleCardSizeChange(event.target.value as GuideCardLayoutOptions["cardSize"])}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
            >
              {GUIDE_CARD_SIZE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Choose how cards are arranged on each sheet. {currentLayout.description}
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
            {prayerOptions.map((prayer) => {
              const languageOverride = selectedCustomization.prayerLanguageOverrides?.[prayer.id];
              const cardLanguage =
                languageOverride && languageOverride !== "guide-default"
                  ? languageOverride
                  : getPrayerLanguage(prayer.id, selectedGuide.prayerLanguageById);
              const prayerVariant = getPrayerVariant(prayer, cardLanguage);

              return (
                <label
                  key={prayer.id}
                  htmlFor={`full-prayer-${prayer.id}`}
                  className="flex gap-3 rounded-md border border-blue-900/10 bg-white px-3 py-3 text-sm text-slate-700"
                >
                  <input
                    id={`full-prayer-${prayer.id}`}
                    type="checkbox"
                    value={prayer.id}
                    checked={effectiveFullPrayerIds.includes(prayer.id)}
                    disabled={!prayer.text}
                    onChange={(event) => toggleFullPrayer(prayer.id, event.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="block font-semibold text-blue-900">{prayerVariant.title}</span>
                    <span className="block text-xs leading-5 text-slate-600">
                      {prayer.text
                        ? `${getPrayerIncipit(prayer, cardLanguage)} Print full text when checked.`
                        : "No full text is available."}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-blue-900/10 pt-5">
          <h3 className="text-lg font-semibold text-blue-900">Prayer language on cards</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Choose the language used for each prayer on these cards. Card settings can differ from
            the guide.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {languagePrayerOptions.map((prayer) => {
              const guideLanguage = getPrayerLanguage(prayer.id, selectedGuide.prayerLanguageById);
              const latinVariant = getPrayerVariant(prayer, "la");
              const override = selectedCustomization.prayerLanguageOverrides?.[prayer.id] ?? "guide-default";

              return (
                <label
                  key={prayer.id}
                  htmlFor={`card-language-${prayer.id}`}
                  className="rounded-md border border-blue-900/10 bg-white px-3 py-3 text-sm text-slate-700"
                >
                  <span className="block font-semibold text-blue-900">{prayer.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">
                    English: {prayer.incipit} Latin: {latinVariant.incipit}
                  </span>
                  <select
                    id={`card-language-${prayer.id}`}
                    value={override}
                    onChange={(event) =>
                      updateCardPrayerLanguage(
                        prayer.id,
                        event.target.value as PrayerLanguage | "guide-default",
                      )
                    }
                    className="interactive-field mt-3 w-full rounded-md border border-blue-900/20 bg-white px-3 py-2 text-sm"
                  >
                    <option value="guide-default">
                      Use guide setting ({guideLanguage === "la" ? "Latin" : "English"})
                    </option>
                    <option value="en">English</option>
                    <option value="la">Latin</option>
                  </select>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={printHref}
            onClick={() => {
              persistPrintState();
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
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Hover over a card item to edit, remove, or reorder it. Changes affect these cards only
            unless a future guide-save action is added.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{previewStatus}</p>
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
            editHandlers={{
              onAddItem: openAddCardItem,
              onDeleteItem: handleDeleteItem,
              onEditItem: (itemId, currentText) =>
                setEditingText({ id: itemId, label: "Edit card item", value: currentText, multiline: true }),
              onEditHeading: (sectionId, currentHeading) =>
                setEditingText({
                  id: `${sectionId}:heading`,
                  label: "Edit section heading",
                  value: currentHeading,
                  multiline: false,
                }),
              onEditTitle: (field, currentText) =>
                setEditingText({
                  id: field === "title" ? "card:title" : "card:subtitle",
                  label: field === "title" ? "Edit card title" : "Edit card subtitle",
                  value: currentText,
                  multiline: false,
                }),
              onMoveItem: handleMoveItem,
              onReorderItem: handleReorderItem,
              onDragStart: (itemId) => setDragState({ activeItemId: itemId }),
              onDragEnd: () => setDragState({}),
              onDragOverItem: (targetItemId, position) =>
                setDragState((current) =>
                  current.activeItemId && current.activeItemId !== targetItemId
                    ? { ...current, targetItemId, position }
                    : current,
                ),
              onToggleFullPrayer: toggleFullPrayerFromPreview,
              dragState,
              canMoveItem: (itemId, direction) => {
                const index = visibleEditableItemIds.indexOf(itemId);
                return direction === "up"
                  ? index > 0
                  : index >= 0 && index < visibleEditableItemIds.length - 1;
              },
            }}
          />
        ) : null}
        <div className="no-print mt-6 flex flex-col gap-3 rounded-lg border border-blue-900/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-blue-900">Ready to print?</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Card edits are saved locally for these cards. Saving edits back to the guide is a
              future step.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!hasCardEdits}
              onClick={handleResetCardEdits}
              className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-3 font-semibold text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset card edits
            </button>
            <button
              type="button"
              disabled
              className="interactive-button interactive-button-secondary rounded-md border border-blue-900/10 bg-cream-100 px-4 py-3 font-semibold text-slate-500 disabled:cursor-not-allowed"
              title="Saving card edits back to the guide will be added later."
            >
              Save to guide later
            </button>
            <Link
              href={printHref}
              onClick={persistPrintState}
              className="interactive-button interactive-button-primary inline-flex items-center justify-center rounded-md bg-blue-900 px-5 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            >
              Print / Save as PDF
            </Link>
          </div>
        </div>
      </section>
      {editingText ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-blue-900/40 px-3 py-3 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="card-text-editor-title"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setEditingText(null);
            }
          }}
        >
          <div className="w-full max-w-xl rounded-lg border border-blue-900/10 bg-cream-50 p-5 shadow-2xl">
            <h3 id="card-text-editor-title" className="text-xl font-semibold text-blue-900">
              {editingText.label}
            </h3>
            {editingText.multiline ? (
              <textarea
                value={editingText.value}
                onChange={(event) => setEditingText({ ...editingText, value: event.target.value })}
                className="interactive-field mt-4 min-h-36 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base leading-7"
                autoFocus
              />
            ) : (
              <input
                value={editingText.value}
                onChange={(event) => setEditingText({ ...editingText, value: event.target.value })}
                className="interactive-field mt-4 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
                autoFocus
              />
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditingText(null)}
                className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-3 font-semibold text-blue-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedText}
                className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-3 font-semibold text-white"
              >
                Save text
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {addingItem ? (
        <AddCardItemDialog
          onCancel={() => setAddingItem(null)}
          onAdd={handleAddCardItem}
        />
      ) : null}
    </div>
  );
}

function AddCardItemDialog({
  onCancel,
  onAdd,
}: {
  onCancel: () => void;
  onAdd: (input: {
    kind: GuideCardCustomItemKind;
    text: string;
    prayerId?: PrayerId;
    prayerLanguage?: PrayerLanguage;
    printMode?: "short" | "full";
  }) => void;
}) {
  const [kind, setKind] = useState<GuideCardCustomItemKind>("note");
  const [text, setText] = useState("");
  const [prayerId, setPrayerId] = useState<PrayerId>("our-father");
  const [prayerLanguage, setPrayerLanguage] = useState<PrayerLanguage>("en");
  const [printMode, setPrintMode] = useState<"short" | "full">("short");
  const prayerChoices = Object.values(prayersById);
  const needsText = kind !== "prayer";
  const label = getAddItemTextLabel(kind);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();

    if (needsText && !trimmedText) {
      return;
    }

    onAdd({
      kind,
      text: needsText ? trimmedText : prayersById[prayerId].title,
      prayerId: kind === "prayer" ? prayerId : undefined,
      prayerLanguage: kind === "prayer" ? prayerLanguage : undefined,
      printMode: kind === "prayer" ? printMode : undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-blue-900/40 px-3 py-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-add-item-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onCancel();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-lg border border-blue-900/10 bg-cream-50 p-5 shadow-2xl"
      >
        <h3 id="card-add-item-title" className="text-xl font-semibold text-blue-900">
          Add card item
        </h3>
        <div className="mt-4 grid gap-4">
          <label className="block text-sm font-semibold text-blue-900" htmlFor="card-item-kind">
            Item type
            <select
              id="card-item-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as GuideCardCustomItemKind)}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
              autoFocus
            >
              <option value="section">Section</option>
              <option value="note">Note</option>
              <option value="leader-note">Leader note</option>
              <option value="intention">Intention</option>
              <option value="saint-invocation">Saint invocation</option>
              <option value="prayer">Prayer</option>
              <option value="custom-text">Custom text</option>
            </select>
          </label>

          {kind === "prayer" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm font-semibold text-blue-900" htmlFor="card-item-prayer">
                Prayer
                <select
                  id="card-item-prayer"
                  value={prayerId}
                  onChange={(event) => setPrayerId(event.target.value as PrayerId)}
                  className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
                >
                  {prayerChoices.map((prayer) => (
                    <option key={prayer.id} value={prayer.id}>
                      {prayer.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-blue-900" htmlFor="card-item-language">
                Language
                <select
                  id="card-item-language"
                  value={prayerLanguage}
                  onChange={(event) => setPrayerLanguage(event.target.value as PrayerLanguage)}
                  className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
                >
                  <option value="en">English</option>
                  <option value="la">Latin</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-blue-900" htmlFor="card-item-print-mode">
                Length
                <select
                  id="card-item-print-mode"
                  value={printMode}
                  onChange={(event) => setPrintMode(event.target.value as "short" | "full")}
                  className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
                >
                  <option value="short">Short</option>
                  <option value="full">Full</option>
                </select>
              </label>
            </div>
          ) : (
            <label className="block text-sm font-semibold text-blue-900" htmlFor="card-item-text">
              {label}
              <textarea
                id="card-item-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="interactive-field mt-2 min-h-28 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base leading-7"
                placeholder={getAddItemPlaceholder(kind)}
                required
              />
            </label>
          )}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-3 font-semibold text-blue-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-3 font-semibold text-white"
          >
            Add item
          </button>
        </div>
      </form>
    </div>
  );
}

function getAddItemTextLabel(kind: GuideCardCustomItemKind): string {
  if (kind === "section") return "Section heading";
  if (kind === "saint-invocation") return "Saint name";
  if (kind === "intention") return "Intention text";
  if (kind === "leader-note") return "Leader note";
  if (kind === "custom-text") return "Custom text";
  return "Note text";
}

function getAddItemPlaceholder(kind: GuideCardCustomItemKind): string {
  if (kind === "section") return "Closing procession";
  if (kind === "saint-invocation") return "Saint Joseph";
  if (kind === "intention") return "For our parish and neighbors";
  if (kind === "leader-note") return "Pause here until the group gathers.";
  if (kind === "custom-text") return "Custom card text";
  return "Brief note for this card";
}
