"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clampPrayerStepIndex,
  createPrayerSteps,
  getNextPrayerStepIndex,
  getPreviousPrayerStepIndex,
} from "@/lib/rosary/createPrayerSteps";
import {
  getStepPrayerModePreference,
  getStepPrayerProgress,
  saveStepPrayerModePreference,
  saveStepPrayerProgress,
} from "@/lib/rosary/storage";
import type { PrayerStep, RepeatedPrayerStepMode, UserRosaryConfig } from "@/lib/rosary/types";

type StepByStepPrayerModeProps = {
  config: UserRosaryConfig;
  showLeaderNotes: boolean;
  onExit: () => void;
};

export function StepByStepPrayerMode({
  config,
  showLeaderNotes,
  onExit,
}: StepByStepPrayerModeProps) {
  const [repeatedPrayerMode, setRepeatedPrayerMode] = useState<RepeatedPrayerStepMode>("group");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const steps = useMemo(
    () => createPrayerSteps(config, { repeatedPrayerMode, includeLeaderNotes: showLeaderNotes }),
    [config, repeatedPrayerMode, showLeaderNotes],
  );
  const clampedIndex = clampPrayerStepIndex(currentIndex, steps.length);
  const currentStep = steps[clampedIndex];
  const isComplete = steps.length > 0 && clampedIndex >= steps.length;
  const displayStepNumber = isComplete ? steps.length : clampedIndex + 1;
  const progressPercent = steps.length === 0 ? 0 : Math.round((clampedIndex / steps.length) * 100);

  useEffect(() => {
    queueMicrotask(() => {
      setRepeatedPrayerMode(getStepPrayerModePreference());
      setCurrentIndex(getStepPrayerProgress(config.id));
      setHasLoadedProgress(true);
    });
  }, [config.id]);

  useEffect(() => {
    if (!hasLoadedProgress) {
      return;
    }

    saveStepPrayerModePreference(repeatedPrayerMode);
  }, [hasLoadedProgress, repeatedPrayerMode]);

  useEffect(() => {
    if (!hasLoadedProgress) {
      return;
    }

    saveStepPrayerProgress(config.id, clampedIndex);
  }, [clampedIndex, config.id, hasLoadedProgress]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const targetTag = target?.tagName.toLowerCase();

      if (targetTag === "input" || targetTag === "textarea" || targetTag === "select") {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBack();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function updateRepeatedPrayerMode(mode: RepeatedPrayerStepMode) {
    setRepeatedPrayerMode(mode);
    setCurrentIndex(0);
  }

  function goNext() {
    setCurrentIndex((index) => getNextPrayerStepIndex(index, steps.length));
  }

  function goBack() {
    setCurrentIndex((index) => getPreviousPrayerStepIndex(index, steps.length));
  }

  function restart() {
    setCurrentIndex(0);
  }

  if (steps.length === 0) {
    return (
      <article className="rounded-lg border border-blue-900/10 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold text-blue-900">No prayer steps found</h2>
        <p className="mt-3 leading-7 text-slate-700">
          This guide does not have enabled prayer steps. Return to the guide or edit it in the
          builder.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="step-prayer-secondary-button" onClick={onExit}>
            Return to guide
          </button>
          <Link className="step-prayer-primary-button" href="/builder">
            Edit guide
          </Link>
        </div>
      </article>
    );
  }

  return (
    <section className="space-y-4" aria-label="Step-by-step prayer mode">
      <div className="rounded-lg border border-blue-900/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
              Step-by-step prayer
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-blue-900">
              {config.name}
            </h2>
          </div>
          <button type="button" className="step-prayer-secondary-button" onClick={onExit}>
            Return to guide
          </button>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-blue-900">Repeated prayers</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <RepeatedPrayerOption
              checked={repeatedPrayerMode === "count"}
              title="Count each prayer"
              description="Best without a physical rosary when you want the app to count each bead."
              onChange={() => updateRepeatedPrayerMode("count")}
            />
            <RepeatedPrayerOption
              checked={repeatedPrayerMode === "group"}
              title="Group repeated prayers"
              description="Best with a rosary when you only want the app to keep you on track."
              onChange={() => updateRepeatedPrayerMode("group")}
            />
          </div>
        </fieldset>
      </div>

      <div className="rounded-lg border border-blue-900/10 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
          <span>
            Step {displayStepNumber} of {steps.length}
          </span>
          <span>{isComplete ? "Complete" : `${progressPercent}%`}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-900/10">
          <div
            className="h-full rounded-full bg-blue-900 transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${isComplete ? 100 : progressPercent}%` }}
          />
        </div>
      </div>

      {isComplete ? (
        <CompletionCard onRestart={restart} onExit={onExit} />
      ) : currentStep ? (
        <FocusedPrayerStepCard step={currentStep} />
      ) : null}

      <nav
        className="sticky bottom-0 z-20 -mx-4 border-t border-blue-900/10 bg-cream-50/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
        aria-label="Step prayer navigation"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            type="button"
            className="step-prayer-secondary-button"
            onClick={goBack}
            disabled={clampedIndex === 0}
          >
            Back
          </button>
          <button type="button" className="step-prayer-secondary-button" onClick={restart}>
            Restart
          </button>
          <button type="button" className="step-prayer-secondary-button" onClick={onExit}>
            Exit
          </button>
          <button type="button" className="step-prayer-primary-button" onClick={goNext}>
            {clampedIndex >= steps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </nav>
    </section>
  );
}

function RepeatedPrayerOption({
  checked,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${
        checked
          ? "border-blue-900 bg-blue-900 text-white"
          : "border-blue-900/10 bg-cream-50 text-slate-800"
      }`}
    >
      <input
        type="radio"
        name="repeated-prayer-mode"
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className={`mt-1 block leading-5 ${checked ? "text-white/85" : "text-slate-600"}`}>
          {description}
        </span>
      </span>
    </label>
  );
}

function FocusedPrayerStepCard({ step }: { step: PrayerStep }) {
  return (
    <article className="animate-easy-fade rounded-lg border border-blue-900/10 bg-white p-5 shadow-sm sm:p-7">
      {step.mysteryTitle || step.mysteryName ? (
        <div className="mb-5 rounded-lg bg-cream-100 p-4">
          {step.decadeIndex ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
              Decade {step.decadeIndex} of 5
            </p>
          ) : null}
          {step.mysteryTitle ? (
            <p className="mt-1 font-semibold text-blue-900">{step.mysteryTitle}</p>
          ) : null}
          {step.mysteryName ? (
            <p className="mt-1 text-xl font-semibold text-slate-900">{step.mysteryName}</p>
          ) : null}
          {step.fruit ? <p className="mt-1 text-sm text-slate-700">Fruit: {step.fruit}</p> : null}
          {step.scriptureReference ? (
            <p className="mt-1 text-sm text-slate-700">{step.scriptureReference}</p>
          ) : null}
        </div>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
        {getStepTypeLabel(step)}
      </p>
      <h3 className="mt-2 text-3xl font-bold leading-tight text-blue-900">{step.title}</h3>
      {step.subtitle ? <p className="mt-3 text-base leading-7 text-slate-700">{step.subtitle}</p> : null}
      {step.type === "repeated-prayer" && step.repeatCount ? (
        <p className="mt-3 rounded-md bg-cream-100 px-4 py-3 font-medium text-slate-700">
          Pray this prayer {step.repeatCount} times, then tap Next.
        </p>
      ) : null}
      {step.repeatIndex && step.repeatTotal ? (
        <p className="mt-3 rounded-md bg-cream-100 px-4 py-3 font-medium text-slate-700">
          {step.title}
        </p>
      ) : null}
      {step.body ? (
        <p className="mt-5 whitespace-pre-line text-2xl leading-10 text-slate-900">
          {step.body}
        </p>
      ) : null}
    </article>
  );
}

function CompletionCard({ onRestart, onExit }: { onRestart: () => void; onExit: () => void }) {
  return (
    <article className="rounded-lg border border-blue-900/10 bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">Complete</p>
      <h3 className="mt-2 text-3xl font-bold text-blue-900">Rosary complete</h3>
      <p className="mt-3 text-lg leading-8 text-slate-700">Thank you for praying.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" className="step-prayer-primary-button" onClick={onRestart}>
          Pray again
        </button>
        <button type="button" className="step-prayer-secondary-button" onClick={onExit}>
          Return to guide
        </button>
        <Link className="step-prayer-secondary-button" href="/cards">
          Print guide cards
        </Link>
      </div>
    </article>
  );
}

function getStepTypeLabel(step: PrayerStep): string {
  if (step.repeatIndex && step.repeatTotal) return "Repeated prayer";
  if (step.type === "repeated-prayer") return "Repeated prayer";
  if (step.type === "leader-note") return "Leader note";
  if (step.type === "saint-invocation") return "Saint invocation";
  if (step.type === "mystery") return "Mystery";
  if (step.type === "pause") return "Pause";
  if (step.type === "section") return "Section";
  if (step.type === "prayer") return "Prayer";
  return "Guide step";
}
