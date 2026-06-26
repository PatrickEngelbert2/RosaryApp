import type { GuideCardBlock, GuideCardSide, GuideCardSize } from "@/lib/rosary/types";

type GuideCardFaceMode = "preview" | "print";

type GuideCardFaceProps = {
  side: GuideCardSide;
  cardSize: GuideCardSize;
  mode?: GuideCardFaceMode;
};

export function GuideCardFace({ side, cardSize, mode = "print" }: GuideCardFaceProps) {
  return (
    <article className={`print-card print-card-${cardSize} guide-card-face-${mode}`}>
      <h2>{side.title}</h2>
      {side.subtitle ? <p className="print-card-subtitle">{side.subtitle}</p> : null}
      {side.blocks.map((block) => (
        <GuideCardBlockView key={block.id} block={block} cardSize={cardSize} />
      ))}
    </article>
  );
}

function GuideCardBlockView({
  block,
  cardSize,
}: {
  block: GuideCardBlock;
  cardSize: GuideCardSize;
}) {
  if (block.type === "heading") {
    return <h3>{block.heading}</h3>;
  }

  const bodyClassName = [
    block.compact ? "compact" : "",
    cardSize === "full-1" ? "full-page-prayer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={block.leaderOnly ? "leader-section" : undefined}>
      {block.heading ? <h3>{block.heading}</h3> : null}
      {block.body ? <p className={bodyClassName}>{block.body}</p> : null}
      {block.lines && block.lines.length > 0 ? (
        <ul className={block.compact ? "compact" : undefined}>
          {block.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
