import { getRosaryTemplate } from "@/lib/rosary/defaultTemplates";
import { isPrayerId, normalizePrayerLanguage } from "@/lib/rosary/prayerText";
import { normalizeSaintInvocations } from "@/lib/rosary/saintInvocations";
import type { PrayerId, PrayerLanguage, RosaryStep, UserRosaryConfig } from "@/lib/rosary/types";

export const defaultClosingPrayerIds: PrayerId[] = ["hail-holy-queen", "closing-prayer"];

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createDefaultUserConfigFromTemplate(
  templateId = "standard-rosary",
): UserRosaryConfig {
  const template = getRosaryTemplate(templateId);
  const now = new Date().toISOString();

  return {
    id: createId("rosary-config"),
    name: template.id === "rosary-walk-leader" ? "My Walk the Rosary Guide" : "My Rosary",
    baseTemplateId: template.id,
    createdAt: now,
    updatedAt: now,
    steps: cloneSteps(template.steps),
    selectedMysterySetId: template.defaultMysterySetId,
    mysterySetMode: template.mysterySetMode,
    selectedClosingPrayerIds: defaultClosingPrayerIds,
    saintInvocations: {
      enabled: false,
      saints: [],
      selectedSaintIds: [],
      customSaintInvocations: [],
    },
    customGuidance: [],
    preferences: {
      defaultLargeText: true,
      defaultCollapseKnownPrayers: true,
      showLeaderNotes: true,
      includeOptionalClosingPrayers: defaultClosingPrayerIds,
      showRepeatedPrayersIndividually: false,
    },
    prayerLanguageById: {},
  };
}

export function cloneSteps(steps: RosaryStep[]): RosaryStep[] {
  return steps.map((step) => ({ ...step }));
}

export function withClosingPrayerChoices(
  steps: RosaryStep[],
  selectedPrayerIds: PrayerId[],
): RosaryStep[] {
  return steps.map((step) => {
    if (!step.optional || !step.prayerId) {
      return step;
    }

    return {
      ...step,
      enabled: selectedPrayerIds.includes(step.prayerId),
    };
  });
}

export function normalizeRosaryConfig(config: UserRosaryConfig): UserRosaryConfig {
  const selectedClosingPrayerIds =
    config.selectedClosingPrayerIds ??
    config.preferences?.includeOptionalClosingPrayers ??
    defaultClosingPrayerIds;

  return {
    ...config,
    selectedClosingPrayerIds,
    saintInvocations: normalizeSaintInvocations(config.saintInvocations),
    customGuidance:
      config.customGuidance ??
      config.steps
        .filter((step) => step.id.startsWith("custom-step"))
        .map((step) => ({
          id: step.id,
          title: step.title,
          text: step.text ?? "",
          stepType:
            step.type === "leader-note" || step.type === "custom-text" ? step.type : "instruction",
          insertionPoint: "end" as const,
        })),
    preferences: {
      defaultLargeText: config.preferences?.defaultLargeText ?? true,
      defaultCollapseKnownPrayers: config.preferences?.defaultCollapseKnownPrayers ?? true,
      showLeaderNotes: config.preferences?.showLeaderNotes ?? true,
      includeOptionalClosingPrayers: selectedClosingPrayerIds,
      showRepeatedPrayersIndividually:
        config.preferences?.showRepeatedPrayersIndividually ?? false,
    },
    prayerLanguageById: normalizePrayerLanguageById(config.prayerLanguageById),
  };
}

export function normalizePrayerLanguageById(
  prayerLanguageById: Partial<Record<PrayerId, PrayerLanguage>> | undefined,
): Partial<Record<PrayerId, PrayerLanguage>> {
  if (!prayerLanguageById) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(prayerLanguageById)
      .filter(([prayerId]) => isPrayerId(prayerId))
      .map(([prayerId, language]) => [prayerId, normalizePrayerLanguage(language)]),
  ) as Partial<Record<PrayerId, PrayerLanguage>>;
}
