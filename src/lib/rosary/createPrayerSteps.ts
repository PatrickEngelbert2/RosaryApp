import { buildRosaryFlow } from "@/lib/rosary/buildRosaryFlow";
import { getPrayerLanguage } from "@/lib/rosary/prayerText";
import type {
  PrayerStep,
  PrayerStepModeType,
  RenderedRosaryStep,
  RepeatedPrayerStepMode,
  UserRosaryConfig,
} from "@/lib/rosary/types";

export type CreatePrayerStepsOptions = {
  repeatedPrayerMode?: RepeatedPrayerStepMode;
  includeLeaderNotes?: boolean;
};

export function createPrayerSteps(
  config: UserRosaryConfig,
  options: CreatePrayerStepsOptions = {},
): PrayerStep[] {
  const repeatedPrayerMode = options.repeatedPrayerMode ?? "group";
  const includeLeaderNotes = options.includeLeaderNotes ?? true;
  const flow = buildRosaryFlow(config).filter((step) => includeLeaderNotes || !step.leaderOnly);
  const steps: PrayerStep[] = [];
  let currentMystery: RenderedRosaryStep["mystery"] | undefined;

  flow.forEach((step) => {
    if (step.type === "section-heading") {
      currentMystery = undefined;
    }

    if (step.mystery) {
      currentMystery = step.mystery;
    }

    if (step.prayer && (step.repeatCount ?? 1) > 1) {
      const repeatCount = step.repeatCount ?? 1;

      if (repeatedPrayerMode === "count") {
        for (let index = 1; index <= repeatCount; index += 1) {
          steps.push({
            ...createBasePrayerStep(step, currentMystery, config),
            id: `${step.id}-${index}`,
            title: `${step.prayer.title} ${index} of ${repeatCount}`,
            subtitle: step.description,
            type: "prayer",
            repeatIndex: index,
            repeatTotal: repeatCount,
            repeatCount: 1,
          });
        }
        return;
      }

      steps.push({
        ...createBasePrayerStep(step, currentMystery, config),
        type: "repeated-prayer",
        title: `${step.prayer.title} x ${repeatCount}`,
        subtitle: step.description,
        repeatCount,
      });
      return;
    }

    if (step.prayer) {
      steps.push(createBasePrayerStep(step, currentMystery, config));
      return;
    }

    steps.push(createNonPrayerStep(step, currentMystery));
  });

  return steps;
}

export function getNextPrayerStepIndex(currentIndex: number, totalSteps: number): number {
  return Math.min(currentIndex + 1, totalSteps);
}

export function getPreviousPrayerStepIndex(currentIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) {
    return 0;
  }

  return Math.max(currentIndex - 1, 0);
}

export function clampPrayerStepIndex(index: number, totalSteps: number): number {
  if (!Number.isFinite(index)) {
    return 0;
  }

  return Math.max(0, Math.min(Math.trunc(index), totalSteps));
}

function createBasePrayerStep(
  step: RenderedRosaryStep,
  mystery: RenderedRosaryStep["mystery"],
  config: UserRosaryConfig,
): PrayerStep {
  return {
    id: step.id,
    type: "prayer",
    title: step.prayer?.title ?? step.title,
    subtitle: step.description,
    body: step.text ?? step.prayer?.text,
    prayerId: step.prayer?.id,
    language: step.prayer?.id ? getPrayerLanguage(step.prayer.id, config.prayerLanguageById) : undefined,
    decadeIndex: mystery?.number,
    mysteryName: mystery?.title,
    mysteryTitle: mystery ? `${ordinalLabel(mystery.number)} ${mystery.setName} Mystery` : undefined,
    fruit: mystery?.fruitOfMystery,
    scriptureReference: mystery?.scriptureReference,
    leaderOnly: step.leaderOnly,
  };
}

function createNonPrayerStep(
  step: RenderedRosaryStep,
  mystery: RenderedRosaryStep["mystery"],
): PrayerStep {
  const type = getStepType(step);

  return {
    id: step.id,
    type,
    title: step.title,
    subtitle: step.description,
    body: step.text ?? step.description,
    decadeIndex: mystery?.number,
    mysteryName: mystery?.title,
    mysteryTitle: mystery ? `${ordinalLabel(mystery.number)} ${mystery.setName} Mystery` : undefined,
    fruit: step.mystery?.fruitOfMystery ?? mystery?.fruitOfMystery,
    scriptureReference: step.mystery?.scriptureReference ?? mystery?.scriptureReference,
    leaderOnly: step.leaderOnly,
  };
}

function getStepType(step: RenderedRosaryStep): PrayerStepModeType {
  if (step.type === "section-heading") return "section";
  if (step.type === "mystery") return "mystery";
  if (step.type === "leader-note") return "leader-note";
  if (step.type === "instruction") return "instruction";
  if (step.type === "custom-text" && step.title.toLowerCase().includes("saint")) {
    return "saint-invocation";
  }
  if ((step.text ?? "").trim().toLowerCase() === "[pause]") return "pause";
  return "text";
}

function ordinalLabel(value: number): string {
  if (value === 1) return "First";
  if (value === 2) return "Second";
  if (value === 3) return "Third";
  if (value === 4) return "Fourth";
  if (value === 5) return "Fifth";
  return `${value}th`;
}
