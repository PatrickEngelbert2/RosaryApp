import type { PrayerStep } from "@/lib/rosary/types";

export function findBestMatchingPrayerStepIndex({
  currentStep,
  nextSteps,
  currentIndex,
  currentTotal,
}: {
  currentStep: PrayerStep | undefined;
  nextSteps: PrayerStep[];
  currentIndex: number;
  currentTotal: number;
}): number {
  if (nextSteps.length === 0) {
    return 0;
  }

  if (!currentStep) {
    return approximateProgressIndex(currentIndex, currentTotal, nextSteps.length);
  }

  const exactLogicalIndex = nextSteps.findIndex(
    (step) => step.logicalStepKey === currentStep.logicalStepKey,
  );

  if (exactLogicalIndex >= 0) {
    return exactLogicalIndex;
  }

  const exactSourceIndex = findBestBySource(currentStep, nextSteps);
  if (exactSourceIndex >= 0) {
    return exactSourceIndex;
  }

  const repeatGroupIndex = findBestByRepeatGroup(currentStep, nextSteps);
  if (repeatGroupIndex >= 0) {
    return repeatGroupIndex;
  }

  const prayerContextIndex = findBestByPrayerContext(currentStep, nextSteps);
  if (prayerContextIndex >= 0) {
    return prayerContextIndex;
  }

  const typeContextIndex = findBestByTypeContext(currentStep, nextSteps);
  if (typeContextIndex >= 0) {
    return typeContextIndex;
  }

  return approximateProgressIndex(currentIndex, currentTotal, nextSteps.length);
}

function findBestBySource(currentStep: PrayerStep, nextSteps: PrayerStep[]): number {
  if (!currentStep.sourceFlowItemId) {
    return -1;
  }

  return nextSteps.findIndex((step) => step.sourceFlowItemId === currentStep.sourceFlowItemId);
}

function findBestByRepeatGroup(currentStep: PrayerStep, nextSteps: PrayerStep[]): number {
  if (!currentStep.repeatGroupId) {
    return -1;
  }

  const sameGroup = nextSteps.findIndex((step) => step.repeatGroupId === currentStep.repeatGroupId);
  if (sameGroup >= 0) {
    return sameGroup;
  }

  return nextSteps.findIndex(
    (step) =>
      step.prayerId === currentStep.prayerId &&
      step.decadeIndex === currentStep.decadeIndex &&
      Boolean(step.repeatGroupId),
  );
}

function findBestByPrayerContext(currentStep: PrayerStep, nextSteps: PrayerStep[]): number {
  if (!currentStep.prayerId) {
    return -1;
  }

  return nextSteps.findIndex(
    (step) =>
      step.prayerId === currentStep.prayerId &&
      step.decadeIndex === currentStep.decadeIndex &&
      step.mysteryId === currentStep.mysteryId,
  );
}

function findBestByTypeContext(currentStep: PrayerStep, nextSteps: PrayerStep[]): number {
  if (
    !currentStep.sectionId &&
    currentStep.decadeIndex === undefined &&
    !currentStep.mysteryId
  ) {
    return -1;
  }

  return nextSteps.findIndex(
    (step) =>
      step.type === currentStep.type &&
      step.sectionId === currentStep.sectionId &&
      step.decadeIndex === currentStep.decadeIndex &&
      step.mysteryId === currentStep.mysteryId,
  );
}

function approximateProgressIndex(
  currentIndex: number,
  currentTotal: number,
  nextTotal: number,
): number {
  if (nextTotal <= 0 || currentTotal <= 0 || !Number.isFinite(currentIndex)) {
    return 0;
  }

  const completionIndex = Math.max(0, currentTotal);
  if (currentIndex >= completionIndex) {
    return nextTotal;
  }

  const ratio = Math.max(0, Math.min(currentIndex / currentTotal, 1));
  return Math.max(0, Math.min(Math.round(ratio * nextTotal), nextTotal));
}
