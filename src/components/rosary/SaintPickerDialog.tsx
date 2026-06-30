"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { searchSaintDirectory } from "@/lib/rosary/saintDirectory";

type SaintPickerDialogProps = {
  open: boolean;
  selectedSaintIds: string[];
  onCancel: () => void;
  onDone: (selectedSaintIds: string[]) => void;
};

export function SaintPickerDialog({
  open,
  selectedSaintIds,
  onCancel,
  onDone,
}: SaintPickerDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [draftSelectedIds, setDraftSelectedIds] = useState<string[]>(selectedSaintIds);
  const [query, setQuery] = useState("");
  const filteredSaints = useMemo(() => searchSaintDirectory(query), [query]);
  const selectedCount = draftSelectedIds.length;

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setDraftSelectedIds(selectedSaintIds);
      setQuery("");
      searchRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [open, selectedSaintIds]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  function toggleSaint(saintId: string, checked: boolean) {
    setDraftSelectedIds((current) => {
      if (checked) {
        return current.includes(saintId) ? current : [...current, saintId];
      }

      return current.filter((id) => id !== saintId);
    });
  }

  const dialog = (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-blue-950/45 px-3 py-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-blue-900/10 bg-cream-50 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-blue-900/10 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">
              Saint invocations
            </p>
            <h3 id={titleId} className="mt-1 text-2xl font-semibold text-blue-900">
              Choose saints
            </h3>
            <p id={descriptionId} className="mt-2 max-w-2xl leading-7 text-slate-700">
              Select saints or titles to include in your invocation list. You can also search by
              patronage or theme.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close saint picker"
            onClick={onCancel}
            className="interactive-button flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-900/10 bg-white text-lg font-bold text-blue-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30"
          >
            x
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <div className="shrink-0 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block text-sm font-semibold text-blue-900" htmlFor={searchId}>
              Search saints, virtues, patronage
              <span className="relative mt-2 block">
                <input
                  ref={searchRef}
                  id={searchId}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search saints, virtues, patronage..."
                  className="interactive-field w-full rounded-md border border-blue-900/20 bg-white px-3 py-3 pr-12 text-base text-slate-900"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Clear saint search"
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                    className="interactive-button absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-blue-900/10 bg-cream-50 text-sm font-bold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30"
                  >
                    x
                  </button>
                ) : null}
              </span>
            </label>
            <p className="rounded-full bg-gold-500/10 px-4 py-2 text-sm font-semibold text-blue-900">
              {selectedCount} selected
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-lg border border-blue-900/10 bg-white">
            {filteredSaints.length > 0 ? (
              <ul className="divide-y divide-blue-900/10">
                {filteredSaints.map((saint) => {
                  const checked = draftSelectedIds.includes(saint.id);

                  return (
                    <li key={saint.id}>
                      <label
                        className={`flex cursor-pointer gap-3 p-4 transition hover:bg-cream-50 motion-reduce:transition-none ${
                          checked ? "bg-gold-500/10" : "bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => toggleSaint(saint.id, event.target.checked)}
                          className="mt-1 h-5 w-5 accent-blue-900"
                        />
                        <span>
                          <span className="block font-semibold text-blue-900">{saint.name}</span>
                          <span className="mt-2 flex flex-wrap gap-1.5">
                            {saint.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-cream-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="font-semibold text-blue-900">No saints found.</p>
                <p className="mt-2 leading-7 text-slate-700">
                  Try another search, or add a custom invocation manually.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-blue-900/10 bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="interactive-button interactive-button-secondary rounded-md border border-blue-900/20 bg-white px-5 py-3 font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onDone(draftSelectedIds)}
            className="interactive-button interactive-button-primary rounded-md bg-blue-900 px-5 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
