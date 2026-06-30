import { commonLeaderNoteTemplates } from "@/lib/rosary/leaderNoteTemplates";
import type {
  CustomGuidance,
  CustomGuidanceInsertionPoint,
  GuideFlowEdits,
  RosaryStep,
  UserRosaryConfig,
} from "@/lib/rosary/types";

export type BuilderLeaderNote = CustomGuidance & {
  source: "custom-guidance" | "step";
  active: boolean;
};

export function getLeaderNotesForBuilder(config: UserRosaryConfig): BuilderLeaderNote[] {
  const deletedIds = new Set(config.guideFlowEdits?.deletedItemIds ?? []);
  const stepNotes = config.steps
    .filter(isLeaderNoteStep)
    .map((step) => {
      const note = stepToLeaderNote(step);
      return {
        ...note,
        source: "step" as const,
        active: !isDeletedByFlowEdits(note.id, deletedIds),
      };
    });
  const customNotes = config.customGuidance
    .filter((item) => item.stepType === "leader-note")
    .map((item) => ({
      ...item,
      source: "custom-guidance" as const,
      active: !isDeletedByFlowEdits(item.id, deletedIds),
    }));
  const customNoteIds = new Set(customNotes.map((note) => note.id));

  return [...stepNotes.filter((note) => !customNoteIds.has(note.id)), ...customNotes].sort(
    (a, b) => insertionPointOrder(a.insertionPoint) - insertionPointOrder(b.insertionPoint),
  );
}

export function getActiveLeaderNotesForBuilder(config: UserRosaryConfig): BuilderLeaderNote[] {
  return getLeaderNotesForBuilder(config).filter((note) => note.active);
}

export function addLeaderNoteToConfig(
  config: UserRosaryConfig,
  input: Omit<CustomGuidance, "id">,
  id: string,
): UserRosaryConfig {
  return {
    ...config,
    customGuidance: [
      ...config.customGuidance,
      {
        id,
        ...input,
      },
    ],
    preferences: {
      ...config.preferences,
      showLeaderNotes: true,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function updateLeaderNoteInConfig(
  config: UserRosaryConfig,
  noteId: string,
  input: Omit<CustomGuidance, "id" | "stepType">,
): UserRosaryConfig {
  const existingCustom = config.customGuidance.find(
    (item) => item.id === noteId && item.stepType === "leader-note",
  );

  if (existingCustom) {
    return {
      ...config,
      customGuidance: config.customGuidance.map((item) =>
        item.id === noteId
          ? {
              ...item,
              title: input.title,
              text: input.text,
              insertionPoint: input.insertionPoint,
            }
          : item,
      ),
      updatedAt: new Date().toISOString(),
    };
  }

  const existingStep = config.steps.find((step) => step.id === noteId && isLeaderNoteStep(step));

  if (!existingStep) {
    return config;
  }

  return {
    ...config,
    steps: config.steps.filter((step) => step.id !== noteId),
    customGuidance: [
      ...config.customGuidance,
      {
        id: noteId,
        title: input.title,
        text: input.text,
        stepType: "leader-note",
        insertionPoint: input.insertionPoint,
      },
    ],
    guideFlowEdits: removeGuideFlowEditReferences(config.guideFlowEdits, noteId),
    updatedAt: new Date().toISOString(),
  };
}

export function deleteLeaderNoteFromConfig(
  config: UserRosaryConfig,
  noteId: string,
): UserRosaryConfig {
  return {
    ...config,
    steps: config.steps.filter((step) => !(step.id === noteId && isLeaderNoteStep(step))),
    customGuidance: config.customGuidance.filter(
      (item) => !(item.id === noteId && item.stepType === "leader-note"),
    ),
    guideFlowEdits: removeGuideFlowEditReferences(config.guideFlowEdits, noteId),
    updatedAt: new Date().toISOString(),
  };
}

export function addMissingCommonLeaderNotesToConfig(
  config: UserRosaryConfig,
  createId: (prefix: string) => string,
): UserRosaryConfig {
  const missingNotes = getMissingCommonLeaderNoteTemplatesForConfig(config);

  if (missingNotes.length === 0) {
    return config;
  }

  return {
    ...config,
    customGuidance: [
      ...config.customGuidance,
      ...missingNotes.map((note) => ({
        id: createId("leader-note"),
        title: note.title,
        text: note.text,
        stepType: "leader-note" as const,
        insertionPoint: note.insertionPoint,
      })),
    ],
    preferences: {
      ...config.preferences,
      showLeaderNotes: true,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function getMissingCommonLeaderNoteTemplatesForConfig(config: UserRosaryConfig) {
  const existingTitles = new Set(
    getLeaderNotesForBuilder(config).map((note) => normalizeTitle(note.title)),
  );

  return commonLeaderNoteTemplates.filter(
    (template) => !existingTitles.has(normalizeTitle(template.title)),
  );
}

export function formatLeaderNoteStatus(count: number, enabled: boolean): string {
  const noun = count === 1 ? "leader note" : "leader notes";
  return enabled ? `${count} ${noun} enabled` : `${count} ${noun} hidden`;
}

function isLeaderNoteStep(step: RosaryStep): boolean {
  return step.enabled !== false && step.type === "leader-note";
}

function stepToLeaderNote(step: RosaryStep): CustomGuidance {
  return {
    id: step.id,
    title: step.title,
    text: step.text ?? "",
    stepType: "leader-note",
    insertionPoint: getInsertionPointForStep(step),
  };
}

function getInsertionPointForStep(step: RosaryStep): CustomGuidanceInsertionPoint {
  const templateMatch = commonLeaderNoteTemplates.find(
    (template) => normalizeTitle(template.title) === normalizeTitle(step.title),
  );

  if (templateMatch) {
    return templateMatch.insertionPoint;
  }

  if (step.order <= 20) return "before-opening";
  if (step.order < 70) return "after-opening";
  if (step.order < 80) return "before-decades";
  if (step.order < 110) return "before-closing";
  return "after-closing";
}

function removeGuideFlowEditReferences(
  edits: GuideFlowEdits | undefined,
  noteId: string,
): GuideFlowEdits | undefined {
  if (!edits) {
    return undefined;
  }

  const next: GuideFlowEdits = {
    itemOrder: edits.itemOrder.filter((id) => !matchesFlowItemId(noteId, id)),
    deletedItemIds: edits.deletedItemIds.filter((id) => !matchesFlowItemId(noteId, id)),
    itemTextOverrides: omitMatchingKeys(edits.itemTextOverrides, noteId),
    itemTitleOverrides: omitMatchingKeys(edits.itemTitleOverrides, noteId),
    itemFullTextOverrides: omitMatchingKeys(edits.itemFullTextOverrides, noteId),
  };

  return hasAnyGuideFlowEdits(next) ? next : undefined;
}

function isDeletedByFlowEdits(noteId: string, deletedIds: Set<string>): boolean {
  return [...deletedIds].some((deletedId) => matchesFlowItemId(noteId, deletedId));
}

function matchesFlowItemId(noteId: string, flowItemId: string): boolean {
  return flowItemId === noteId || flowItemId.startsWith(`${noteId}-decade-`);
}

function omitMatchingKeys<T>(record: Record<string, T>, noteId: string): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !matchesFlowItemId(noteId, key)),
  );
}

function hasAnyGuideFlowEdits(edits: GuideFlowEdits): boolean {
  return (
    edits.itemOrder.length > 0 ||
    edits.deletedItemIds.length > 0 ||
    Object.keys(edits.itemTextOverrides).length > 0 ||
    Object.keys(edits.itemTitleOverrides).length > 0 ||
    Object.keys(edits.itemFullTextOverrides).length > 0
  );
}

function insertionPointOrder(point: CustomGuidanceInsertionPoint): number {
  return [
    "beginning",
    "before-opening",
    "after-opening",
    "before-decades",
    "before-each-decade",
    "after-each-decade",
    "before-closing",
    "after-closing",
    "end",
  ].indexOf(point);
}

function normalizeTitle(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
