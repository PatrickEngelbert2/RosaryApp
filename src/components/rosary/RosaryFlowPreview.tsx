"use client";

import { buildRosaryFlow, getMysterySetForConfig } from "@/lib/rosary/buildRosaryFlow";
import {
  hasGuideFlowEdits,
  type GuideFlowDropPosition,
} from "@/lib/rosary/guideFlowEdits";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { RenderedRosaryStep, UserRosaryConfig } from "@/lib/rosary/types";

type RosaryFlowPreviewProps = {
  config: UserRosaryConfig;
  compact?: boolean;
  includeLeaderNotes?: boolean;
  editable?: boolean;
  onEditItem?: (itemId: string, values: { title: string; text: string }) => void;
  onRemoveItem?: (itemId: string) => void;
  onMoveItem?: (itemId: string, direction: "up" | "down") => void;
  onToggleFullText?: (itemId: string, showFullText: boolean) => void;
  onReorderItem?: (
    draggedItemId: string,
    targetItemId: string,
    position: GuideFlowDropPosition,
  ) => void;
  onResetEdits?: () => void;
};

type FlowDragState = {
  activeItemId?: string;
  targetItemId?: string;
  position?: GuideFlowDropPosition;
};

export function RosaryFlowPreview({
  config,
  editable = false,
  includeLeaderNotes = true,
  onEditItem,
  onMoveItem,
  onRemoveItem,
  onReorderItem,
  onResetEdits,
  onToggleFullText,
}: RosaryFlowPreviewProps) {
  const flow = buildRosaryFlow(config);
  const mysterySet = getMysterySetForConfig(config);
  const visibleFlow = includeLeaderNotes ? flow : flow.filter((step) => !step.leaderOnly);
  const hasEdits = hasGuideFlowEdits(config.guideFlowEdits);
  const [resetOpen, setResetOpen] = useState(false);
  const [dragState, setDragState] = useState<FlowDragState>({});
  const dragStateRef = useRef<FlowDragState>({});
  const canDragReorder = editable && Boolean(onReorderItem);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  function resetEdits() {
    onResetEdits?.();
    setResetOpen(false);
  }

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>, itemId: string) {
    if (event.pointerType === "touch" || !canDragReorder) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const initialState = { activeItemId: itemId };
    dragStateRef.current = initialState;
    setDragState(initialState);

    function updateTarget(pointerEvent: PointerEvent) {
      const target = document
        .elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)
        ?.closest<HTMLElement>("[data-flow-preview-item-id]");

      if (!target || target.dataset.flowPreviewItemId === itemId) {
        const nextState = { activeItemId: itemId };
        dragStateRef.current = nextState;
        setDragState(nextState);
        return;
      }

      const rect = target.getBoundingClientRect();
      const position: GuideFlowDropPosition =
        pointerEvent.clientY < rect.top + rect.height / 2 ? "before" : "after";
      const nextState = {
        activeItemId: itemId,
        targetItemId: target.dataset.flowPreviewItemId,
        position,
      };

      dragStateRef.current = nextState;
      setDragState(nextState);
    }

    function finishDrag() {
      const current = dragStateRef.current;

      if (
        current.activeItemId &&
        current.targetItemId &&
        current.position &&
        current.activeItemId !== current.targetItemId
      ) {
        onReorderItem?.(current.activeItemId, current.targetItemId, current.position);
      }

      dragStateRef.current = {};
      setDragState({});
      window.removeEventListener("pointermove", updateTarget);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    }

    window.addEventListener("pointermove", updateTarget);
    window.addEventListener("pointerup", finishDrag, { once: true });
    window.addEventListener("pointercancel", finishDrag, { once: true });
  }

  return (
    <div
      className="space-y-3"
      onPointerLeave={() => {
        setDragState((current) =>
          current.activeItemId ? { activeItemId: current.activeItemId } : {},
        );
      }}
    >
      <div className="rounded-lg border border-blue-900/10 bg-cream-100 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-blue-900">
            {config.mysterySetMode === "today"
              ? `Using today's mysteries: ${mysterySet.title}`
              : `Using selected mysteries: ${mysterySet.title}`}
          </p>
          {editable ? (
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              disabled={!hasEdits}
              className="interactive-button interactive-button-secondary rounded-full border border-blue-900/20 bg-white px-3 py-2 text-sm font-semibold text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset flow edits
            </button>
          ) : null}
        </div>
      </div>
      {resetOpen ? (
        <div className="rounded-lg border border-gold-500/30 bg-cream-100 p-4 shadow-sm" role="alertdialog" aria-labelledby="reset-flow-edits-title">
          <h3 id="reset-flow-edits-title" className="font-semibold text-blue-900">
            Reset flow edits?
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            This will restore the generated flow from your current builder settings.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-2 font-semibold text-blue-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={resetEdits}
              className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-2 font-semibold text-white"
            >
              Reset flow edits
            </button>
          </div>
        </div>
      ) : null}
      {visibleFlow.map((step, index) => (
        <PreviewStep
          key={step.id}
          editable={editable}
          step={step}
          number={index + 1}
          isFirst={index === 0}
          isLast={index === visibleFlow.length - 1}
          showFullText={config.guideFlowEdits?.itemFullTextOverrides?.[step.id] ?? true}
          onEditItem={onEditItem}
          onMoveItem={onMoveItem}
          onRemoveItem={onRemoveItem}
          onReorderItem={canDragReorder ? onReorderItem : undefined}
          onPointerDragStart={startDrag}
          onToggleFullText={onToggleFullText}
          dragState={dragState}
        />
      ))}
    </div>
  );
}

function PreviewStep({
  editable,
  isFirst,
  isLast,
  number,
  onEditItem,
  onPointerDragStart,
  onMoveItem,
  onRemoveItem,
  onReorderItem,
  onToggleFullText,
  showFullText,
  step,
  dragState,
}: {
  editable: boolean;
  isFirst: boolean;
  isLast: boolean;
  number: number;
  onEditItem?: (itemId: string, values: { title: string; text: string }) => void;
  onPointerDragStart: (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => void;
  onMoveItem?: (itemId: string, direction: "up" | "down") => void;
  onRemoveItem?: (itemId: string) => void;
  onReorderItem?: (
    draggedItemId: string,
    targetItemId: string,
    position: GuideFlowDropPosition,
  ) => void;
  onToggleFullText?: (itemId: string, showFullText: boolean) => void;
  showFullText: boolean;
  step: RenderedRosaryStep;
  dragState: FlowDragState;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [text, setText] = useState(step.text ?? step.prayer?.text ?? "");
  const canEditText = Boolean(step.text ?? step.prayer?.text ?? step.description);

  function openEdit() {
    setTitle(step.title);
    setText(step.text ?? step.prayer?.text ?? "");
    setIsEditing(true);
  }

  function saveEdit() {
    onEditItem?.(step.id, { title, text });
    setIsEditing(false);
  }

  const canDrag = Boolean(onReorderItem);
  const isDragging = dragState.activeItemId === step.id;
  const dropPosition =
    dragState.targetItemId === step.id && dragState.activeItemId !== step.id
      ? dragState.position
      : undefined;

  if (step.type === "section-heading") {
    return (
      <div
        className={`flow-preview-draggable-item border-b border-blue-900/10 pb-2 pt-2 ${
          isDragging ? "flow-preview-dragging-item" : ""
        } ${dropPosition ? `flow-preview-drop-${dropPosition}` : ""}`}
        data-flow-preview-item-id={step.id}
      >
        {dropPosition === "before" ? <FlowDropIndicator /> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            {canDrag ? (
              <FlowDragHandle
                itemTitle={step.title}
                onPointerDown={(event) => onPointerDragStart(event, step.id)}
              />
            ) : null}
            <h3 className="font-semibold text-blue-900">{step.title}</h3>
          </div>
          {editable ? (
            <PreviewControls
              itemTitle={step.title}
              canToggleFullText={false}
              isFirst={isFirst}
              isLast={isLast}
              showFullText={showFullText}
              onEdit={openEdit}
              onMoveUp={() => onMoveItem?.(step.id, "up")}
              onMoveDown={() => onMoveItem?.(step.id, "down")}
              onRemove={() => onRemoveItem?.(step.id)}
              onToggleFullText={() => undefined}
            />
          ) : null}
        </div>
        {dropPosition === "after" ? <FlowDropIndicator /> : null}
        {isEditing ? (
          <PreviewEditForm
            itemId={step.id}
            title={title}
            text={text}
            canEditText={false}
            onTitleChange={setTitle}
            onTextChange={setText}
            onCancel={() => setIsEditing(false)}
            onSave={saveEdit}
          />
        ) : null}
      </div>
    );
  }

  const label = step.leaderOnly ? "Leader note" : getStepLabel(step.type);
  const border = step.leaderOnly ? "border-gold-500/50 bg-amber-50" : "border-blue-900/10 bg-white";

  return (
    <article
      className={`flow-preview-draggable-item rounded-lg border p-4 shadow-sm ${border} ${
        isDragging ? "flow-preview-dragging-item" : ""
      } ${dropPosition ? `flow-preview-drop-${dropPosition}` : ""}`}
      data-flow-preview-item-id={step.id}
    >
      {dropPosition === "before" ? <FlowDropIndicator /> : null}
      <div className="flex gap-3">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
            {number}
          </span>
          {canDrag ? (
            <FlowDragHandle
              itemTitle={step.title}
              onPointerDown={(event) => onPointerDragStart(event, step.id)}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{label}</p>
          <h3 className="mt-1 font-semibold text-blue-900">
            {step.prayer && step.repeatCount && step.repeatCount > 1
              ? step.prayer.title
              : step.title}
            {step.repeatCount && step.repeatCount > 1 ? (
              <span className="ml-2 rounded-full bg-cream-100 px-2 py-0.5 text-xs">
                x {step.repeatCount}
              </span>
            ) : null}
          </h3>
          {step.prayer ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">{step.prayer.incipit}</p>
          ) : null}
          {step.mystery ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {step.mystery.setName}
              {step.mystery.fruitOfMystery ? ` - Fruit: ${step.mystery.fruitOfMystery}` : ""}
            </p>
          ) : null}
          {step.text && !step.prayer ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">{step.text}</p>
          ) : null}
          {editable ? (
            <PreviewControls
              itemTitle={step.title}
              canToggleFullText={Boolean(step.prayer)}
              isFirst={isFirst}
              isLast={isLast}
              showFullText={showFullText}
              onEdit={openEdit}
              onMoveUp={() => onMoveItem?.(step.id, "up")}
              onMoveDown={() => onMoveItem?.(step.id, "down")}
              onRemove={() => onRemoveItem?.(step.id)}
              onToggleFullText={() => onToggleFullText?.(step.id, !showFullText)}
            />
          ) : null}
          {isEditing ? (
            <PreviewEditForm
              itemId={step.id}
              title={title}
              text={text}
              canEditText={canEditText}
              onTitleChange={setTitle}
              onTextChange={setText}
              onCancel={() => setIsEditing(false)}
              onSave={saveEdit}
            />
          ) : null}
        </div>
      </div>
      {dropPosition === "after" ? <FlowDropIndicator /> : null}
    </article>
  );
}

function FlowDragHandle({
  itemTitle,
  onPointerDown,
}: {
  itemTitle: string;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Reorder item: ${itemTitle}`}
      title="Reorder item"
      className="flow-preview-drag-handle"
      onPointerDown={onPointerDown}
    >
      <span aria-hidden="true">Grip</span>
    </button>
  );
}

function FlowDropIndicator() {
  return (
    <div className="flow-preview-drop-indicator" aria-hidden="true">
      <span />
    </div>
  );
}

function PreviewControls({
  canToggleFullText,
  isFirst,
  isLast,
  itemTitle,
  onEdit,
  onMoveDown,
  onMoveUp,
  onRemove,
  onToggleFullText,
  showFullText,
}: {
  canToggleFullText: boolean;
  isFirst: boolean;
  isLast: boolean;
  itemTitle: string;
  onEdit: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  onToggleFullText: () => void;
  showFullText: boolean;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label={`Edit ${itemTitle}`}>
      <button type="button" onClick={onEdit} className="flow-preview-action-button">
        Edit
      </button>
      <button
        type="button"
        onClick={onMoveUp}
        disabled={isFirst}
        className="flow-preview-action-button disabled:cursor-not-allowed disabled:opacity-45"
      >
        Move up
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={isLast}
        className="flow-preview-action-button disabled:cursor-not-allowed disabled:opacity-45"
      >
        Move down
      </button>
      {canToggleFullText ? (
        <button type="button" onClick={onToggleFullText} className="flow-preview-action-button">
          {showFullText ? "Use short text" : "Show full prayer"}
        </button>
      ) : null}
      <button type="button" onClick={onRemove} className="flow-preview-action-button-danger">
        Remove
      </button>
    </div>
  );
}

function PreviewEditForm({
  canEditText,
  itemId,
  onCancel,
  onSave,
  onTextChange,
  onTitleChange,
  text,
  title,
}: {
  canEditText: boolean;
  itemId: string;
  onCancel: () => void;
  onSave: () => void;
  onTextChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  text: string;
  title: string;
}) {
  return (
    <div className="mt-4 rounded-lg border border-blue-900/10 bg-cream-50 p-4">
      <label className="block text-sm font-semibold text-blue-900" htmlFor={`${itemId}-title`}>
        Title
        <input
          id={`${itemId}-title`}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-2 text-base"
        />
      </label>
      {canEditText ? (
        <label className="mt-4 block text-sm font-semibold text-blue-900" htmlFor={`${itemId}-text`}>
          Display text
          <textarea
            id={`${itemId}-text`}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            rows={4}
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-2 text-base"
          />
        </label>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-4 py-2 font-semibold text-blue-900"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-4 py-2 font-semibold text-white"
        >
          Save item
        </button>
      </div>
    </div>
  );
}

function getStepLabel(type: RenderedRosaryStep["type"]): string {
  if (type === "prayer-group" || type === "prayer") {
    return "Prayer";
  }

  if (type === "leader-note") {
    return "Leader note";
  }

  if (type === "custom-text") {
    return "Text";
  }

  return type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ");
}
