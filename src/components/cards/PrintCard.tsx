import type { RosaryCardContent, RosaryCardSide } from "@/lib/rosary/types";

type PrintCardProps = {
  content: RosaryCardContent;
  side: "front" | "back";
  cardNumber: number;
};

export function PrintCard({ content, side, cardNumber }: PrintCardProps) {
  const cardSide: RosaryCardSide = content[side];

  return (
    <article className="print-card">
      <p className="print-card-number">Card {cardNumber}</p>
      <h2>{content.title}</h2>
      <p className="print-card-subtitle">{content.subtitle}</p>
      <h3>{cardSide.heading}</h3>
      {cardSide.sections.map((section) => (
        <section key={section.id} className={section.leaderOnly ? "leader-section" : undefined}>
          <h4>{section.heading}</h4>
          <p className={section.compact ? "compact" : undefined}>{section.body}</p>
        </section>
      ))}
    </article>
  );
}
