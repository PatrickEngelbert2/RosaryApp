"use client";

import { useId, useState } from "react";

type InfoPopoverProps = {
  label: string;
  children: string;
};

export function InfoPopover({ label, children }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();

  return (
    <span className="relative inline-flex align-middle">
      <button
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
          id={popoverId}
          role="tooltip"
          className="absolute right-0 top-9 z-50 w-64 rounded-lg border border-blue-900/10 bg-white p-3 text-left text-sm font-medium leading-6 text-slate-700 shadow-xl sm:left-0 sm:right-auto"
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
