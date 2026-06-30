"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { InfoPopover } from "@/components/ui/InfoPopover";

type BuilderSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  helpLabel: string;
  helpText: string;
  status?: string;
};

type BuilderSectionCardProps = BuilderSectionHeaderProps & {
  children: ReactNode;
};

type CollapsibleBuilderSectionProps = BuilderSectionHeaderProps & {
  children: ReactNode;
  defaultOpen?: boolean;
};

export function BuilderSectionCard({
  children,
  description,
  eyebrow,
  helpLabel,
  helpText,
  status,
  title,
}: BuilderSectionCardProps) {
  return (
    <section className="rounded-lg border border-blue-900/10 bg-white p-5 shadow-sm">
      <BuilderSectionHeader
        description={description}
        eyebrow={eyebrow}
        helpLabel={helpLabel}
        helpText={helpText}
        status={status}
        title={title}
      />
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function CollapsibleBuilderSection({
  children,
  defaultOpen = false,
  description,
  eyebrow,
  helpLabel,
  helpText,
  status,
  title,
}: CollapsibleBuilderSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-lg border border-blue-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <BuilderSectionHeader
          description={description}
          eyebrow={eyebrow}
          helpLabel={helpLabel}
          helpText={helpText}
          status={status}
          title={title}
        />
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="interactive-button interactive-button-secondary shrink-0 rounded-full border border-blue-900/20 bg-white px-3 py-2 text-sm font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open ? (
        <div className="mt-5 motion-safe:animate-easy-step">{children}</div>
      ) : null}
    </section>
  );
}

function BuilderSectionHeader({
  description,
  eyebrow,
  helpLabel,
  helpText,
  status,
  title,
}: BuilderSectionHeaderProps) {
  return (
    <div className="min-w-0">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{eyebrow}</p>
      ) : null}
      <div className="mt-1 flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-blue-900">{title}</h2>
        <InfoPopover label={helpLabel}>{helpText}</InfoPopover>
      </div>
      {description ? <p className="mt-2 leading-7 text-slate-700">{description}</p> : null}
      {status ? (
        <p className="mt-3 inline-flex rounded-full bg-cream-100 px-3 py-1 text-sm font-semibold text-blue-900">
          {status}
        </p>
      ) : null}
    </div>
  );
}
