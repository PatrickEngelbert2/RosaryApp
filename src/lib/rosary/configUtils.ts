import { getRosaryTemplate } from "@/lib/rosary/defaultTemplates";
import type { PrayerId, RosaryStep, UserRosaryConfig } from "@/lib/rosary/types";

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
    name: template.id === "rosary-walk-leader" ? "My Rosary Walk" : "My Rosary",
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
    },
    customGuidance: [],
    preferences: {
      defaultLargeText: true,
      defaultCollapseKnownPrayers: true,
      showLeaderNotes: true,
      includeOptionalClosingPrayers: defaultClosingPrayerIds,
      showRepeatedPrayersIndividually: false,
    },
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
    saintInvocations: config.saintInvocations ?? {
      enabled: false,
      saints: [],
    },
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
  };
}
