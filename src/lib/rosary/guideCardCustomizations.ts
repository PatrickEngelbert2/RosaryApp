import { isPrayerId } from "@/lib/rosary/prayerText";
import type {
  GuideCardCustomItem,
  GuideCardCustomItemKind,
  GuideCardCustomization,
  GuideCardSide,
  PrayerId,
  PrayerLanguage,
} from "@/lib/rosary/types";

export type GuideCardDropPosition = "before" | "after";

export function getVisibleEditableItemIds(sides: GuideCardSide[]): string[] {
  return sides.flatMap((side) =>
    side.blocks.flatMap((block) => block.editableItems?.map((item) => item.id) ?? []),
  );
}

export function moveEditableItem(
  visibleItemIds: string[],
  itemId: string,
  direction: "up" | "down",
): string[] {
  const currentIndex = visibleItemIds.indexOf(itemId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= visibleItemIds.length) {
    return visibleItemIds;
  }

  const nextOrder = [...visibleItemIds];
  const [item] = nextOrder.splice(currentIndex, 1);
  nextOrder.splice(targetIndex, 0, item);
  return nextOrder;
}

export function reorderEditableItem(
  visibleItemIds: string[],
  draggedItemId: string,
  targetItemId: string,
  position: GuideCardDropPosition,
): string[] {
  if (draggedItemId === targetItemId) {
    return visibleItemIds;
  }

  const draggedIndex = visibleItemIds.indexOf(draggedItemId);

  if (draggedIndex === -1 || !visibleItemIds.includes(targetItemId)) {
    return visibleItemIds;
  }

  const nextOrder = visibleItemIds.filter((id) => id !== draggedItemId);
  const targetIndex = nextOrder.indexOf(targetItemId);

  if (targetIndex === -1) {
    return visibleItemIds;
  }

  const insertionIndex = position === "after" ? targetIndex + 1 : targetIndex;
  nextOrder.splice(insertionIndex, 0, draggedItemId);
  return nextOrder;
}

export function insertEditableItemAfter(
  visibleItemIds: string[],
  newItemId: string,
  targetItemId?: string,
): string[] {
  return insertEditableItemRelative(visibleItemIds, newItemId, targetItemId, "after");
}

export function insertEditableItemRelative(
  visibleItemIds: string[],
  newItemId: string,
  targetItemId: string | undefined,
  position: GuideCardDropPosition,
): string[] {
  const nextOrder = visibleItemIds.filter((id) => id !== newItemId);

  if (!targetItemId) {
    return [...nextOrder, newItemId];
  }

  const targetIndex = nextOrder.indexOf(targetItemId);

  if (targetIndex === -1) {
    return [...nextOrder, newItemId];
  }

  nextOrder.splice(position === "before" ? targetIndex : targetIndex + 1, 0, newItemId);
  return nextOrder;
}

export function findDuplicateIds(ids: string[]): string[] {
  const counts = new Map<string, number>();

  ids.forEach((id) => {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  return [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id);
}

export function hasGuideCardCustomizationEdits(customization: GuideCardCustomization): boolean {
  return (
    customization.itemOrder.length > 0 ||
    customization.removedItemIds.length > 0 ||
    Object.keys(customization.fullPrayerOverrides).length > 0 ||
    Object.keys(customization.prayerLanguageOverrides ?? {}).length > 0 ||
    (customization.customItems?.length ?? 0) > 0 ||
    Object.keys(customization.textOverrides).length > 0
  );
}

export function createGuideCardCustomItem({
  id,
  kind,
  sectionId,
  text,
  prayerId,
  prayerLanguage,
  printMode,
  createdAt = new Date().toISOString(),
}: {
  id: string;
  kind: GuideCardCustomItemKind;
  sectionId: string;
  text: string;
  prayerId?: PrayerId;
  prayerLanguage?: PrayerLanguage;
  printMode?: "short" | "full";
  createdAt?: string;
}): GuideCardCustomItem {
  return {
    id,
    kind,
    sectionId,
    text,
    prayerId,
    prayerLanguage,
    printMode,
    createdAt,
  };
}

export function applyFullPrayerOverrides(
  fullPrayerIds: PrayerId[],
  customization: GuideCardCustomization,
): PrayerId[] {
  const nextIds = new Set(fullPrayerIds);

  Object.entries(customization.fullPrayerOverrides).forEach(([id, enabled]) => {
    if (!isPrayerId(id)) {
      return;
    }

    if (enabled) {
      nextIds.add(id);
      return;
    }

    nextIds.delete(id);
  });

  return [...nextIds];
}

export function removePrayerOverride(
  overrides: GuideCardCustomization["fullPrayerOverrides"],
  prayerId: PrayerId,
): GuideCardCustomization["fullPrayerOverrides"] {
  const next = { ...overrides };
  delete next[prayerId];
  return next;
}
