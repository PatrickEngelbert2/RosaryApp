import type {
  GeneratedGuideCard,
  GuideCardBlock,
  GuideCardSide,
  GuideCardSize,
} from "@/lib/rosary/types";

type PrintCardProps = {
  card: GeneratedGuideCard;
  side: "front" | "back";
  extraSideIndex?: number;
};

export function PrintCard({ card, side, extraSideIndex }: PrintCardProps) {
  const cardSide: GuideCardSide =
    typeof extraSideIndex === "number" ? card.extraSides?.[extraSideIndex] ?? card.front : card[side] ?? card.front;

  return (
    <article className={`print-card print-card-${card.layoutOptions.cardSize}`}>
      <h2>{cardSide.title}</h2>
      {cardSide.subtitle ? <p className="print-card-subtitle">{cardSide.subtitle}</p> : null}
      {cardSide.blocks.map((block) => (
        <PrintCardBlock key={block.id} block={block} cardSize={card.layoutOptions.cardSize} />
      ))}
    </article>
  );
}

function PrintCardBlock({
  block,
  cardSize,
}: {
  block: GuideCardBlock;
  cardSize: GuideCardSize;
}) {
  if (block.type === "heading") {
    return <h3>{block.heading}</h3>;
  }

  return (
    <section className={block.leaderOnly ? "leader-section" : undefined}>
      {block.heading ? <h3>{block.heading}</h3> : null}
      {block.body ? (
        <p className={`${block.compact ? "compact" : ""} ${cardSize === "full-page" ? "full-page-prayer" : ""}`.trim()}>
          {block.body}
        </p>
      ) : null}
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
