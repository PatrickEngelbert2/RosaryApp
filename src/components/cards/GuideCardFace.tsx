import type {
  GuideCardBlock,
  GuideCardEditableItemType,
  GuideCardSide,
  GuideCardSize,
} from "@/lib/rosary/types";

type GuideCardFaceMode = "preview" | "print";

export type GuideCardEditAction = {
  itemId: string;
  sectionId: string;
  itemType?: GuideCardEditableItemType;
  prayerId?: string;
  title?: string;
  text: string;
  heading?: string;
  printMode?: "short" | "full";
  canToggleFullPrayer?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

export type GuideCardDropPosition = "before" | "after";

export type GuideCardDragState = {
  activeItemId?: string;
  targetItemId?: string;
  position?: GuideCardDropPosition;
};

export type GuideCardEditHandlers = {
  onAddItem?: (target?: GuideCardEditAction) => void;
  onDeleteItem?: (itemId: string) => void;
  onEditItem?: (itemId: string, currentText: string) => void;
  onEditHeading?: (sectionId: string, currentHeading: string) => void;
  onMoveItem?: (itemId: string, direction: "up" | "down") => void;
  onReorderItem?: (
    draggedItemId: string,
    targetItemId: string,
    position: GuideCardDropPosition,
  ) => void;
  onDragStart?: (itemId: string) => void;
  onDragEnd?: () => void;
  onDragOverItem?: (targetItemId: string, position: GuideCardDropPosition) => void;
  onToggleFullPrayer?: (prayerId: GuideCardEditAction["prayerId"], nextFull: boolean) => void;
  onEditTitle?: (field: "title" | "subtitle", currentText: string) => void;
  onSelectItem?: (action: GuideCardEditAction) => void;
  canMoveItem?: (itemId: string, direction: "up" | "down") => boolean;
  dragState?: GuideCardDragState;
  selectedItemId?: string;
};

type GuideCardFaceProps = {
  side: GuideCardSide;
  cardSize: GuideCardSize;
  mode?: GuideCardFaceMode;
  editHandlers?: GuideCardEditHandlers;
};

export function GuideCardFace({ side, cardSize, mode = "print", editHandlers }: GuideCardFaceProps) {
  const isEditable = mode === "preview" && Boolean(editHandlers);

  return (
    <article className={`print-card print-card-${cardSize} guide-card-face-${mode}`}>
      <header className={isEditable ? "guide-card-editable-title" : undefined}>
        <h2>{side.title}</h2>
        {side.subtitle ? <p className="print-card-subtitle">{side.subtitle}</p> : null}
        {isEditable ? (
          <div className="guide-card-item-controls guide-card-title-controls" aria-label="Card title controls">
            <button
              type="button"
              aria-label="Edit card title"
              title="Edit card title"
              onClick={() => editHandlers?.onEditTitle?.("title", side.title)}
            >
              Edit title
            </button>
            {side.subtitle ? (
              <button
                type="button"
                aria-label="Edit card subtitle"
                title="Edit card subtitle"
                onClick={() => editHandlers?.onEditTitle?.("subtitle", side.subtitle ?? "")}
              >
                Edit subtitle
              </button>
            ) : null}
          </div>
        ) : null}
      </header>
      {side.blocks.map((block) => (
        <GuideCardBlockView
          key={block.layoutInstanceId ?? block.id}
          block={block}
          cardSize={cardSize}
          editHandlers={isEditable ? editHandlers : undefined}
        />
      ))}
    </article>
  );
}

function GuideCardBlockView({
  block,
  cardSize,
  editHandlers,
}: {
  block: GuideCardBlock;
  cardSize: GuideCardSize;
  editHandlers?: GuideCardEditHandlers;
}) {
  const bodyClassName = [
    block.compact ? "compact" : "",
    cardSize === "full-1" ? "full-page-prayer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const editableItem = block.editableItems?.[0];
  const blockKey = block.layoutInstanceId ?? block.id;
  const editableAction: GuideCardEditAction | undefined = editableItem
    ? {
        itemId: editableItem.id,
        sectionId: editableItem.sectionId,
        itemType: editableItem.type,
        prayerId: editableItem.prayerId,
        title: editableItem.title,
        text: editableItem.currentText,
        heading: block.heading,
        printMode: editableItem.printMode,
        canToggleFullPrayer: editableItem.canToggleFullPrayer,
        canEdit: editableItem.canEdit,
        canDelete: editableItem.canDelete,
      }
    : undefined;
  const isDragging = Boolean(
    editHandlers?.dragState?.activeItemId &&
      editableAction?.itemId === editHandlers.dragState.activeItemId,
  );
  const dropPosition =
    editHandlers?.dragState?.targetItemId &&
    editableAction?.itemId === editHandlers.dragState.targetItemId
      ? editHandlers.dragState.position
      : undefined;

  return (
    <section
      className={[
        block.leaderOnly ? "leader-section" : "",
        editHandlers && editableAction ? "guide-card-editable-item" : "",
        isDragging ? "guide-card-dragging-item" : "",
        editHandlers?.selectedItemId &&
        editableAction?.itemId === editHandlers.selectedItemId
          ? "guide-card-mobile-selected-item"
          : "",
        dropPosition === "before" ? "guide-card-drop-before" : "",
        dropPosition === "after" ? "guide-card-drop-after" : "",
      ]
        .filter(Boolean)
        .join(" ") || undefined}
      data-editable-item-id={editableAction?.itemId}
      data-guide-block-key={blockKey}
      data-guide-section-id={editableAction?.sectionId}
      data-mobile-selected={
        editHandlers?.selectedItemId && editableAction?.itemId === editHandlers.selectedItemId
          ? "true"
          : undefined
      }
      draggable={Boolean(editHandlers && editableAction)}
      aria-label={editableAction ? `Select card item: ${editableAction.title ?? editableAction.text}` : undefined}
      onDragStart={(event) => {
        if (!editableAction) return;
        event.dataTransfer.setData("text/plain", editableAction.itemId);
        event.dataTransfer.effectAllowed = "move";
        editHandlers?.onDragStart?.(editableAction.itemId);
      }}
      onDragEnd={() => {
        editHandlers?.onDragEnd?.();
      }}
      onDragOver={(event) => {
        if (editHandlers && editableAction) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          const rect = event.currentTarget.getBoundingClientRect();
          const position = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
          editHandlers.onDragOverItem?.(editableAction.itemId, position);
        }
      }}
      onDrop={(event) => {
        if (!editableAction) return;
        event.preventDefault();
        const draggedItemId = event.dataTransfer.getData("text/plain");
        const rect = event.currentTarget.getBoundingClientRect();
        const position = event.clientY < rect.top + rect.height / 2 ? "before" : "after";

        if (draggedItemId && draggedItemId !== editableAction.itemId) {
          editHandlers?.onReorderItem?.(draggedItemId, editableAction.itemId, position);
        }

        editHandlers?.onDragEnd?.();
      }}
      onClick={() => {
        if (!editableAction) return;
        editHandlers?.onSelectItem?.(editableAction);
      }}
      onKeyDown={(event) => {
        if (!editableAction || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        editHandlers?.onSelectItem?.(editableAction);
      }}
      tabIndex={editHandlers && editableAction ? 0 : undefined}
    >
      {dropPosition === "before" ? <CardItemDropIndicator /> : null}
      {block.type === "heading" ? (
        <h3>{block.heading}</h3>
      ) : block.type === "compact-group" ? (
        <div className="guide-card-compact-group">
          {block.heading ? <h4>{block.heading}</h4> : null}
          {block.lines?.map((line) => (
            <p key={line} className={block.compact ? "compact" : undefined}>
              {line}
            </p>
          ))}
        </div>
      ) : block.heading ? (
        <div className="guide-card-heading-row">
          <h3>{block.heading}</h3>
          {editHandlers && editableAction ? (
            <button
              type="button"
              className="guide-card-heading-edit"
              aria-label={`Edit ${block.heading} heading`}
              title="Edit heading"
              onClick={() => editHandlers.onEditHeading?.(editableAction.sectionId, block.heading ?? "")}
            >
              Edit heading
            </button>
          ) : null}
        </div>
      ) : null}
      {block.body ? <p className={bodyClassName}>{block.body}</p> : null}
      {block.type !== "compact-group" && block.lines && block.lines.length > 0 ? (
        <ul className={block.compact ? "compact" : undefined}>
          {block.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {editHandlers && editableAction ? (
        <div
          className="guide-card-item-controls"
          aria-label="Card item controls"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Drag item"
            title="Drag item"
            className="guide-card-drag-handle"
          >
            Grip
          </button>
          <button
            type="button"
            aria-label="Move item up"
            title="Move up"
            disabled={!editHandlers.canMoveItem?.(editableAction.itemId, "up")}
            onClick={() => editHandlers.onMoveItem?.(editableAction.itemId, "up")}
          >
            Up
          </button>
          <button
            type="button"
            aria-label="Move item down"
            title="Move down"
            disabled={!editHandlers.canMoveItem?.(editableAction.itemId, "down")}
            onClick={() => editHandlers.onMoveItem?.(editableAction.itemId, "down")}
          >
            Down
          </button>
          <button
            type="button"
            aria-label="Add item below"
            title="Add item below"
            onClick={() => editHandlers.onAddItem?.(editableAction)}
          >
            Add
          </button>
          {editableAction.prayerId && editableAction.canToggleFullPrayer !== false ? (
            <button
              type="button"
              aria-label={
                editableAction.printMode === "full"
                  ? "Use short prayer text"
                  : "Use full prayer text"
              }
              title={editableAction.printMode === "full" ? "Use short text" : "Use full text"}
              onClick={() =>
                editHandlers.onToggleFullPrayer?.(
                  editableAction.prayerId,
                  editableAction.printMode !== "full",
                )
              }
            >
              {editableAction.printMode === "full" ? "Short" : "Full"}
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Edit item text"
            title="Edit text"
            onClick={() => editHandlers.onEditItem?.(editableAction.itemId, editableAction.text)}
          >
            Edit
          </button>
          <button
            type="button"
            aria-label="Remove item"
            title="Remove"
            onClick={() => editHandlers.onDeleteItem?.(editableAction.itemId)}
          >
            Remove
          </button>
        </div>
      ) : null}
      {dropPosition === "after" ? <CardItemDropIndicator /> : null}
    </section>
  );
}

function CardItemDropIndicator() {
  return (
    <div className="guide-card-drop-indicator" aria-hidden="true">
      <span />
    </div>
  );
}
