"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CollapsiblePrayer } from "@/components/rosary/CollapsiblePrayer";
import { MysteryPrayerCard } from "@/components/rosary/MysteryPrayerCard";
import { Card } from "@/components/ui/Card";
import {
  buildRosaryFlow,
  expandRepeatedPrayerStep,
  getMysterySetForConfig,
} from "@/lib/rosary/buildRosaryFlow";
import {
  createDefaultUserConfigFromTemplate,
  normalizeRosaryConfig,
} from "@/lib/rosary/configUtils";
import {
  deleteRosaryConfig,
  getActiveRosaryConfig,
  getSavedRosaryConfigs,
  setActiveRosaryConfig,
} from "@/lib/rosary/storage";
import type { RenderedRosaryStep, UserRosaryConfig } from "@/lib/rosary/types";

export function PrayRosaryClient() {
  const [configs, setConfigs] = useState<UserRosaryConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState("default");
  const [largeText, setLargeText] = useState(true);
  const [showLeaderNotes, setShowLeaderNotes] = useState(true);
  const [showRepeatedPrayers, setShowRepeatedPrayers] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [collapseAll, setCollapseAll] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const savedConfigs = getSavedRosaryConfigs();
      setConfigs(savedConfigs);
      const activeConfig = getActiveRosaryConfig() ?? savedConfigs[0];
      if (activeConfig) {
        setSelectedConfigId(activeConfig.id);
        setLargeText(activeConfig.preferences.defaultLargeText);
        setShowLeaderNotes(activeConfig.preferences.showLeaderNotes);
        setShowRepeatedPrayers(activeConfig.preferences.showRepeatedPrayersIndividually);
      }
    });
  }, []);

  const selectedConfig = useMemo(() => {
    return (
      configs.find((config) => config.id === selectedConfigId) ??
      normalizeRosaryConfig(createDefaultUserConfigFromTemplate("standard-rosary"))
    );
  }, [configs, selectedConfigId]);

  const flow = useMemo(() => buildRosaryFlow(selectedConfig), [selectedConfig]);
  const mysterySet = useMemo(() => getMysterySetForConfig(selectedConfig), [selectedConfig]);
  const visibleFlow = useMemo(() => {
    const leaderFiltered = flow.filter((step) => showLeaderNotes || !step.leaderOnly);

    return showRepeatedPrayers
      ? leaderFiltered.flatMap((step) => expandRepeatedPrayerStep(step))
      : leaderFiltered;
  }, [flow, showLeaderNotes, showRepeatedPrayers]);
  const displayFlow = useMemo(() => {
    return visibleFlow.map((step, index) => ({
      step,
      stepNumber: step.prayer
        ? visibleFlow.slice(0, index + 1).filter((item) => item.prayer).length
        : undefined,
    }));
  }, [visibleFlow]);
  const modeLabel =
    selectedConfig.mysterySetMode === "today" ? "Today's mysteries" : "Manually selected";
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  function selectConfig(id: string) {
    setSelectedConfigId(id);
    const config = configs.find((item) => item.id === id);
    if (config) {
      setActiveRosaryConfig(config.id);
      setLargeText(config.preferences.defaultLargeText);
      setShowLeaderNotes(config.preferences.showLeaderNotes);
      setShowRepeatedPrayers(config.preferences.showRepeatedPrayersIndividually);
    }
  }

  function deleteGuide(id: string) {
    const guide = configs.find((config) => config.id === id);
    if (!guide || !window.confirm("Delete this guide? This cannot be undone.")) {
      return;
    }

    deleteRosaryConfig(id);
    const remaining = getSavedRosaryConfigs();
    setConfigs(remaining);

    if (selectedConfigId === id) {
      const next = remaining[0];
      if (next) {
        setSelectedConfigId(next.id);
        setActiveRosaryConfig(next.id);
        setLargeText(next.preferences.defaultLargeText);
        setShowLeaderNotes(next.preferences.showLeaderNotes);
        setShowRepeatedPrayers(next.preferences.showRepeatedPrayersIndividually);
      } else {
        setSelectedConfigId("default");
        setLargeText(true);
        setShowLeaderNotes(true);
        setShowRepeatedPrayers(false);
      }
    }
  }

  function handleExpandAll() {
    setExpandAll(true);
    setCollapseAll(false);
  }

  function handleCollapseAll() {
    setCollapseAll(true);
    setExpandAll(false);
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">Praying</p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-blue-900">
              {selectedConfig.name}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              <strong>{mysterySet.title}</strong> - {modeLabel}
              {selectedConfig.mysterySetMode === "today" ? ` - ${dateLabel}` : ""}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-blue-900" htmlFor="saved-rosary">
              Saved guide
            </label>
            <select
              id="saved-rosary"
              value={selectedConfigId}
              onChange={(event) => selectConfig(event.target.value)}
              className="mt-2 w-full rounded-md border border-blue-900/20 bg-white px-3 py-2.5 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            >
              {configs.length === 0 ? <option value="default">Default Standard Rosary</option> : null}
              {configs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </select>
            {configs.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-slate-700">
                No saved Rosary styles yet. You can pray the default or{" "}
                <Link className="font-semibold text-blue-900 underline" href="/builder">
                  build your own
                </Link>
                .
              </p>
            ) : null}
            {configs.length > 0 ? (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50">
                  Manage saved guides
                </summary>
                <ul className="mt-2 space-y-2">
                  {configs.map((config) => (
                    <li key={config.id} className="flex items-center justify-between gap-3 rounded-md bg-cream-50 p-2.5">
                      <span className="font-medium text-slate-800">{config.name}</span>
                      <button
                        type="button"
                        onClick={() => deleteGuide(config.id)}
                        className="font-semibold text-blue-900 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              className="rounded-full border border-blue-900/20 bg-white px-3 py-2 text-sm font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="rounded-full border border-blue-900/20 bg-white px-3 py-2 text-sm font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            >
              Collapse all
            </button>
            <label className="flex items-center gap-2 rounded-full bg-cream-50 px-3 py-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={largeText}
                onChange={(event) => setLargeText(event.target.checked)}
              />
              Large text
            </label>
            <label className="flex items-center gap-2 rounded-full bg-cream-50 px-3 py-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={showRepeatedPrayers}
                onChange={(event) => setShowRepeatedPrayers(event.target.checked)}
              />
              Show each repeated prayer
            </label>
            <label className="flex items-center gap-2 rounded-full bg-cream-50 px-3 py-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={showLeaderNotes}
                onChange={(event) => setShowLeaderNotes(event.target.checked)}
              />
              Leader notes
            </label>
          </div>
        </div>
      </Card>

      <ol className="space-y-3">
        {displayFlow.map(({ step, stepNumber }) => (
          <li key={step.id}>
            <PrayerFlowStep
              step={step}
              stepNumber={stepNumber}
              largeText={largeText}
              forceExpanded={expandAll}
              forceCollapsed={collapseAll}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function PrayerFlowStep({
  step,
  stepNumber,
  largeText,
  forceExpanded,
  forceCollapsed,
}: {
  step: RenderedRosaryStep;
  stepNumber?: number;
  largeText: boolean;
  forceExpanded: boolean;
  forceCollapsed: boolean;
}) {
  if (step.prayer) {
    return (
      <CollapsiblePrayer
        prayer={step.prayer}
        title={step.repeatCount && step.repeatCount > 1 ? step.prayer.title : step.title}
        defaultCollapsed={step.defaultCollapsed}
        largeText={largeText}
        stepNumber={stepNumber}
        repeatCount={step.repeatCount}
        forceExpanded={forceExpanded}
        forceCollapsed={forceCollapsed}
      />
    );
  }

  if (step.leaderOnly) {
    return (
      <article className="rounded-lg border border-gold-500/50 bg-amber-50 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">Leader note</p>
        <h2 className="mt-1 text-lg font-semibold text-blue-900">{step.title}</h2>
        <p className="mt-2 text-base leading-7 text-slate-800">{step.text}</p>
      </article>
    );
  }

  if (step.type === "section-heading") {
    return (
      <div className="pt-2">
        <h2 className="border-b border-blue-900/10 pb-2 text-lg font-semibold text-blue-900">
          {step.title}
        </h2>
      </div>
    );
  }

  if (step.mystery) {
    return <MysteryPrayerCard mystery={step.mystery} />;
  }

  return (
    <article className="rounded-lg border border-blue-900/10 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-blue-900">{step.title}</h2>
      {step.text || step.description ? (
        <p className="mt-2 whitespace-pre-line text-base leading-7 text-slate-800">
          {step.text ?? step.description}
        </p>
      ) : null}
    </article>
  );
}
