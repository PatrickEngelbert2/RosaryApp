"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mysterySets } from "@/content/mysteries";
import { prayersById } from "@/content/prayers";
import { CollapsibleBuilderSection } from "@/components/rosary/BuilderSection";
import { GuideBackupManager } from "@/components/rosary/GuideBackupManager";
import { RosaryFlowPreview } from "@/components/rosary/RosaryFlowPreview";
import { SaintPickerDialog } from "@/components/rosary/SaintPickerDialog";
import { commonSaintInvocations } from "@/lib/rosary/commonSaintInvocations";
import { buildRosaryFlow, getMysterySetForConfig } from "@/lib/rosary/buildRosaryFlow";
import {
  createDefaultUserConfigFromTemplate,
  createId,
  normalizeRosaryConfig,
} from "@/lib/rosary/configUtils";
import { rosaryTemplates } from "@/lib/rosary/defaultTemplates";
import {
  deleteGuideFlowItem,
  moveGuideFlowItem,
  setGuideFlowItemFullText,
  setGuideFlowItemText,
  setGuideFlowItemTitle,
} from "@/lib/rosary/guideFlowEdits";
import {
  addLeaderNoteToConfig,
  addMissingCommonLeaderNotesToConfig,
  deleteLeaderNoteFromConfig,
  formatLeaderNoteStatus,
  getActiveLeaderNotesForBuilder,
  getLeaderNotesForBuilder,
  getMissingCommonLeaderNoteTemplatesForConfig,
  updateLeaderNoteInConfig,
  type BuilderLeaderNote,
} from "@/lib/rosary/leaderNotes";
import {
  getPrayerLanguage,
  getPrayerLanguageLabel,
  getPrayerVariant,
  prayerLanguageOptions,
  prayerLanguagePrayerIds,
} from "@/lib/rosary/prayerText";
import {
  addCommonSaintInvocations,
  addManualSaintInvocation,
  getSaintInvocationNames,
  removeSaintInvocation as removeSaintInvocationFromConfig,
  setSelectedSaintInvocationIds,
} from "@/lib/rosary/saintInvocations";
import {
  deleteRosaryConfig,
  getActiveRosaryConfig,
  getSavedRosaryConfigs,
  saveRosaryConfig,
  setActiveRosaryConfig,
} from "@/lib/rosary/storage";
import type {
  CustomGuidance,
  CustomGuidanceInsertionPoint,
  PrayerId,
  PrayerLanguage,
  RosaryStepType,
  UserRosaryConfig,
} from "@/lib/rosary/types";

const optionalClosingPrayers: PrayerId[] = [
  "hail-holy-queen",
  "closing-prayer",
  "memorare",
  "st-michael-prayer",
];

const customGuidanceTypes: Extract<RosaryStepType, "instruction" | "custom-text">[] = [
  "instruction",
  "custom-text",
];

export function RosaryBuilder() {
  const [savedConfigs, setSavedConfigs] = useState<UserRosaryConfig[]>([]);
  const [templateId, setTemplateId] = useState("standard-rosary");
  const [config, setConfig] = useState<UserRosaryConfig>(() =>
    createDefaultUserConfigFromTemplate("standard-rosary"),
  );
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [customType, setCustomType] =
    useState<Extract<RosaryStepType, "instruction" | "custom-text">>("instruction");
  const [customInsertionPoint, setCustomInsertionPoint] =
    useState<CustomGuidanceInsertionPoint>("before-closing");
  const [leaderNoteTitle, setLeaderNoteTitle] = useState("");
  const [leaderNoteBody, setLeaderNoteBody] = useState("");
  const [leaderNoteInsertionPoint, setLeaderNoteInsertionPoint] =
    useState<CustomGuidanceInsertionPoint>("before-opening");
  const [editingLeaderNoteId, setEditingLeaderNoteId] = useState<string | null>(null);
  const [editingLeaderNoteTitle, setEditingLeaderNoteTitle] = useState("");
  const [editingLeaderNoteBody, setEditingLeaderNoteBody] = useState("");
  const [editingLeaderNoteInsertionPoint, setEditingLeaderNoteInsertionPoint] =
    useState<CustomGuidanceInsertionPoint>("before-opening");
  const [saintName, setSaintName] = useState("");
  const [saintPickerOpen, setSaintPickerOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      const saved = getSavedRosaryConfigs();
      setSavedConfigs(saved);
      const active = getActiveRosaryConfig();

      if (active) {
        const normalized = normalizeRosaryConfig(active);
        setConfig(normalized);
        setTemplateId(normalized.baseTemplateId);
      }
    });
  }, []);

  useEffect(() => {
    function refreshFromQuickGuide() {
      const saved = getSavedRosaryConfigs();
      const active = getActiveRosaryConfig();
      setSavedConfigs(saved);

      if (active) {
        const normalized = normalizeRosaryConfig(active);
        setConfig(normalized);
        setTemplateId(normalized.baseTemplateId);
        setSaveMessage("Saved from Quick Builder.");
      }
    }

    window.addEventListener("easy-guide-created", refreshFromQuickGuide);
    return () => window.removeEventListener("easy-guide-created", refreshFromQuickGuide);
  }, []);

  const selectedClosingPrayers = useMemo(
    () => config.selectedClosingPrayerIds,
    [config.selectedClosingPrayerIds],
  );
  const mysterySet = getMysterySetForConfig(config);
  const mysteryModeLabel =
    config.mysterySetMode === "today"
      ? `Using today's mysteries: ${mysterySet.title}`
      : `Using selected mysteries: ${mysterySet.title}`;
  const allLeaderNotes = getLeaderNotesForBuilder(config);
  const leaderNotes = getActiveLeaderNotesForBuilder(config);
  const hiddenByPreviewEditCount = allLeaderNotes.length - leaderNotes.length;
  const customGuidanceSteps = config.customGuidance.filter((step) => step.stepType !== "leader-note");
  const selectedSaintNames = getSaintInvocationNames(config.saintInvocations);
  const nonEnglishPrayerCount = Object.values(config.prayerLanguageById ?? {}).filter(
    (language) => language === "la" || language === "es",
  ).length;
  const missingCommonLeaderNotes = getMissingCommonLeaderNoteTemplatesForConfig(config);

  function changeTemplate(nextTemplateId: string) {
    setTemplateId(nextTemplateId);
    const next = normalizeRosaryConfig(createDefaultUserConfigFromTemplate(nextTemplateId));
    setConfig({
      ...next,
      name: config.name || next.name,
    });
    setSaveMessage("");
  }

  function updateClosingPrayer(prayerId: PrayerId, checked: boolean) {
    const selected = checked
      ? [...selectedClosingPrayers, prayerId]
      : selectedClosingPrayers.filter((id) => id !== prayerId);

    setConfig((current) => ({
      ...current,
      selectedClosingPrayerIds: selected,
      preferences: {
        ...current.preferences,
        includeOptionalClosingPrayers: selected,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function updatePrayerLanguage(prayerId: PrayerId, language: PrayerLanguage) {
    setConfig((current) => {
      const nextLanguages = { ...(current.prayerLanguageById ?? {}) };

      if (language === "en") {
        delete nextLanguages[prayerId];
      } else {
        nextLanguages[prayerId] = language;
      }

      return {
        ...current,
        prayerLanguageById: nextLanguages,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function updateShowRepeatedPrayers(showRepeatedPrayersIndividually: boolean) {
    setConfig((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        showRepeatedPrayersIndividually,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateShowLeaderNotes(showLeaderNotes: boolean) {
    setConfig((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        showLeaderNotes,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function addCustomStep() {
    if (!customTitle.trim() || !customBody.trim()) {
      return;
    }

    addCustomGuidance({
      title: customTitle.trim(),
      text: customBody.trim(),
      stepType: customType,
      insertionPoint: customInsertionPoint,
    });
    setCustomTitle("");
    setCustomBody("");
  }

  function addLeaderNote() {
    if (!leaderNoteTitle.trim() || !leaderNoteBody.trim()) {
      return;
    }

    setConfig((current) =>
      addLeaderNoteToConfig(
        current,
        {
          title: leaderNoteTitle.trim(),
          text: leaderNoteBody.trim(),
          stepType: "leader-note",
          insertionPoint: leaderNoteInsertionPoint,
        },
        createId("leader-note"),
      ),
    );
    setLeaderNoteTitle("");
    setLeaderNoteBody("");
  }

  function addCommonLeaderNotes() {
    if (missingCommonLeaderNotes.length === 0) {
      return;
    }

    setConfig((current) => addMissingCommonLeaderNotesToConfig(current, createId));
  }

  function addCustomGuidance(input: Omit<CustomGuidance, "id">) {
    const guidance: CustomGuidance = {
      id: createId(input.stepType === "leader-note" ? "leader-note" : "custom-step"),
      ...input,
    };

    setConfig((current) => ({
      ...current,
      customGuidance: [...current.customGuidance, guidance],
      updatedAt: new Date().toISOString(),
    }));
  }

  function removeCustomStep(stepId: string) {
    setConfig((current) => ({
      ...current,
      customGuidance: current.customGuidance.filter((step) => step.id !== stepId),
      updatedAt: new Date().toISOString(),
    }));
  }

  function startEditingLeaderNote(note: BuilderLeaderNote) {
    setEditingLeaderNoteId(note.id);
    setEditingLeaderNoteTitle(note.title);
    setEditingLeaderNoteBody(note.text);
    setEditingLeaderNoteInsertionPoint(note.insertionPoint);
  }

  function cancelEditingLeaderNote() {
    setEditingLeaderNoteId(null);
    setEditingLeaderNoteTitle("");
    setEditingLeaderNoteBody("");
    setEditingLeaderNoteInsertionPoint("before-opening");
  }

  function saveEditingLeaderNote() {
    if (!editingLeaderNoteId || !editingLeaderNoteTitle.trim()) {
      return;
    }

    setConfig((current) =>
      updateLeaderNoteInConfig(current, editingLeaderNoteId, {
        title: editingLeaderNoteTitle.trim(),
        text: editingLeaderNoteBody.trim(),
        insertionPoint: editingLeaderNoteInsertionPoint,
      }),
    );
    cancelEditingLeaderNote();
  }

  function deleteLeaderNote(noteId: string) {
    setConfig((current) => deleteLeaderNoteFromConfig(current, noteId));

    if (editingLeaderNoteId === noteId) {
      cancelEditingLeaderNote();
    }
  }

  function addSaintInvocation() {
    const nextSaint = saintName.trim();
    if (!nextSaint) {
      return;
    }

    setConfig((current) => ({
      ...current,
      saintInvocations: addManualSaintInvocation(current.saintInvocations, nextSaint),
      updatedAt: new Date().toISOString(),
    }));
    setSaintName("");
  }

  function addCommonSaints() {
    setConfig((current) => ({
      ...current,
      saintInvocations: addCommonSaintInvocations(
        current.saintInvocations,
        commonSaintInvocations,
      ),
      updatedAt: new Date().toISOString(),
    }));
  }

  function removeSaintInvocation(saint: string) {
    setConfig((current) => ({
      ...current,
      saintInvocations: removeSaintInvocationFromConfig(current.saintInvocations, saint),
      updatedAt: new Date().toISOString(),
    }));
  }

  function applySelectedSaints(selectedSaintIds: string[]) {
    setConfig((current) => ({
      ...current,
      saintInvocations: setSelectedSaintInvocationIds(current.saintInvocations, selectedSaintIds),
      updatedAt: new Date().toISOString(),
    }));
    setSaintPickerOpen(false);
  }

  function editPreviewItem(itemId: string, values: { title: string; text: string }) {
    setConfig((current) => {
      const withTitle = setGuideFlowItemTitle(current.guideFlowEdits, itemId, values.title);
      const withText = setGuideFlowItemText(withTitle, itemId, values.text);

      return {
        ...current,
        guideFlowEdits: withText,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function removePreviewItem(itemId: string) {
    setConfig((current) => ({
      ...current,
      guideFlowEdits: deleteGuideFlowItem(current.guideFlowEdits, itemId),
      updatedAt: new Date().toISOString(),
    }));
  }

  function movePreviewItem(itemId: string, direction: "up" | "down") {
    setConfig((current) => ({
      ...current,
      guideFlowEdits: moveGuideFlowItem(
        current.guideFlowEdits,
        buildRosaryFlow(current).map((step) => step.id),
        itemId,
        direction,
      ),
      updatedAt: new Date().toISOString(),
    }));
  }

  function togglePreviewItemFullText(itemId: string, showFullText: boolean) {
    setConfig((current) => ({
      ...current,
      guideFlowEdits: setGuideFlowItemFullText(current.guideFlowEdits, itemId, showFullText),
      updatedAt: new Date().toISOString(),
    }));
  }

  function resetPreviewFlowEdits() {
    setConfig((current) => ({
      ...current,
      guideFlowEdits: undefined,
      updatedAt: new Date().toISOString(),
    }));
  }

  function saveConfig() {
    const now = new Date().toISOString();
    const savedConfig = normalizeRosaryConfig({
      ...config,
      baseTemplateId: templateId,
      updatedAt: now,
      createdAt: config.createdAt || now,
      name: config.name.trim() || "My Walk the Rosary Guide",
    });

    saveRosaryConfig(savedConfig);
    setConfig(savedConfig);
    setSavedConfigs(getSavedRosaryConfigs());
    setSaveMessage("Saved in this browser.");
  }

  function selectSavedGuide(configId: string) {
    const selected = savedConfigs.find((guide) => guide.id === configId);
    if (!selected) {
      return;
    }

    const normalized = normalizeRosaryConfig(selected);
    setConfig(normalized);
    setTemplateId(normalized.baseTemplateId);
    setActiveRosaryConfig(normalized.id);
    setSaveMessage("");
  }

  function startNewGuide() {
    const next = normalizeRosaryConfig(createDefaultUserConfigFromTemplate(templateId));
    setConfig(next);
    setSaveMessage("");
  }

  function deleteSavedGuide(configId: string) {
    const guide = savedConfigs.find((item) => item.id === configId);
    if (!guide || !window.confirm("Delete this guide? This cannot be undone.")) {
      return;
    }

    deleteRosaryConfig(configId);
    const remaining = getSavedRosaryConfigs();
    setSavedConfigs(remaining);

    if (config.id === configId) {
      const next = remaining[0] ?? createDefaultUserConfigFromTemplate("standard-rosary");
      setConfig(normalizeRosaryConfig(next));
      setTemplateId(next.baseTemplateId);
    }
  }

  function handleBackupImported(importedGuideId: string | undefined) {
    const saved = getSavedRosaryConfigs();
    const importedGuide =
      saved.find((guide) => guide.id === importedGuideId) ??
      saved[0];

    setSavedConfigs(saved);

    if (importedGuide) {
      const normalized = normalizeRosaryConfig(importedGuide);
      setConfig(normalized);
      setTemplateId(normalized.baseTemplateId);
      setSaveMessage("Imported guide backup.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <CollapsibleBuilderSection
        eyebrow="Step 1"
        title="Guide basics"
        description="Name the guide, choose the guide type, and decide which mysteries it should use."
        helpLabel="Guide basics help"
        helpText="Choose which set of mysteries this guide will use. Today's mysteries follows the traditional daily pattern."
        status={mysteryModeLabel}
        defaultOpen
      >
        {savedConfigs.length > 0 ? (
          <div className="rounded-lg bg-cream-50 p-4">
            <label className="block text-sm font-semibold text-blue-900" htmlFor="saved-guide">
              Saved custom guides
            </label>
            <select
              id="saved-guide"
              value={savedConfigs.some((guide) => guide.id === config.id) ? config.id : ""}
              onChange={(event) => selectSavedGuide(event.target.value)}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
            >
              <option value="">Select a saved guide</option>
              {savedConfigs.map((guide) => (
                <option key={guide.id} value={guide.id}>
                  {guide.name}
                </option>
              ))}
            </select>
            <ul className="mt-3 space-y-2">
              {savedConfigs.map((guide) => (
                <li key={guide.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-800">{guide.name}</span>
                  <button
                    type="button"
                    onClick={() => deleteSavedGuide(guide.id)}
                    className="interactive-link font-semibold text-blue-900 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-blue-900" htmlFor="rosary-name">
            Guide name
            <input
              id="rosary-name"
              value={config.name}
              onChange={(event) =>
                setConfig((current) => ({ ...current, name: event.target.value }))
              }
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
              placeholder="My Walk the Rosary Guide"
            />
          </label>

          <label className="block text-sm font-semibold text-blue-900" htmlFor="template">
            Guide type
            <select
              id="template"
              value={templateId}
              onChange={(event) => changeTemplate(event.target.value)}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base text-slate-900"
            >
              {rosaryTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 leading-7 text-slate-700">
          {rosaryTemplates.find((template) => template.id === templateId)?.description}
        </p>
        <button
          type="button"
          onClick={startNewGuide}
          className="interactive-button interactive-button-secondary mt-4 rounded-md border border-blue-900/20 bg-white px-4 py-2 font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          Start a new guide
        </button>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-blue-900">Mystery behavior</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex gap-3 rounded-md bg-cream-50 p-3">
              <input
                type="radio"
                name="mystery-mode"
                checked={config.mysterySetMode === "today"}
                onChange={() =>
                  setConfig((current) => ({ ...current, mysterySetMode: "today" }))
                }
              />
              <span>Use today&apos;s mysteries</span>
            </label>
            <label className="flex gap-3 rounded-md bg-cream-50 p-3">
              <input
                type="radio"
                name="mystery-mode"
                checked={config.mysterySetMode === "manual"}
                onChange={() =>
                  setConfig((current) => ({ ...current, mysterySetMode: "manual" }))
                }
              />
              <span>Manually choose a mystery set</span>
            </label>
          </div>
        </fieldset>

        <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="mystery-set">
          Manual mystery set
        </label>
        <select
          id="mystery-set"
          value={config.selectedMysterySetId}
          onChange={(event) =>
            setConfig((current) => ({
              ...current,
              selectedMysterySetId: event.target.value as UserRosaryConfig["selectedMysterySetId"],
            }))
          }
          className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
        >
          {mysterySets.map((set) => (
            <option key={set.id} value={set.id}>
              {set.title}
            </option>
          ))}
        </select>
      </CollapsibleBuilderSection>

      <CollapsibleBuilderSection
        eyebrow="Step 2"
        title="Repeated prayers"
        description="Choose how repeated prayers appear when this guide is opened."
        helpLabel="Repeated prayers help"
        helpText="Choose whether repeated prayers like the Hail Marys are shown one-by-one or grouped."
        status={
          config.preferences.showRepeatedPrayersIndividually
            ? "Repeated prayers shown individually"
            : "Repeated prayers stay grouped"
        }
        defaultOpen
      >
        <label className="flex items-start gap-3 rounded-md bg-cream-50 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={config.preferences.showRepeatedPrayersIndividually}
            onChange={(event) => updateShowRepeatedPrayers(event.target.checked)}
          />
          <span>
            <span className="block font-medium text-slate-900">
              Show each repeated prayer individually by default
            </span>
            <span className="mt-1 block text-sm leading-6 text-slate-700">
              Useful if someone does not have a physical rosary and wants the guide to count each
              Hail Mary. If unchecked, repeated prayers stay grouped to keep the guide shorter.
            </span>
          </span>
        </label>
      </CollapsibleBuilderSection>

      <CollapsibleBuilderSection
        eyebrow="Step 4"
        title="Closing prayers"
        description="Choose which prayers to include at the end of the Rosary."
        helpLabel="Closing prayers help"
        helpText="Choose which prayers your group will pray at the end. Different groups include different optional prayers."
        status={`${selectedClosingPrayers.length} closing prayers selected`}
        defaultOpen
      >
        <div className="space-y-3">
          {optionalClosingPrayers.map((prayerId) => (
            <label key={prayerId} className="flex gap-3 rounded-md bg-cream-50 p-3">
              <input
                type="checkbox"
                checked={selectedClosingPrayers.includes(prayerId)}
                onChange={(event) => updateClosingPrayer(prayerId, event.target.checked)}
              />
              <span>
                <span className="block font-semibold text-blue-900">
                  {prayersById[prayerId].title}
                </span>
                <span className="block text-sm text-slate-700">{prayersById[prayerId].incipit}</span>
              </span>
            </label>
          ))}
        </div>
      </CollapsibleBuilderSection>

      <CollapsibleBuilderSection
        eyebrow="Step 5"
        title="Prayer languages"
        description="Choose English, Latin, or Spanish for each prayer."
        helpLabel="Prayer languages help"
        helpText="Choose English, Latin, or Spanish for each prayer. You can mix languages in the same guide."
        status={`${nonEnglishPrayerCount} prayers changed from English`}
      >
        <div className="grid gap-3">
          {prayerLanguagePrayerIds.map((prayerId) => {
            const prayer = prayersById[prayerId];
            const latinVariant = getPrayerVariant(prayer, "la");
            const spanishVariant = getPrayerVariant(prayer, "es");

            return (
              <label
                key={prayerId}
                htmlFor={`guide-prayer-language-${prayerId}`}
                className="grid gap-3 rounded-md border border-blue-900/10 bg-cream-50 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <span>
                  <span className="block font-semibold text-blue-900">{prayer.title}</span>
                  <span className="block text-sm leading-6 text-slate-700">
                    English: {prayer.incipit} Latin: {latinVariant.incipit} Spanish:{" "}
                    {spanishVariant.incipit}
                  </span>
                </span>
                <select
                  id={`guide-prayer-language-${prayerId}`}
                  value={getPrayerLanguage(prayerId, config.prayerLanguageById)}
                  onChange={(event) => updatePrayerLanguage(prayerId, event.target.value as PrayerLanguage)}
                  className="interactive-field rounded-md border border-blue-900/20 bg-white px-3 py-2 text-sm"
                >
                  {prayerLanguageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {getPrayerLanguageLabel(option.value)}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      </CollapsibleBuilderSection>

      <CollapsibleBuilderSection
        eyebrow="Step 6"
        title="Saint invocations"
        description="Add optional petitions such as Saint Joseph, pray for us."
        helpLabel="Saint invocations help"
        helpText="Add short petitions such as Saint Joseph, pray for us. These are optional and often reflect a group's devotion or intention."
        status={
          config.saintInvocations.enabled
            ? `${selectedSaintNames.length} saint invocations`
            : "Saint invocations off"
        }
      >
        <label className="flex items-start gap-3 rounded-md bg-cream-50 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={config.saintInvocations.enabled}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                saintInvocations: {
                  ...current.saintInvocations,
                  enabled: event.target.checked,
                },
                updatedAt: new Date().toISOString(),
              }))
            }
          />
          <span>
            <span className="block font-medium text-slate-900">Include saint invocations</span>
            <span className="mt-1 block text-sm leading-6 text-slate-700">
              These are optional petitions after the main Rosary prayers.
            </span>
          </span>
        </label>

        <div className="mt-4 grid gap-3 rounded-lg border border-blue-900/10 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="text-sm leading-6 text-slate-700">
            Choose from a searchable saint list, or add a short common set without duplicating names
            already in this guide.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setSaintPickerOpen(true)}
              className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30"
            >
              Choose saints
            </button>
            <button
              type="button"
              onClick={addCommonSaints}
              className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-3 font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30"
            >
              Add common invocations
            </button>
          </div>
        </div>

        {config.saintInvocations.enabled || selectedSaintNames.length > 0 ? (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-blue-900" htmlFor="saint-name">
              Add a custom saint or title
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="saint-name"
                value={saintName}
                onChange={(event) => setSaintName(event.target.value)}
                className="interactive-field w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
                placeholder="Saint Joseph"
              />
              <button
                type="button"
                onClick={addSaintInvocation}
                className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-3 font-semibold text-white"
              >
                Add
              </button>
            </div>
            {selectedSaintNames.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {selectedSaintNames.map((saint) => (
                  <li key={saint} className="flex items-center justify-between gap-3 rounded-md bg-cream-50 p-3">
                    <span className="text-sm text-slate-800">{saint}, pray for us.</span>
                    <button
                      type="button"
                      onClick={() => removeSaintInvocation(saint)}
                      className="interactive-link text-sm font-semibold text-blue-900 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </CollapsibleBuilderSection>

      <CollapsibleBuilderSection
        eyebrow="Step 7"
        title="Leader notes"
        description="Add cues for the person leading a group Rosary or Rosary walk."
        helpLabel="Leader notes help"
        helpText="Add cues for the person leading a group Rosary or Rosary walk."
        status={formatLeaderNoteStatus(leaderNotes.length, config.preferences.showLeaderNotes)}
      >
        <label className="flex items-start gap-3 rounded-md bg-cream-50 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={config.preferences.showLeaderNotes}
            onChange={(event) => updateShowLeaderNotes(event.target.checked)}
          />
          <span>
            <span className="block font-medium text-slate-900">Include leader notes</span>
            <span className="mt-1 block text-sm leading-6 text-slate-700">
              Leader notes appear in the guide flow for practical cues, pacing, and outdoor
              reminders.
            </span>
          </span>
        </label>

        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-blue-900/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-700">
            Add a simple starter set for gathering the group, outdoor pacing, and closing thanks.
          </p>
          <button
            type="button"
            onClick={addCommonLeaderNotes}
            disabled={missingCommonLeaderNotes.length === 0}
            className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-3 font-semibold text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add common leader notes
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-blue-900" htmlFor="leader-note-title">
            Leader note title
            <input
              id="leader-note-title"
              value={leaderNoteTitle}
              onChange={(event) => setLeaderNoteTitle(event.target.value)}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
              placeholder="Outdoor pacing reminder"
            />
          </label>
          <label className="block text-sm font-semibold text-blue-900" htmlFor="leader-note-position">
            Where should it appear?
            <select
              id="leader-note-position"
              value={leaderNoteInsertionPoint}
              onChange={(event) =>
                setLeaderNoteInsertionPoint(event.target.value as CustomGuidanceInsertionPoint)
              }
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
            >
              <BuilderPositionOptions />
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="leader-note-body">
          Leader note text
          <textarea
            id="leader-note-body"
            value={leaderNoteBody}
            onChange={(event) => setLeaderNoteBody(event.target.value)}
            rows={3}
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
            placeholder="Pause before crossings and keep the pace slow enough for prayer."
          />
        </label>
        <button
          type="button"
          onClick={addLeaderNote}
          className="interactive-button interactive-button-primary mt-4 rounded-md bg-blue-900 px-5 py-3 font-semibold text-white"
        >
          Add leader note
        </button>

        {leaderNotes.length > 0 ? (
          <LeaderNotesList
            editingNoteId={editingLeaderNoteId}
            editingTitle={editingLeaderNoteTitle}
            editingText={editingLeaderNoteBody}
            editingInsertionPoint={editingLeaderNoteInsertionPoint}
            enabled={config.preferences.showLeaderNotes}
            items={leaderNotes}
            onCancelEdit={cancelEditingLeaderNote}
            onDelete={deleteLeaderNote}
            onEdit={startEditingLeaderNote}
            onSaveEdit={saveEditingLeaderNote}
            onEditingInsertionPointChange={setEditingLeaderNoteInsertionPoint}
            onEditingTextChange={setEditingLeaderNoteBody}
            onEditingTitleChange={setEditingLeaderNoteTitle}
          />
        ) : (
          <p className="mt-4 rounded-md bg-cream-50 px-4 py-3 text-sm leading-6 text-slate-700">
            No active leader notes are currently in this guide.
          </p>
        )}
        {hiddenByPreviewEditCount > 0 ? (
          <p className="mt-3 rounded-md bg-cream-100 px-4 py-3 text-sm leading-6 text-slate-700">
            {hiddenByPreviewEditCount} leader {hiddenByPreviewEditCount === 1 ? "note was" : "notes were"} removed in Preview the flow. Use Reset flow edits in the preview to restore {hiddenByPreviewEditCount === 1 ? "it" : "them"}.
          </p>
        ) : null}
      </CollapsibleBuilderSection>

      <CollapsibleBuilderSection
        eyebrow="Step 8"
        title="Add custom guidance"
        description="Add notes or instructions at specific points in the guide."
        helpLabel="Custom guidance help"
        helpText="Add your own notes or instructions at specific points in the guide."
        status={`${customGuidanceSteps.length} custom notes`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-blue-900" htmlFor="custom-title">
            Title
            <input
              id="custom-title"
              value={customTitle}
              onChange={(event) => setCustomTitle(event.target.value)}
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
            />
          </label>
          <label className="block text-sm font-semibold text-blue-900" htmlFor="custom-type">
            Type
            <select
              id="custom-type"
              value={customType}
              onChange={(event) =>
                setCustomType(event.target.value as Extract<RosaryStepType, "instruction" | "custom-text">)
              }
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
            >
              {customGuidanceTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "instruction" ? "Normal instruction" : "Custom prayer or text"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="custom-body">
          Body
          <textarea
            id="custom-body"
            value={customBody}
            onChange={(event) => setCustomBody(event.target.value)}
            rows={4}
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="custom-position">
          Insertion position
          <select
            id="custom-position"
            value={customInsertionPoint}
            onChange={(event) =>
              setCustomInsertionPoint(event.target.value as CustomGuidanceInsertionPoint)
            }
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
          >
            <BuilderPositionOptions />
          </select>
        </label>
        <button
          type="button"
          onClick={addCustomStep}
          className="interactive-button interactive-button-primary mt-5 rounded-md bg-blue-900 px-5 py-3 font-semibold text-white"
        >
          Add to flow
        </button>
        {customGuidanceSteps.length > 0 ? (
          <GuidanceList items={customGuidanceSteps} onRemove={removeCustomStep} />
        ) : null}
      </CollapsibleBuilderSection>

      <CollapsibleBuilderSection
        eyebrow="Step 9"
        title="Preview the flow"
        description="Review the full order of the guide before saving."
        helpLabel="Preview the flow help"
        helpText="Review the full order of the guide before saving."
      >
        <div className="max-h-[75vh] overflow-auto pr-1">
          <RosaryFlowPreview
            config={config}
            compact
            editable
            includeLeaderNotes={config.preferences.showLeaderNotes}
            onEditItem={editPreviewItem}
            onMoveItem={movePreviewItem}
            onRemoveItem={removePreviewItem}
            onResetEdits={resetPreviewFlowEdits}
            onToggleFullText={togglePreviewItemFullText}
          />
        </div>
      </CollapsibleBuilderSection>

      <CollapsibleBuilderSection
        eyebrow="Step 10"
        title="Save to browser"
        description="Save this guide in your current browser so you can pray it or make cards."
        helpLabel="Save to browser help"
        helpText="Save this guide in your current browser so you can pray it or make cards."
        defaultOpen
      >
        <p className="leading-7 text-slate-700">
          Saved guides live in this browser. Use guide backup below if you want a more permanent
          copy or want to move guides to another device.
        </p>
        <button
          type="button"
          onClick={saveConfig}
          className="interactive-button interactive-button-primary mt-5 rounded-md bg-blue-900 px-5 py-3 font-semibold text-white"
        >
          Save my Rosary
        </button>
        {saveMessage ? <p className="mt-3 font-semibold text-blue-900">{saveMessage}</p> : null}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link className="interactive-link font-semibold text-blue-900 underline" href="/pray/custom">
            Pray this Rosary
          </Link>
          <Link className="interactive-link font-semibold text-blue-900 underline" href="/cards">
            Make Guide Cards
          </Link>
        </div>
      </CollapsibleBuilderSection>

      <CollapsibleBuilderSection
        eyebrow="Step 11"
        title="Guide backup"
        description="Download or import guide backups so your guides are not limited to this browser."
        helpLabel="Guide backup help"
        helpText="Download or import guide backups so your guides are not limited to this browser."
        defaultOpen
      >
        <GuideBackupManager
          guides={savedConfigs}
          selectedGuideId={savedConfigs.some((guide) => guide.id === config.id) ? config.id : undefined}
          onImported={handleBackupImported}
        />
      </CollapsibleBuilderSection>

      <SaintPickerDialog
        open={saintPickerOpen}
        selectedSaintIds={config.saintInvocations.selectedSaintIds}
        onCancel={() => setSaintPickerOpen(false)}
        onDone={applySelectedSaints}
      />
    </div>
  );
}

function BuilderPositionOptions() {
  return (
    <>
      <option value="beginning">At the beginning</option>
      <option value="before-opening">Before the opening prayers</option>
      <option value="after-opening">After the opening prayers</option>
      <option value="before-decades">Before the decades</option>
      <option value="before-each-decade">Before each mystery/decade</option>
      <option value="after-each-decade">After each mystery/decade</option>
      <option value="before-closing">Before closing prayers</option>
      <option value="after-closing">After closing prayers</option>
      <option value="end">At the end</option>
    </>
  );
}

function GuidanceList({
  items,
  onRemove,
}: {
  items: CustomGuidance[];
  onRemove: (id: string) => void;
}) {
  return (
    <ul className="mt-5 space-y-2">
      {items.map((step) => (
        <li key={step.id} className="flex items-center justify-between gap-3 rounded-md bg-cream-50 p-3">
          <span className="text-sm font-medium text-slate-800">
            {step.title} - {step.insertionPoint.replaceAll("-", " ")}
          </span>
          <button
            type="button"
            onClick={() => onRemove(step.id)}
            className="interactive-link text-sm font-semibold text-blue-900 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

function LeaderNotesList({
  editingInsertionPoint,
  editingNoteId,
  editingText,
  editingTitle,
  enabled,
  items,
  onCancelEdit,
  onDelete,
  onEdit,
  onEditingInsertionPointChange,
  onEditingTextChange,
  onEditingTitleChange,
  onSaveEdit,
}: {
  editingInsertionPoint: CustomGuidanceInsertionPoint;
  editingNoteId: string | null;
  editingText: string;
  editingTitle: string;
  enabled: boolean;
  items: BuilderLeaderNote[];
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEdit: (note: BuilderLeaderNote) => void;
  onEditingInsertionPointChange: (point: CustomGuidanceInsertionPoint) => void;
  onEditingTextChange: (text: string) => void;
  onEditingTitleChange: (title: string) => void;
  onSaveEdit: () => void;
}) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((note) => {
        const isEditing = editingNoteId === note.id;

        return (
          <li
            key={note.id}
            className={`rounded-lg border border-blue-900/10 bg-cream-50 p-4 ${
              enabled ? "" : "opacity-75"
            }`}
          >
            {isEditing ? (
              <div className="grid gap-4">
                <label className="block text-sm font-semibold text-blue-900" htmlFor={`${note.id}-edit-title`}>
                  Title
                  <input
                    id={`${note.id}-edit-title`}
                    value={editingTitle}
                    onChange={(event) => onEditingTitleChange(event.target.value)}
                    className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
                  />
                </label>
                <label className="block text-sm font-semibold text-blue-900" htmlFor={`${note.id}-edit-position`}>
                  Placement
                  <select
                    id={`${note.id}-edit-position`}
                    value={editingInsertionPoint}
                    onChange={(event) =>
                      onEditingInsertionPointChange(event.target.value as CustomGuidanceInsertionPoint)
                    }
                    className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
                  >
                    <BuilderPositionOptions />
                  </select>
                </label>
                <label className="block text-sm font-semibold text-blue-900" htmlFor={`${note.id}-edit-text`}>
                  Text
                  <textarea
                    id={`${note.id}-edit-text`}
                    value={editingText}
                    onChange={(event) => onEditingTextChange(event.target.value)}
                    rows={3}
                    className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
                  />
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-2 font-semibold text-blue-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSaveEdit}
                    className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-2 font-semibold text-white"
                  >
                    Save leader note
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <p className="font-semibold text-blue-900">{note.title}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gold-500">
                    {note.insertionPoint.replaceAll("-", " ")}
                    {note.source === "step" ? " - guide starter note" : ""}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{note.text}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => onEdit(note)}
                    className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-3 py-2 text-sm font-semibold text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(note.id)}
                    className="interactive-button interactive-button-secondary rounded-md border border-gold-500/40 bg-cream-100 px-3 py-2 text-sm font-semibold text-blue-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
