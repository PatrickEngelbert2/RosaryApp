import type { GuideCardSection, GuideCardSide } from "@/lib/rosary/types";

type GeneratedGuideCardPreviewProps = {
  front: GuideCardSide;
  back: GuideCardSide;
};

export function GeneratedGuideCardPreview({ front, back }: GeneratedGuideCardPreviewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GeneratedGuideCardSide side={front} label="Front side preview" />
      <GeneratedGuideCardSide side={back} label="Back side preview" />
    </div>
  );
}

export function GeneratedGuideCardSide({
  side,
  label,
}: {
  side: GuideCardSide;
  label: string;
}) {
  return (
    <article className="rounded-lg border border-blue-900/20 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{label}</p>
      <h2 className="mt-2 text-xl font-bold text-blue-900">{side.title}</h2>
      {side.subtitle ? <p className="text-sm leading-6 text-slate-700">{side.subtitle}</p> : null}
      <div className="mt-4 space-y-3">
        {side.sections.map((section) => (
          <GeneratedGuideCardSection key={section.id} section={section} />
        ))}
      </div>
    </article>
  );
}

function GeneratedGuideCardSection({ section }: { section: GuideCardSection }) {
  return (
    <section className={section.leaderOnly ? "border-l-4 border-gold-500 pl-3" : ""}>
      <h3 className="text-sm font-semibold text-blue-900">{section.heading}</h3>
      {section.body ? (
        <p className="mt-1 text-sm leading-6 text-slate-700">{section.body}</p>
      ) : null}
      {section.lines.length > 0 ? (
        <ul className={`mt-1 space-y-1 text-slate-700 ${section.compact ? "text-xs leading-5" : "text-sm leading-6"}`}>
          {section.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
