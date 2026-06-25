import type { GuideCardBlock, GuideCardSide, GuideCardSize } from "@/lib/rosary/types";

type GeneratedGuideCardPreviewProps = {
  sides: GuideCardSide[];
  cardSize: GuideCardSize;
};

export function GeneratedGuideCardPreview({ sides, cardSize }: GeneratedGuideCardPreviewProps) {
  return (
    <div className={cardSize === "pocket" ? "grid gap-4 lg:grid-cols-2" : "grid gap-4"}>
      {sides.map((side, index) => (
        <GeneratedGuideCardSide
          key={side.id}
          side={side}
          label={index === 0 ? "Preview: Front" : index === 1 ? "Preview: Back" : `Preview: Extra side ${index - 1}`}
        />
      ))}
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
        {side.blocks.map((block) => (
          <GeneratedGuideCardBlock key={block.id} block={block} />
        ))}
      </div>
      {side.overflowWarnings?.map((warning) => (
        <p key={warning} className="mt-3 rounded-md bg-cream-100 px-3 py-2 text-xs font-medium text-slate-700">
          {warning}
        </p>
      ))}
    </article>
  );
}

function GeneratedGuideCardBlock({ block }: { block: GuideCardBlock }) {
  if (block.type === "heading") {
    return <h3 className="text-sm font-semibold text-blue-900">{block.heading}</h3>;
  }

  return (
    <section className={block.leaderOnly ? "border-l-4 border-gold-500 pl-3" : ""}>
      {block.heading ? <h3 className="text-sm font-semibold text-blue-900">{block.heading}</h3> : null}
      {block.body ? (
        <p className={`mt-1 whitespace-pre-line text-slate-700 ${block.compact ? "text-xs leading-5" : "text-sm leading-6"}`}>
          {block.body}
        </p>
      ) : null}
      {block.lines && block.lines.length > 0 ? (
        <ul className={`mt-1 space-y-1 text-slate-700 ${block.compact ? "text-xs leading-5" : "text-sm leading-6"}`}>
          {block.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
