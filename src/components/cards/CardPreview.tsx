import type { RosaryCardContent } from "@/lib/rosary/types";

type CardPreviewProps = {
  content: RosaryCardContent;
  label?: string;
};

export function CardPreview({ content, label }: CardPreviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CardSidePreview content={content} side="front" label={label ? `${label} front` : "Front"} />
      <CardSidePreview content={content} side="back" label={label ? `${label} back` : "Back"} />
    </div>
  );
}

export function CardSidePreview({
  content,
  side,
  label,
}: {
  content: RosaryCardContent;
  side: "front" | "back";
  label: string;
}) {
  const cardSide = content[side];

  return (
    <article className="rounded-lg border border-blue-900/20 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{label}</p>
      <h3 className="mt-2 text-lg font-bold text-blue-900">{content.title}</h3>
      <p className="text-sm leading-6 text-slate-700">{content.subtitle}</p>
      <h4 className="mt-4 font-semibold text-blue-900">{cardSide.heading}</h4>
      <div className="mt-3 space-y-3">
        {cardSide.sections.map((section) => (
          <section key={section.id} className={section.leaderOnly ? "border-l-4 border-gold-500 pl-3" : ""}>
            <h5 className="text-sm font-semibold text-slate-900">{section.heading}</h5>
            <p className={`mt-1 text-slate-700 ${section.compact ? "text-sm leading-5" : "text-sm leading-6"}`}>
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
