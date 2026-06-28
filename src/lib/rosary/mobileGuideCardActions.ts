import type { GuideCardEditableItemType } from "@/lib/rosary/types";

export type MobileGuideCardActionInput = {
  itemType?: GuideCardEditableItemType;
  prayerId?: string;
  printMode?: "short" | "full";
  canToggleFullPrayer?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

export type MobileGuideCardActionId =
  | "edit"
  | "add-above"
  | "add-below"
  | "move-up"
  | "move-down"
  | "toggle-full"
  | "remove";

export type MobileGuideCardActionItem = {
  id: MobileGuideCardActionId;
  label: string;
  enabled: boolean;
  tone?: "default" | "danger";
};

export function getMobileGuideCardActionItems(
  action: MobileGuideCardActionInput,
  options: { canMoveUp: boolean; canMoveDown: boolean },
): MobileGuideCardActionItem[] {
  const items: MobileGuideCardActionItem[] = [];

  if (action.canEdit !== false) {
    items.push({ id: "edit", label: "Edit", enabled: true });
  }

  items.push(
    { id: "add-above", label: "Add above", enabled: true },
    { id: "add-below", label: "Add below", enabled: true },
    { id: "move-up", label: "Move up", enabled: options.canMoveUp },
    { id: "move-down", label: "Move down", enabled: options.canMoveDown },
  );

  if (action.prayerId && action.canToggleFullPrayer !== false) {
    items.push({
      id: "toggle-full",
      label: action.printMode === "full" ? "Use short text" : "Show full prayer",
      enabled: true,
    });
  }

  if (action.canDelete !== false) {
    items.push({ id: "remove", label: "Remove", enabled: true, tone: "danger" });
  }

  return items;
}

