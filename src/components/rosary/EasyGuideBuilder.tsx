"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { mysterySetsById } from "@/content/mysteries";
import { prayersById } from "@/content/prayers";
import { InfoPopover } from "@/components/ui/InfoPopover";
import {
  buildDefaultEasyGuideName,
  commonSaintInvocations,
  createUserRosaryConfigFromWizardAnswers,
  defaultEasyGuideAnswers,
  standardEasyClosingPrayerIds,
  type EasyGuideAnswers,
} from "@/lib/rosary/easyGuideBuilder";
import { getTodaysMysteries } from "@/lib/rosary/getTodaysMysteries";
import { getPrayerVariant, latinPrayerIds } from "@/lib/rosary/prayerText";
import {
  saveGuideCardLayoutOptions,
  saveGuideCardSelectedGuideId,
  saveRosaryConfig,
} from "@/lib/rosary/storage";
import type { MysterySetId, PrayerId, UserRosaryConfig } from "@/lib/rosary/types";

const closingPrayerOptions: PrayerId[] = [
  "hail-holy-queen",
  "closing-prayer",
  "memorare",
  "st-michael-prayer",
];

type WizardStep =
  | "purpose"
  | "mysteries"
  | "help"
  | "latin"
  | "closing"
  | "saints"
  | "print"
  | "name";

const wizardSteps: WizardStep[] = [
  "purpose",
  "mysteries",
  "help",
  "latin",
  "closing",
  "saints",
  "print",
  "name",
];

export function EasyGuideBuilder() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<EasyGuideAnswers>(defaultEasyGuideAnswers);
  const [saintName, setSaintName] = useState("");
  const [createdGuide, setCreatedGuide] = useState<UserRosaryConfig | null>(null);
  const [saveError, setSaveError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const todayMysteries = useMemo(() => getTodaysMysteries(new Date()), []);
  const defaultName = useMemo(() => buildDefaultEasyGuideName(answers), [answers]);
  const currentStep = wizardSteps[stepIndex];
  const progressPercent = ((stepIndex + 1) / wizardSteps.length) * 100;
  const wantsCards = answers.printIntent === "pocket" || answers.printIntent === "larger";

  useEffect(() => {
    if (!open) {
      return;
    }

    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function openWizard() {
    setOpen(true);
    setStepIndex(0);
    setCreatedGuide(null);
    setSaveError("");
  }

  function updateAnswers(nextAnswers: Partial<EasyGuideAnswers>) {
    setAnswers((current) => ({ ...current, ...nextAnswers }));
    setSaveError("");
  }

  function goNext() {
    setStepIndex((current) => Math.min(current + 1, wizardSteps.length - 1));
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function toggleClosingPrayer(prayerId: PrayerId) {
    const nextIds = answers.closingPrayerIds.includes(prayerId)
      ? answers.closingPrayerIds.filter((id) => id !== prayerId)
      : [...answers.closingPrayerIds, prayerId];

    updateAnswers({ closingPrayerIds: nextIds });
  }

  function toggleLatinPrayer(prayerId: PrayerId) {
    const nextIds = answers.latinPrayerIds.includes(prayerId)
      ? answers.latinPrayerIds.filter((id) => id !== prayerId)
      : [...answers.latinPrayerIds, prayerId];

    updateAnswers({ latinPrayerIds: nextIds });
  }

  function addSaint() {
    const nextSaint = saintName.trim();
    if (!nextSaint) {
      return;
    }

    updateAnswers({
      saintChoice: "custom",
      customSaints: [...new Set([...answers.customSaints, nextSaint])],
    });
    setSaintName("");
  }

  function removeSaint(saint: string) {
    updateAnswers({
      customSaints: answers.customSaints.filter((item) => item !== saint),
    });
  }

  function createGuide() {
    const result = createUserRosaryConfigFromWizardAnswers({
      ...answers,
      guideName: answers.guideName.trim() || defaultName,
    });
    const saved = saveRosaryConfig(result.config);

    if (!saved) {
      setSaveError(
        "This browser could not save the guide. Please check private browsing or storage settings and try again.",
      );
      return;
    }

    saveGuideCardSelectedGuideId(result.config.id);
    saveGuideCardLayoutOptions(result.guideCardLayoutOptions);
    window.dispatchEvent(new CustomEvent("easy-guide-created", { detail: result.config.id }));
    setCreatedGuide(result.config);
    setSaveError("");
  }

  return (
    <>
      <section className="mb-8 grid gap-4 rounded-xl border border-blue-900/10 bg-white p-5 shadow-sm md:grid-cols-[1.1fr_0.9fr] md:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            Need something quick?
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-blue-900">
            Start with the Easy Guide Builder
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            Answer a few simple questions and we&apos;ll build a saved guide you can pray
            from or turn into printable cards.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 rounded-lg bg-cream-50 p-4">
          <button
            type="button"
            onClick={openWizard}
            className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-5 py-3 text-base font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            Start Easy Builder
          </button>
          <p className="text-sm leading-6 text-slate-700">
            Want full control? The advanced builder is still below.
          </p>
        </div>
      </section>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-blue-900/45 px-3 py-3 backdrop-blur-sm motion-safe:animate-easy-fade sm:items-center sm:px-5"
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="easy-builder-title"
            tabIndex={-1}
            className="easy-builder-panel max-h-[92vh] w-full max-w-2xl overflow-auto rounded-t-2xl border border-blue-900/10 bg-cream-50 shadow-2xl outline-none motion-safe:animate-easy-panel sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 border-b border-blue-900/10 bg-cream-50/95 px-5 py-4 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
                    Easy Guide Builder
                  </p>
                  <h2 id="easy-builder-title" className="mt-1 text-2xl font-bold text-blue-900">
                    {createdGuide ? "Your guide is ready." : getStepTitle(currentStep)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="interactive-button rounded-full border border-blue-900/15 bg-white px-3 py-2 text-sm font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                >
                  Close
                </button>
              </div>
              {!createdGuide ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                    <span>
                      Step {stepIndex + 1} of {wizardSteps.length}
                    </span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-900/10">
                    <div
                      className="h-full rounded-full bg-gold-500 transition-all duration-300 motion-reduce:transition-none"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-5 py-5 sm:px-6">
              {createdGuide ? (
                <CompletionState
                  guide={createdGuide}
                  wantsCards={wantsCards}
                  onClose={() => setOpen(false)}
                />
              ) : (
                <div key={currentStep} className="motion-safe:animate-easy-step">
                  <WizardStepContent
                    step={currentStep}
                    answers={answers}
                    todayMysteriesTitle={todayMysteries.title}
                    defaultName={defaultName}
                    saintName={saintName}
                    onSaintNameChange={setSaintName}
                    onAddSaint={addSaint}
                    onRemoveSaint={removeSaint}
                    onUpdate={updateAnswers}
                    onToggleClosing={toggleClosingPrayer}
                    onToggleLatinPrayer={toggleLatinPrayer}
                  />
                  {saveError ? (
                    <p className="mt-4 rounded-md bg-white px-4 py-3 text-sm font-semibold text-red-700">
                      {saveError}
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={stepIndex === 0}
                      className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-5 py-3 font-semibold text-blue-900 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                    >
                      Back
                    </button>
                    {stepIndex === wizardSteps.length - 1 ? (
                      <button
                        type="button"
                        onClick={createGuide}
                        className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-5 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                      >
                        Create Guide
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={goNext}
                        className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-5 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function WizardStepContent({
  step,
  answers,
  todayMysteriesTitle,
  defaultName,
  saintName,
  onSaintNameChange,
  onAddSaint,
  onRemoveSaint,
  onUpdate,
  onToggleClosing,
  onToggleLatinPrayer,
}: {
  step: WizardStep;
  answers: EasyGuideAnswers;
  todayMysteriesTitle: string;
  defaultName: string;
  saintName: string;
  onSaintNameChange: (value: string) => void;
  onAddSaint: () => void;
  onRemoveSaint: (saint: string) => void;
  onUpdate: (answers: Partial<EasyGuideAnswers>) => void;
  onToggleClosing: (prayerId: PrayerId) => void;
  onToggleLatinPrayer: (prayerId: PrayerId) => void;
}) {
  if (step === "purpose") {
    return (
      <QuestionFrame
        description="Choose the closest fit. If you are not sure, keep it simple."
        infoLabel="What this choice changes"
        info="This helps us choose whether to include leader notes, group pacing, and printable-card-friendly guidance."
      >
        <OptionGrid>
          <OptionCard selected={answers.purpose === "self"} onClick={() => onUpdate({ purpose: "self" })} title="A guide for myself" description="A quiet personal guide for praying on your own." />
          <OptionCard selected={answers.purpose === "walk-group"} onClick={() => onUpdate({ purpose: "walk-group" })} title="A guide for a group rosary walk" description="Includes outdoor pacing and leader reminders." />
          <OptionCard selected={answers.purpose === "printable-cards"} onClick={() => onUpdate({ purpose: "printable-cards", printIntent: "pocket" })} title="Printable cards for a group" description="Optimized for people following along together." />
          <OptionCard selected={answers.purpose === "simple"} onClick={() => onUpdate({ purpose: "simple" })} title="I'm not sure - keep it simple" description="A good standard guide with safe defaults." />
        </OptionGrid>
      </QuestionFrame>
    );
  }

  if (step === "mysteries") {
    return (
      <QuestionFrame
        description={`Today's mysteries are resolved locally as ${todayMysteriesTitle}.`}
        infoLabel="What are mysteries?"
        info="The Mysteries are the events from the lives of Jesus and Mary that you meditate on during the Rosary. Each day is traditionally associated with a mystery set."
      >
        <div className="mb-4 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-blue-900">
          Today&apos;s mysteries: {todayMysteriesTitle}
        </div>
        <OptionGrid>
          <OptionCard selected={answers.mysteryChoice === "today"} onClick={() => onUpdate({ mysteryChoice: "today" })} title="Today's mysteries - recommended" description="Use the traditional mystery set for the local day." />
          {(["joyful", "sorrowful", "glorious", "luminous"] as MysterySetId[]).map((id) => (
            <OptionCard
              key={id}
              selected={answers.mysteryChoice === id}
              onClick={() => onUpdate({ mysteryChoice: id })}
              title={mysterySetsById[id].title}
              description={mysterySetsById[id].traditionalDays}
            />
          ))}
          <OptionCard selected={answers.mysteryChoice === "today"} onClick={() => onUpdate({ mysteryChoice: "today" })} title="I don't know - use today's mysteries" description="No need to decide; this will work right away." />
        </OptionGrid>
      </QuestionFrame>
    );
  }

  if (step === "help") {
    return (
      <QuestionFrame
        description="Pick how much prayer text and prompting should be included by default."
        infoLabel="Full prayers vs short prompts"
        info="Short prompts save space. Full prayers are helpful if you do not have the words memorized."
      >
        <OptionGrid>
          <OptionCard selected={answers.helpLevel === "simple"} onClick={() => onUpdate({ helpLevel: "simple" })} title="Simple guide - short prayer prompts" description="Best for people who already know the prayers." />
          <OptionCard selected={answers.helpLevel === "complete"} onClick={() => onUpdate({ helpLevel: "complete" })} title="More complete - include some full prayers" description="A balanced default for most groups." />
          <OptionCard selected={answers.helpLevel === "beginner"} onClick={() => onUpdate({ helpLevel: "beginner" })} title="Beginner-friendly - include more full prayer text" description="Helpful when people are still learning the Rosary." />
        </OptionGrid>
      </QuestionFrame>
    );
  }

  if (step === "closing") {
    return (
      <QuestionFrame
        description="Keep the standard closing, or add the prayers your group usually says."
        infoLabel="About closing prayers"
        info="Different groups end the Rosary in slightly different ways. You can keep the standard closing or add prayers your group usually says."
      >
        <button
          type="button"
          onClick={() => onUpdate({ closingPrayerIds: standardEasyClosingPrayerIds })}
          className="interactive-button interactive-button-secondary mb-4 rounded-md border border-blue-900/20 bg-white px-4 py-3 text-sm font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          Keep it standard
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          {closingPrayerOptions.map((prayerId) => (
            <label
              key={prayerId}
              className="interactive-card-link flex cursor-pointer gap-3 rounded-lg border border-blue-900/10 bg-white p-4 shadow-sm"
            >
              <input
                type="checkbox"
                checked={answers.closingPrayerIds.includes(prayerId)}
                onChange={() => onToggleClosing(prayerId)}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block font-semibold text-blue-900">{prayersById[prayerId].title}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-700">{prayersById[prayerId].incipit}</span>
              </span>
            </label>
          ))}
        </div>
      </QuestionFrame>
    );
  }

  if (step === "latin") {
    return (
      <QuestionFrame
        description="You can keep everything in English, or choose a few familiar prayers to pray in Latin."
        infoLabel="About Latin"
        info="Latin is the traditional language of the Roman Church. Some groups like to pray certain familiar prayers in Latin while keeping the rest in English."
      >
        <OptionGrid>
          <OptionCard
            selected={answers.latinChoice === "none"}
            onClick={() => onUpdate({ latinChoice: "none", latinPrayerIds: [] })}
            title="No, keep everything in English"
            description="A simple default that works for everyone."
          />
          <OptionCard
            selected={answers.latinChoice === "choose"}
            onClick={() => onUpdate({ latinChoice: "choose" })}
            title="Yes, let me choose which prayers"
            description="Mix English and Latin in the same guide."
          />
          <OptionCard
            selected={answers.latinChoice === "unsure"}
            onClick={() => onUpdate({ latinChoice: "unsure", latinPrayerIds: [] })}
            title="I'm not sure - keep it in English"
            description="You can change this later in the advanced builder."
          />
        </OptionGrid>
        {answers.latinChoice === "choose" ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {latinPrayerIds.map((prayerId) => {
              const prayer = prayersById[prayerId];
              const latinVariant = getPrayerVariant(prayer, "la");

              return (
                <label
                  key={prayerId}
                  className="interactive-card-link flex cursor-pointer gap-3 rounded-lg border border-blue-900/10 bg-white p-4 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={answers.latinPrayerIds.includes(prayerId)}
                    onChange={() => onToggleLatinPrayer(prayerId)}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="block font-semibold text-blue-900">{prayer.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-700">
                      {latinVariant.incipit}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}
      </QuestionFrame>
    );
  }

  if (step === "saints") {
    return (
      <QuestionFrame
        description="Saint invocations are optional. You can keep this simple."
        infoLabel="About saint invocations"
        info="Saint invocations are short petitions often added near the end, such as Saint Joseph, pray for us."
      >
        <OptionGrid>
          <OptionCard selected={answers.saintChoice === "none"} onClick={() => onUpdate({ saintChoice: "none", customSaints: [] })} title="No, keep it simple" description="Skip saint invocations for now." />
          <OptionCard selected={answers.saintChoice === "common"} onClick={() => onUpdate({ saintChoice: "common", customSaints: [] })} title="Yes, add common invocations" description={commonSaintInvocations.join(", ")} />
          <OptionCard selected={answers.saintChoice === "custom"} onClick={() => onUpdate({ saintChoice: "custom" })} title="Yes, let me add names" description="Add exactly the names or titles your group uses." />
        </OptionGrid>
        {answers.saintChoice === "custom" ? (
          <div className="mt-5 rounded-lg border border-blue-900/10 bg-white p-4">
            <label className="text-sm font-semibold text-blue-900" htmlFor="easy-saint-name">
              Saint or title name
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="easy-saint-name"
                value={saintName}
                onChange={(event) => onSaintNameChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onAddSaint();
                  }
                }}
                className="interactive-field w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
                placeholder="Saint Joseph"
              />
              <button
                type="button"
                onClick={onAddSaint}
                className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
              >
                Add
              </button>
            </div>
            {answers.customSaints.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {answers.customSaints.map((saint) => (
                  <li key={saint} className="flex items-center justify-between gap-3 rounded-md bg-cream-50 p-3">
                    <span className="text-sm text-slate-800">{saint}, pray for us.</span>
                    <button
                      type="button"
                      onClick={() => onRemoveSaint(saint)}
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
      </QuestionFrame>
    );
  }

  if (step === "print") {
    return (
      <QuestionFrame
        description="You can always make guide cards later. This just chooses helpful defaults."
        infoLabel="What are guide cards?"
        info="Guide cards are small printable cards people can use to follow along during a rosary walk."
      >
        <OptionGrid>
          <OptionCard selected={answers.printIntent === "not-now"} onClick={() => onUpdate({ printIntent: "not-now" })} title="Not now" description="Save the guide first and decide later." />
          <OptionCard selected={answers.printIntent === "pocket"} onClick={() => onUpdate({ printIntent: "pocket" })} title="Yes, pocket cards" description="Use compact 4-up card defaults." />
          <OptionCard selected={answers.printIntent === "larger"} onClick={() => onUpdate({ printIntent: "larger", helpLevel: answers.helpLevel === "simple" ? "complete" : answers.helpLevel })} title="Yes, larger cards" description="Larger cards make more room for full prayers." />
          <OptionCard selected={answers.printIntent === "unsure"} onClick={() => onUpdate({ printIntent: "unsure" })} title="I'm not sure" description="Keep flexible card defaults." />
        </OptionGrid>
      </QuestionFrame>
    );
  }

  return (
    <QuestionFrame description="You can use this name or choose your own. Leaving it blank uses the suggestion.">
      <div className="rounded-lg bg-white p-4">
        <label className="text-sm font-semibold text-blue-900" htmlFor="easy-guide-name">
          Guide name
        </label>
        <input
          id="easy-guide-name"
          value={answers.guideName}
          onChange={(event) => onUpdate({ guideName: event.target.value })}
          className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
          placeholder={defaultName}
        />
        <p className="mt-3 text-sm leading-6 text-slate-700">
          Suggested name: <span className="font-semibold text-blue-900">{defaultName}</span>
        </p>
      </div>
    </QuestionFrame>
  );
}

function QuestionFrame({
  description,
  info,
  infoLabel,
  children,
}: {
  description: string;
  info?: string;
  infoLabel?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <p className="leading-7 text-slate-700">{description}</p>
        {info && infoLabel ? <InfoPopover label={infoLabel}>{info}</InfoPopover> : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function OptionGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function OptionCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`interactive-card-link min-h-28 rounded-lg border p-4 text-left shadow-sm transition motion-reduce:transition-none ${
        selected
          ? "border-blue-900 bg-white ring-2 ring-gold-500/45"
          : "border-blue-900/10 bg-white hover:border-blue-900/35"
      }`}
    >
      <span className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-blue-900 bg-blue-900 text-white" : "border-blue-900/30 bg-cream-50"
          }`}
        >
          {selected ? "x" : ""}
        </span>
        <span>
          <span className="block font-semibold text-blue-900">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-slate-700">{description}</span>
        </span>
      </span>
    </button>
  );
}

function CompletionState({
  guide,
  wantsCards,
  onClose,
}: {
  guide: UserRosaryConfig;
  wantsCards: boolean;
  onClose: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gold-500/30 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Saved on this device
        </p>
        <h3 className="mt-2 text-2xl font-bold text-blue-900">{guide.name}</h3>
        <p className="mt-3 leading-7 text-slate-700">
          Your guide has been saved as a normal Walk the Rosary guide. You can pray it,
          print cards from it, or keep refining it in the advanced builder.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/pray/custom"
          className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-5 py-3 text-center font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          Pray this guide
        </Link>
        <Link
          href="/cards"
          className={`interactive-button rounded-md px-5 py-3 text-center font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 ${
            wantsCards
              ? "interactive-button-primary bg-blue-900 text-white"
              : "interactive-button-secondary border border-blue-900/20 bg-white text-blue-900"
          }`}
        >
          Make guide cards
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-5 py-3 font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          Edit advanced settings
        </button>
        <button
          type="button"
          onClick={onClose}
          className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-5 py-3 font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function getStepTitle(step: WizardStep): string {
  if (step === "purpose") return "What are you making?";
  if (step === "mysteries") return "Which mysteries would you like to pray?";
  if (step === "help") return "How much help should the guide give?";
  if (step === "closing") return "Which closing prayers should be included?";
  if (step === "latin") return "Would you like any prayers in Latin?";
  if (step === "saints") return "Would you like to add saint invocations?";
  if (step === "print") return "Will you print cards?";
  return "Name your guide";
}
