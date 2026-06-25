"use client";

import { useState } from "react";
import type { Prayer } from "@/lib/rosary/types";

type CollapsiblePrayerProps = {
  prayer: Prayer;
  title?: string;
  defaultExpanded?: boolean;
  defaultCollapsed?: boolean;
  largeText?: boolean;
  stepNumber?: number;
  repeatCount?: number;
  forceExpanded?: boolean;
  forceCollapsed?: boolean;
};

export function CollapsiblePrayer({
  prayer,
  title,
  defaultExpanded,
  defaultCollapsed,
  largeText = false,
  stepNumber,
  repeatCount = 1,
  forceExpanded,
  forceCollapsed,
}: CollapsiblePrayerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? !defaultCollapsed);
  const isExpanded = forceExpanded ? true : forceCollapsed ? false : expanded;
  const contentId = `prayer-${prayer.id}-${stepNumber ?? "single"}`;

  return (
    <article className="rounded-lg border border-blue-900/10 bg-white/95 p-3 shadow-sm sm:p-4">
      <button
        type="button"
        className="interactive-button group flex w-full items-start gap-3 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setExpanded((current) => !current)}
      >
        {stepNumber ? (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-900/10 text-xs font-semibold text-blue-900">
            {stepNumber}
          </span>
        ) : null}
        <span className="flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="block text-lg font-semibold leading-6 text-blue-900">
              {title ?? prayer.title}
            </span>
            {repeatCount > 1 ? (
              <span className="rounded-full border border-blue-900/15 bg-cream-100 px-2 py-0.5 text-xs font-semibold text-blue-900">
                x {repeatCount}
              </span>
            ) : null}
          </span>
          {!isExpanded ? (
            <span className="mt-1 block text-sm leading-6 text-slate-700">{prayer.incipit}</span>
          ) : null}
        </span>
        <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-blue-900 transition group-hover:bg-gold-500/10">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </button>
      {isExpanded ? (
        <div id={contentId} className="mt-3 border-t border-blue-900/10 pt-3">
          {repeatCount > 1 ? (
            <p className="mb-2 text-sm font-medium text-slate-600">Pray {repeatCount} times.</p>
          ) : null}
          <p
            className={`whitespace-pre-line text-slate-800 ${
              largeText ? "text-2xl leading-10" : "text-lg leading-8"
            }`}
          >
            {prayer.text}
          </p>
        </div>
      ) : null}
    </article>
  );
}
