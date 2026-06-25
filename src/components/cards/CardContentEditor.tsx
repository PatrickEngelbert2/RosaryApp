"use client";

import type { RosaryCardContent, RosaryCardSection } from "@/lib/rosary/types";

export function CardContentEditor({
  content,
  onChange,
}: {
  content: RosaryCardContent;
  onChange: (content: RosaryCardContent) => void;
}) {
  function updateSection(
    side: "front" | "back",
    sectionId: string,
    changes: Partial<RosaryCardSection>,
  ) {
    onChange({
      ...content,
      [side]: {
        ...content[side],
        sections: content[side].sections.map((section) =>
          section.id === sectionId ? { ...section, ...changes } : section,
        ),
      },
    });
  }

  function addSection(side: "front" | "back") {
    onChange({
      ...content,
      [side]: {
        ...content[side],
        sections: [
          ...content[side].sections,
          {
            id: `${side}-section-${Date.now()}`,
            heading: "New section",
            body: "Add concise card text here.",
            compact: true,
            leaderOnly: false,
          },
        ],
      },
    });
  }

  function removeSection(side: "front" | "back", sectionId: string) {
    onChange({
      ...content,
      [side]: {
        ...content[side],
        sections: content[side].sections.filter((section) => section.id !== sectionId),
      },
    });
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold text-blue-900">
          Title
          <input
            value={content.title}
            onChange={(event) => onChange({ ...content, title: event.target.value })}
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
          />
        </label>
        <label className="block text-sm font-semibold text-blue-900">
          Subtitle
          <input
            value={content.subtitle}
            onChange={(event) => onChange({ ...content, subtitle: event.target.value })}
            className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
          />
        </label>
      </div>
      {(["front", "back"] as const).map((side) => (
        <fieldset key={side} className="rounded-lg border border-blue-900/10 p-4">
          <legend className="px-2 text-lg font-semibold capitalize text-blue-900">{side}</legend>
          <label className="block text-sm font-semibold text-blue-900">
            Heading
            <input
              value={content[side].heading}
              onChange={(event) =>
                onChange({
                  ...content,
                  [side]: { ...content[side], heading: event.target.value },
                })
              }
              className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
            />
          </label>
          <div className="mt-4 space-y-4">
            {content[side].sections.map((section) => (
              <div key={section.id} className="rounded-md bg-cream-50 p-4">
                <label className="block text-sm font-semibold text-blue-900">
                  Section heading
                  <input
                    value={section.heading}
                    onChange={(event) =>
                      updateSection(side, section.id, { heading: event.target.value })
                    }
                    className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
                  />
                </label>
                <label className="mt-3 block text-sm font-semibold text-blue-900">
                  Body
                  <textarea
                    value={section.body}
                    onChange={(event) =>
                      updateSection(side, section.id, { body: event.target.value })
                    }
                    rows={3}
                    className="interactive-field mt-2 w-full rounded-md border border-blue-900/20 px-3 py-3 text-base"
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={section.compact}
                      onChange={(event) =>
                        updateSection(side, section.id, { compact: event.target.checked })
                      }
                    />
                    Compact
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={section.leaderOnly}
                      onChange={(event) =>
                        updateSection(side, section.id, { leaderOnly: event.target.checked })
                      }
                    />
                    Leader only
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSection(side, section.id)}
                    className="interactive-link text-sm font-semibold text-blue-900 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addSection(side)}
            className="interactive-button interactive-button-secondary mt-4 rounded-md border border-blue-900/20 bg-white px-4 py-2 font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            Add {side} section
          </button>
        </fieldset>
      ))}
    </div>
  );
}
