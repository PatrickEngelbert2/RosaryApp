import type { GeneratedGuideCard, GuideCardSection, GuideCardSide } from "@/lib/rosary/types";

type PrintCardProps = {
  card: GeneratedGuideCard;
  side: "front" | "back";
};

export function PrintCard({ card, side }: PrintCardProps) {
  const cardSide: GuideCardSide = card[side];

  return (
    <article className="print-card">
      <p className="print-card-number">Card {card.cardNumber}</p>
      <h2>{cardSide.title}</h2>
      {cardSide.subtitle ? <p className="print-card-subtitle">{cardSide.subtitle}</p> : null}
      {cardSide.sections.map((section) => (
        <PrintCardSection key={section.id} section={section} />
      ))}
    </article>
  );
}

function PrintCardSection({ section }: { section: GuideCardSection }) {
  return (
    <section className={section.leaderOnly ? "leader-section" : undefined}>
      <h3>{section.heading}</h3>
      {section.body ? <p className={section.compact ? "compact" : undefined}>{section.body}</p> : null}
      {section.lines.length > 0 ? (
        <ul className={section.compact ? "compact" : undefined}>
          {section.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
