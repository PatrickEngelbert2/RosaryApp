import type { CustomGuidance, CustomGuidanceInsertionPoint } from "@/lib/rosary/types";

export type LeaderNoteTemplate = {
  key: string;
  title: string;
  text: string;
  insertionPoint: CustomGuidanceInsertionPoint;
};

export const commonLeaderNoteTemplates: LeaderNoteTemplate[] = [
  {
    key: "gather-and-orient",
    title: "Gather and orient the group",
    text: "Name the route, invite a shared intention, and explain that the group will respond together.",
    insertionPoint: "before-opening",
  },
  {
    key: "outdoor-pacing",
    title: "Outdoor pacing reminder",
    text: "Pause before crossings and uneven ground. Keep the pace slow enough for prayer and safe walking.",
    insertionPoint: "before-decades",
  },
  {
    key: "closing-thanks",
    title: "Thank the group",
    text: "After the final Sign of the Cross, thank participants and mention the next walk if one is scheduled.",
    insertionPoint: "after-closing",
  },
];

export function getMissingCommonLeaderNoteTemplates(
  currentGuidance: CustomGuidance[],
  templates: LeaderNoteTemplate[] = commonLeaderNoteTemplates,
): LeaderNoteTemplate[] {
  const existingTitles = new Set(
    currentGuidance
      .filter((item) => item.stepType === "leader-note")
      .map((item) => normalizeTemplateTitle(item.title)),
  );

  return templates.filter((template) => !existingTitles.has(normalizeTemplateTitle(template.title)));
}

function normalizeTemplateTitle(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
