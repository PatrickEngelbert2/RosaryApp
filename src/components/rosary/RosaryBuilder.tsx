"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mysterySets } from "@/content/mysteries";
import { prayersById } from "@/content/prayers";
import { RosaryFlowPreview } from "@/components/rosary/RosaryFlowPreview";
import { Card } from "@/components/ui/Card";
import { getMysterySetForConfig } from "@/lib/rosary/buildRosaryFlow";
import {
  createDefaultUserConfigFromTemplate,
  createId,
  normalizeRosaryConfig,
} from "@/lib/rosary/configUtils";
import { rosaryTemplates } from "@/lib/rosary/defaultTemplates";
import { getPrayerLanguage, getPrayerVariant, latinPrayerIds } from "@/lib/rosary/prayerText";
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

export function RosaryBuilder() {
  const [savedConfigs, setSavedConfigs] = useState<UserRosaryConfig[]>([]);
  const [templateId, setTemplateId] = useState("standard-rosary");
  const [config, setConfig] = useState<UserRosaryConfig>(() =>
    createDefaultUserConfigFromTemplate("standard-rosary"),
  );
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [customType, setCustomType] = useState<RosaryStepType>("instruction");
  const [customInsertionPoint, setCustomInsertionPoint] =
    useState<CustomGuidanceInsertionPoint>("before-closing");
  const [saintName, setSaintName] = useState("");
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
    function refreshFromEasyGuide() {
      const saved = getSavedRosaryConfigs();
      const active = getActiveRosaryConfig();
      setSavedConfigs(saved);

      if (active) {
        const normalized = normalizeRosaryConfig(active);
        setConfig(normalized);
        setTemplateId(normalized.baseTemplateId);
        setSaveMessage("Saved from Easy Guide Builder.");
      }
    }

    window.addEventListener("easy-guide-created", refreshFromEasyGuide);
    return () => window.removeEventListener("easy-guide-created", refreshFromEasyGuide);
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

  function addCustomStep() {
    if (!customTitle.trim() || !customBody.trim()) {
      return;
    }

    const guidance: CustomGuidance = {
      id: createId("custom-step"),
      title: customTitle.trim(),
      text: customBody.trim(),
      stepType:
        customType === "leader-note" || customType === "custom-text" ? customType : "instruction",
      insertionPoint: customInsertionPoint,
    };

    setConfig((current) => ({
      ...current,
      customGuidance: [...current.customGuidance, guidance],
      updatedAt: new Date().toISOString(),
    }));
    setCustomTitle("");
    setCustomBody("");
  }

  function removeCustomStep(stepId: string) {
    setConfig((current) => ({
      ...current,
      customGuidance: current.customGuidance.filter((step) => step.id !== stepId),
      updatedAt: new Date().toISOString(),
    }));
  }

  function addSaintInvocation() {
    const nextSaint = saintName.trim();
    if (!nextSaint) {
      return;
    }

    setConfig((current) => ({
      ...current,
      saintInvocations: {
        enabled: true,
        saints: [...current.saintInvocations.saints, nextSaint],
      },
      updatedAt: new Date().toISOString(),
    }));
    setSaintName("");
  }

  function removeSaintInvocation(saint: string) {
    setConfig((current) => ({
      ...current,
      saintInvocations: {
        ...current.saintInvocations,
        saints: current.saintInvocations.saints.filter((item) => item !== saint),
      },
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
    setSaveMessage("Saved on this device.");
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

  const customSteps = config.customGuidance;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <Card>
          <h2 className="text-2xl font-semibold text-blue-900">1. Choose a starter template</h2>
          {savedConfigs.length > 0 ? (
            <div className="mt-4 rounded-lg bg-cream-50 p-4">
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
          <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="template">
            Template
          </label>
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
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-blue-900">2. Name and mysteries</h2>
          <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="rosary-name">
            Rosary style name
          </label>
          <input
            id="rosary-name"
            value={config.name}
            onChange={(event) =>
              setConfig((current) => ({ ...current, name: event.target.value }))
            }
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
            placeholder="My Walk the Rosary Guide"
          />

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-blue-900">Mystery behavior</legend>
            <div className="mt-3 space-y-3">
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
          <p className="mt-4 rounded-md bg-cream-100 px-4 py-3 text-sm font-semibold text-blue-900">
            {mysteryModeLabel}
          </p>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-blue-900">3. Closing prayers</h2>
          <div className="mt-4 space-y-3">
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
          <div className="mt-5 rounded-md bg-cream-100 px-4 py-3">
            <p className="text-sm font-semibold text-blue-900">Selected conclusion prayers</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {selectedClosingPrayers.length > 0
                ? selectedClosingPrayers.map((prayerId) => prayersById[prayerId].title).join(", ")
                : "No optional closing prayers selected."}
            </p>
          </div>
          <div className="mt-5 rounded-lg border border-blue-900/10 p-4">
            <label className="flex items-center gap-3 font-semibold text-blue-900">
              <input
                type="checkbox"
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
              Add saint invocations
            </label>
            {config.saintInvocations.enabled ? (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-blue-900" htmlFor="saint-name">
                  Saint or title
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
                    className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                  >
                    Add
                  </button>
                </div>
                {config.saintInvocations.saints.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {config.saintInvocations.saints.map((saint) => (
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
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-blue-900">4. Add custom guidance</h2>
          <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="custom-title">
            Title
          </label>
          <input
            id="custom-title"
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
          />
          <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="custom-body">
            Body
          </label>
          <textarea
            id="custom-body"
            value={customBody}
            onChange={(event) => setCustomBody(event.target.value)}
            rows={4}
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
          />
          <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="custom-type">
            Type
          </label>
          <select
            id="custom-type"
            value={customType}
            onChange={(event) => setCustomType(event.target.value as RosaryStepType)}
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
          >
            <option value="instruction">Normal instruction</option>
            <option value="leader-note">Leader note</option>
            <option value="custom-text">Custom prayer or text</option>
          </select>
          <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor="custom-position">
            Insertion position
          </label>
          <select
            id="custom-position"
            value={customInsertionPoint}
            onChange={(event) =>
              setCustomInsertionPoint(event.target.value as CustomGuidanceInsertionPoint)
            }
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 text-base"
          >
            <option value="beginning">At the beginning</option>
            <option value="before-opening">Before the opening prayers</option>
            <option value="after-opening">After the opening prayers</option>
            <option value="before-decades">Before the decades</option>
            <option value="before-each-decade">Before each mystery/decade</option>
            <option value="after-each-decade">After each mystery/decade</option>
            <option value="before-closing">Before closing prayers</option>
            <option value="after-closing">After closing prayers</option>
            <option value="end">At the end</option>
          </select>
          <button
            type="button"
            onClick={addCustomStep}
            className="interactive-button interactive-button-primary mt-5 rounded-md bg-blue-900 px-5 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            Add to flow
          </button>
          {customSteps.length > 0 ? (
            <ul className="mt-5 space-y-2">
              {customSteps.map((step) => (
                <li key={step.id} className="flex items-center justify-between gap-3 rounded-md bg-cream-50 p-3">
                  <span className="text-sm font-medium text-slate-800">
                    {step.title} - {step.insertionPoint.replaceAll("-", " ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCustomStep(step.id)}
                    className="interactive-link text-sm font-semibold text-blue-900 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-blue-900">5. Prayer languages</h2>
          <p className="mt-3 leading-7 text-slate-700">
            Choose English or Latin for each prayer. You can mix languages in the same guide.
          </p>
          <div className="mt-5 grid gap-3">
            {latinPrayerIds.map((prayerId) => {
              const prayer = prayersById[prayerId];
              const latinVariant = getPrayerVariant(prayer, "la");

              return (
                <label
                  key={prayerId}
                  htmlFor={`guide-prayer-language-${prayerId}`}
                  className="grid gap-3 rounded-md border border-blue-900/10 bg-cream-50 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span>
                    <span className="block font-semibold text-blue-900">{prayer.title}</span>
                    <span className="block text-sm leading-6 text-slate-700">
                      English: {prayer.incipit} Latin: {latinVariant.incipit}
                    </span>
                  </span>
                  <select
                    id={`guide-prayer-language-${prayerId}`}
                    value={getPrayerLanguage(prayerId, config.prayerLanguageById)}
                    onChange={(event) => updatePrayerLanguage(prayerId, event.target.value as PrayerLanguage)}
                    className="interactive-field rounded-md border border-blue-900/20 bg-white px-3 py-2 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="la">Latin</option>
                  </select>
                </label>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-blue-900">6. Save locally</h2>
          <p className="mt-3 leading-7 text-slate-700">
            This saves your Rosary style in this browser only. No account or backend is used.
          </p>
          <label className="mt-5 flex items-center gap-3 rounded-md bg-cream-50 px-4 py-3">
            <input
              type="checkbox"
              checked={config.preferences.showRepeatedPrayersIndividually}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  preferences: {
                    ...current.preferences,
                    showRepeatedPrayersIndividually: event.target.checked,
                  },
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
            <span className="font-medium text-slate-800">
              Show each repeated prayer individually by default
            </span>
          </label>
          <button
            type="button"
            onClick={saveConfig}
            className="interactive-button interactive-button-primary mt-5 rounded-md bg-blue-900 px-5 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
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
        </Card>
      </div>

      <section aria-labelledby="builder-preview">
        <div className="sticky top-4">
          <h2 id="builder-preview" className="text-2xl font-semibold text-blue-900">
            Preview the flow
          </h2>
          <p className="mt-2 leading-7 text-slate-700">
            This is the same structured sequence used by the prayer page and guide cards.
          </p>
          <div className="mt-5 max-h-[75vh] overflow-auto pr-1">
            <RosaryFlowPreview config={config} compact />
          </div>
        </div>
      </section>
    </div>
  );
}
