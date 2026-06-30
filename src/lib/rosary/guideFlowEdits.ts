import { getCompactPrayerText, getPrayerLanguage } from "@/lib/rosary/prayerText";
import type { GuideFlowEdits, RenderedRosaryStep, UserRosaryConfig } from "@/lib/rosary/types";

export const emptyGuideFlowEdits: GuideFlowEdits = {
  itemOrder: [],
  deletedItemIds: [],
  itemTextOverrides: {},
  itemTitleOverrides: {},
  itemFullTextOverrides: {},
};

export function normalizeGuideFlowEdits(value: unknown): GuideFlowEdits | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const edits: GuideFlowEdits = {
    itemOrder: stringArray(value.itemOrder),
    deletedItemIds: stringArray(value.deletedItemIds),
    itemTextOverrides: stringRecord(value.itemTextOverrides),
    itemTitleOverrides: stringRecord(value.itemTitleOverrides),
    itemFullTextOverrides: booleanRecord(value.itemFullTextOverrides),
  };

  return hasGuideFlowEdits(edits) ? edits : undefined;
}

export function hasGuideFlowEdits(edits: GuideFlowEdits | undefined): boolean {
  return Boolean(
    edits &&
      (edits.itemOrder.length > 0 ||
        edits.deletedItemIds.length > 0 ||
        Object.keys(edits.itemTextOverrides).length > 0 ||
        Object.keys(edits.itemTitleOverrides).length > 0 ||
        Object.keys(edits.itemFullTextOverrides).length > 0),
  );
}

export function createGuideFlowEdits(current?: GuideFlowEdits): GuideFlowEdits {
  const normalized = normalizeGuideFlowEdits(current);

  return normalized
    ? {
        itemOrder: [...normalized.itemOrder],
        deletedItemIds: [...normalized.deletedItemIds],
        itemTextOverrides: { ...normalized.itemTextOverrides },
        itemTitleOverrides: { ...normalized.itemTitleOverrides },
        itemFullTextOverrides: { ...normalized.itemFullTextOverrides },
      }
    : {
        itemOrder: [],
        deletedItemIds: [],
        itemTextOverrides: {},
        itemTitleOverrides: {},
        itemFullTextOverrides: {},
      };
}

export function applyGuideFlowEdits(
  steps: RenderedRosaryStep[],
  config: Pick<UserRosaryConfig, "guideFlowEdits" | "prayerLanguageById">,
): RenderedRosaryStep[] {
  const edits = normalizeGuideFlowEdits(config.guideFlowEdits);

  if (!edits) {
    return steps;
  }

  const deletedIds = new Set(edits.deletedItemIds);
  const editedSteps = steps
    .filter((step) => !deletedIds.has(step.id))
    .map((step) => applyStepOverrides(step, edits, config));
  const stepById = new Map(editedSteps.map((step) => [step.id, step]));
  const orderedIds = [
    ...edits.itemOrder.filter((id) => stepById.has(id)),
    ...editedSteps.map((step) => step.id).filter((id) => !edits.itemOrder.includes(id)),
  ];

  return orderedIds.map((id, index) => ({
    ...stepById.get(id)!,
    order: index + 1,
  }));
}

export function deleteGuideFlowItem(edits: GuideFlowEdits | undefined, itemId: string): GuideFlowEdits | undefined {
  const next = createGuideFlowEdits(edits);
  next.deletedItemIds = uniqueStrings([...next.deletedItemIds, itemId]);
  next.itemOrder = next.itemOrder.filter((id) => id !== itemId);
  delete next.itemTextOverrides[itemId];
  delete next.itemTitleOverrides[itemId];
  delete next.itemFullTextOverrides[itemId];
  return compactGuideFlowEdits(next);
}

export function setGuideFlowItemText(
  edits: GuideFlowEdits | undefined,
  itemId: string,
  value: string,
): GuideFlowEdits | undefined {
  const next = createGuideFlowEdits(edits);
  const text = value.trim();

  if (text) {
    next.itemTextOverrides[itemId] = text;
  } else {
    delete next.itemTextOverrides[itemId];
  }

  return compactGuideFlowEdits(next);
}

export function setGuideFlowItemTitle(
  edits: GuideFlowEdits | undefined,
  itemId: string,
  value: string,
): GuideFlowEdits | undefined {
  const next = createGuideFlowEdits(edits);
  const title = value.trim();

  if (title) {
    next.itemTitleOverrides[itemId] = title;
  } else {
    delete next.itemTitleOverrides[itemId];
  }

  return compactGuideFlowEdits(next);
}

export function setGuideFlowItemFullText(
  edits: GuideFlowEdits | undefined,
  itemId: string,
  showFullText: boolean,
): GuideFlowEdits | undefined {
  const next = createGuideFlowEdits(edits);
  next.itemFullTextOverrides[itemId] = showFullText;
  return compactGuideFlowEdits(next);
}

export function moveGuideFlowItem(
  edits: GuideFlowEdits | undefined,
  currentItemIds: string[],
  itemId: string,
  direction: "up" | "down",
): GuideFlowEdits | undefined {
  const visibleIds = currentItemIds.filter((id) => id !== itemId);
  const currentIndex = currentItemIds.indexOf(itemId);

  if (currentIndex < 0) {
    return edits;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= currentItemIds.length) {
    return edits;
  }

  visibleIds.splice(targetIndex, 0, itemId);

  return compactGuideFlowEdits({
    ...createGuideFlowEdits(edits),
    itemOrder: visibleIds,
  });
}

export function compactGuideFlowEdits(edits: GuideFlowEdits): GuideFlowEdits | undefined {
  const compacted: GuideFlowEdits = {
    itemOrder: uniqueStrings(edits.itemOrder),
    deletedItemIds: uniqueStrings(edits.deletedItemIds),
    itemTextOverrides: compactStringRecord(edits.itemTextOverrides),
    itemTitleOverrides: compactStringRecord(edits.itemTitleOverrides),
    itemFullTextOverrides: { ...edits.itemFullTextOverrides },
  };

  return hasGuideFlowEdits(compacted) ? compacted : undefined;
}

function applyStepOverrides(
  step: RenderedRosaryStep,
  edits: GuideFlowEdits,
  config: Pick<UserRosaryConfig, "prayerLanguageById">,
): RenderedRosaryStep {
  const title = edits.itemTitleOverrides[step.id] ?? step.title;
  const textOverride = edits.itemTextOverrides[step.id];
  const fullTextOverride = edits.itemFullTextOverrides[step.id];

  if (!step.prayer) {
    return {
      ...step,
      title,
      text: textOverride ?? step.text,
    };
  }

  const prayer = { ...step.prayer };
  const shouldUseFullText = fullTextOverride ?? true;
  const resolvedText =
    textOverride ??
    (shouldUseFullText
      ? prayer.text
      : getCompactPrayerText(prayer, getPrayerLanguage(prayer.id, config.prayerLanguageById)));

  return {
    ...step,
    title,
    prayer: {
      ...prayer,
      text: resolvedText,
    },
    text: resolvedText,
  };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? uniqueStrings(value.filter((item): item is string => typeof item === "string")) : [];
}

function stringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  return compactStringRecord(
    Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string",
      ),
    ),
  );
}

function booleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, boolean] => typeof entry[0] === "string" && typeof entry[1] === "boolean",
    ),
  );
}

function compactStringRecord(record: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value.length > 0),
  );
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim()).map((value) => value.trim()))];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
