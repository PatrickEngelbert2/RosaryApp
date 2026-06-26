"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type InfoPopoverProps = {
  label: string;
  children: ReactNode;
};

type PopoverPosition = {
  left: number;
  top: number;
  width: number;
};

const VIEWPORT_PADDING = 12;
const POPOVER_GAP = 10;
const MAX_POPOVER_WIDTH = 320;

export function InfoPopover({ label, children }: InfoPopoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const popoverId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextFocusOpen = useRef(false);
  const open = isHovered || isFocused || isPinned;

  const clearHoverCloseTimer = useCallback(() => {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  }, []);

  const closePopover = useCallback(() => {
    clearHoverCloseTimer();
    setIsHovered(false);
    setIsFocused(false);
    setIsPinned(false);
  }, [clearHoverCloseTimer]);

  const closePopoverAndReturnFocus = useCallback(() => {
    closePopover();
    skipNextFocusOpen.current = true;
    triggerRef.current?.focus();
  }, [closePopover]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(MAX_POPOVER_WIDTH, viewportWidth - VIEWPORT_PADDING * 2);
    const measuredHeight = popoverRef.current?.offsetHeight ?? 150;
    const clampLeft = (nextLeft: number) =>
      Math.min(
        Math.max(nextLeft, VIEWPORT_PADDING),
        viewportWidth - width - VIEWPORT_PADDING,
      );
    const clampTop = (nextTop: number) =>
      Math.min(
        Math.max(nextTop, VIEWPORT_PADDING),
        viewportHeight - measuredHeight - VIEWPORT_PADDING,
      );

    let left = triggerRect.right + POPOVER_GAP;
    let top = triggerRect.top + triggerRect.height / 2 - measuredHeight / 2;

    if (left + width > viewportWidth - VIEWPORT_PADDING) {
      left = triggerRect.left + triggerRect.width / 2 - width / 2;
      top = triggerRect.bottom + POPOVER_GAP;
    }

    if (top + measuredHeight > viewportHeight - VIEWPORT_PADDING) {
      top = triggerRect.top - measuredHeight - POPOVER_GAP;
    }

    setPosition({
      left: clampLeft(left),
      top: clampTop(top),
      width,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, children, updatePosition]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }

      closePopover();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closePopoverAndReturnFocus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closePopover, closePopoverAndReturnFocus]);

  useEffect(() => {
    return () => clearHoverCloseTimer();
  }, [clearHoverCloseTimer]);

  function handlePointerEnter(event: ReactPointerEvent) {
    if (event.pointerType === "touch") {
      return;
    }

    clearHoverCloseTimer();
    setIsHovered(true);
  }

  function handlePointerLeave(event: ReactPointerEvent) {
    if (event.pointerType === "touch" || isPinned) {
      return;
    }

    clearHoverCloseTimer();
    hoverCloseTimer.current = setTimeout(() => {
      setIsHovered(false);
    }, 90);
  }

  function handleBlur() {
    window.setTimeout(() => {
      const activeElement = document.activeElement;

      if (
        activeElement &&
        (triggerRef.current?.contains(activeElement) ||
          popoverRef.current?.contains(activeElement))
      ) {
        return;
      }

      if (!isPinned) {
        setIsFocused(false);
      }
    }, 0);
  }

  const popover = open ? (
    <div
      ref={popoverRef}
      id={popoverId}
      role="dialog"
      aria-label={`${label} help text`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlur={handleBlur}
      className="fixed z-[100] rounded-lg border border-blue-900/10 bg-white p-3 pr-9 text-left text-sm font-medium leading-6 text-slate-700 shadow-xl outline-none motion-safe:animate-easy-step motion-reduce:animate-none"
      style={{
        left: position?.left ?? VIEWPORT_PADDING,
        top: position?.top ?? VIEWPORT_PADDING,
        width: position?.width ?? MAX_POPOVER_WIDTH,
      }}
    >
      <button
        type="button"
        aria-label="Close help text"
        onClick={closePopoverAndReturnFocus}
        className={`interactive-button absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-blue-900/10 text-sm font-bold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 ${
          isPinned ? "bg-cream-50" : "bg-white sm:hidden"
        }`}
      >
        x
      </button>
      <div id={`${popoverId}-content`}>{children}</div>
    </div>
  ) : null;

  return (
    <span className="inline-flex align-middle">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-describedby={open ? `${popoverId}-content` : undefined}
        onClick={() => {
          if (isPinned) {
            closePopover();
            return;
          }

          clearHoverCloseTimer();
          setIsHovered(false);
          setIsFocused(false);
          setIsPinned(true);
        }}
        onFocus={() => {
          if (skipNextFocusOpen.current) {
            skipNextFocusOpen.current = false;
            return;
          }

          setIsFocused(true);
        }}
        onBlur={handleBlur}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="interactive-button inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-900/15 bg-white text-sm font-bold text-blue-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
      >
        i
      </button>
      {popover && typeof document !== "undefined"
        ? createPortal(popover, document.body)
        : null}
    </span>
  );
}

