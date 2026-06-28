"use client";

import { useEffect } from "react";
import type { GuideCardEditAction } from "@/components/cards/GuideCardFace";
import {
  getMobileGuideCardActionItems,
  type MobileGuideCardActionId,
} from "@/lib/rosary/mobileGuideCardActions";

type MobileCardItemActionSheetProps = {
  action: GuideCardEditAction;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAction: (actionId: MobileGuideCardActionId, action: GuideCardEditAction) => void;
  onClose: () => void;
};

export function MobileCardItemActionSheet({
  action,
  canMoveUp,
  canMoveDown,
  onAction,
  onClose,
}: MobileCardItemActionSheetProps) {
  const actionItems = getMobileGuideCardActionItems(action, { canMoveUp, canMoveDown });

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <aside
      className="guide-card-mobile-action-sheet no-print"
      aria-label="Selected card item actions"
    >
      <div className="guide-card-mobile-action-sheet-handle" aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">Selected item</p>
          <p className="mt-1 text-lg font-semibold leading-6 text-blue-900">{getActionTitle(action)}</p>
          <p className="mt-1 text-sm text-slate-600">{getActionTypeLabel(action)}</p>
        </div>
        <button
          type="button"
          aria-label="Close selected item actions"
          className="guide-card-mobile-action-close"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actionItems.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={!item.enabled}
            onClick={() => onAction(item.id, action)}
            className={
              item.tone === "danger"
                ? "guide-card-mobile-action-button guide-card-mobile-action-danger"
                : "guide-card-mobile-action-button"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function getActionTitle(action: GuideCardEditAction): string {
  const title = action.title ?? action.heading ?? firstUsefulLine(action.text);

  if (title.length <= 72) {
    return title;
  }

  return `${title.slice(0, 69).trim()}...`;
}

function firstUsefulLine(value: string): string {
  return value
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) ?? "Card item";
}

function getActionTypeLabel(action: GuideCardEditAction): string {
  if (action.itemType === "heading") return "Section heading";
  if (action.itemType === "prayer") return "Prayer";
  if (action.itemType === "mystery") return "Mystery line";
  if (action.itemType === "saint-invocation") return "Saint invocation";
  if (action.itemType === "pause") return "Pause";
  return "Card text";
}

