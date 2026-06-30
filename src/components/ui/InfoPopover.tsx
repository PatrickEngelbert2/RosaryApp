"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type InfoPopoverProps = {
  label: string;
  children: string;
};

export function InfoPopover({ label, children }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const popoverId = useId();
  const updatePosition = useCallback(() => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const margin = 16;
    const gap = 8;
    const buttonRect = button.getBoundingClientRect();
    const tooltipWidth = Math.min(320, window.innerWidth - margin * 2);
    const left = Math.min(
      Math.max(margin, buttonRect.left),
      window.innerWidth - tooltipWidth - margin,
    );
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 0;
    const belowTop = buttonRect.bottom + gap;
    const aboveTop = buttonRect.top - tooltipHeight - gap;
    const top =
      tooltipHeight > 0 && belowTop + tooltipHeight > window.innerHeight - margin
        ? Math.max(margin, aboveTop)
        : belowTop;

    setPosition({
      left,
      top,
      width: tooltipWidth,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [children, open, updatePosition]);

  return (
    <span className="relative inline-flex align-middle">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="interactive-button inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-900/15 bg-white text-sm font-bold text-blue-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
      >
        i
      </button>
      {open ? (
        <span
          ref={tooltipRef}
          id={popoverId}
          role="tooltip"
          style={position}
          className="fixed z-50 rounded-lg border border-blue-900/10 bg-white p-3 text-left text-sm font-medium leading-6 text-slate-700 shadow-xl"
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
