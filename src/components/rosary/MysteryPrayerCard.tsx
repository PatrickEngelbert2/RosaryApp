"use client";

import { useState } from "react";
import type { Mystery } from "@/lib/rosary/types";

type MysteryPrayerCardProps = {
  mystery: Mystery;
};

const ordinalWords = ["First", "Second", "Third", "Fourth", "Fifth"];

export function MysteryPrayerCard({ mystery }: MysteryPrayerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = `mystery-reading-${mystery.id}`;
  const label = `${ordinalWords[mystery.number - 1] ?? `${mystery.number}th`} ${mystery.setName.replace(
    "Mysteries",
    "Mystery",
  )}`;
  const fruitLine =
    mystery.leaderFruitLine ??
    (mystery.fruitOfMystery ? `The fruit of this mystery is ${mystery.fruitOfMystery}.` : "");
  const translation = mystery.readingTranslation ?? "RSV-2CE";
  const hasReading = Boolean(mystery.scriptureReference || mystery.readingText);

  return (
    <article className="rounded-lg border border-blue-900/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{label}</p>
      <h2 className="mt-1 text-2xl font-semibold leading-tight text-blue-900">{mystery.title}</h2>
      {fruitLine ? <p className="mt-3 text-base leading-7 text-slate-800">{fruitLine}</p> : null}
      {mystery.scriptureReference ? (
        <p className="mt-2 text-sm font-medium text-slate-600">{mystery.scriptureReference}</p>
      ) : null}
      {hasReading ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((current) => !current)}
          className="interactive-button interactive-button-secondary mt-3 rounded-full border border-blue-900/15 bg-cream-50 px-3 py-1.5 text-sm font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          {expanded ? "Hide reading" : "Show reading"}
        </button>
      ) : null}
      {expanded && hasReading ? (
        <div id={contentId} className="mt-4 rounded-md bg-cream-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
            Reading {translation}
          </p>
          {mystery.readingText ? (
            <p className="mt-2 whitespace-pre-line text-base leading-7 text-slate-800">
              {mystery.readingText}
            </p>
          ) : mystery.scriptureReference ? (
            <p className="mt-2 text-base leading-7 text-slate-800">
              Read: {mystery.scriptureReference}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
