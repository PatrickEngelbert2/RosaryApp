import type { ReactNode } from "react";

export type ExploreIconName =
  | "pray"
  | "guide"
  | "cards"
  | "walk"
  | "prayer"
  | "resources";

type ExploreIconProps = {
  name: ExploreIconName;
};

const svgProps = {
  className: "h-9 w-9",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2.45,
  viewBox: "0 0 64 64",
};

export function ExploreIcon({ name }: ExploreIconProps) {
  const icons: Record<ExploreIconName, ReactNode> = {
    pray: (
      <svg aria-hidden="true" {...svgProps}>
        <g className="explore-pray-rosary">
          <path
            className="explore-pray-loop text-blue-900/45"
            d="M18 31c0-9 6-16 14-16s14 7 14 16-6 16-14 16-14-7-14-16Z"
          />
          {[
            [32, 15],
            [24, 18],
            [19, 25],
            [18, 34],
            [24, 44],
            [32, 47],
            [40, 44],
            [46, 34],
            [45, 25],
            [40, 18],
          ].map(([cx, cy]) => (
            <circle
              key={`${cx}-${cy}`}
              className="explore-pray-bead fill-cream-50"
              cx={cx}
              cy={cy}
              r="3"
            />
          ))}
          <path className="explore-pray-chain text-blue-900/45" d="M32 47v5" />
          <path className="explore-pray-cross" d="M32 52v8M28 56h8" />
        </g>
      </svg>
    ),
    guide: (
      <svg aria-hidden="true" {...svgProps}>
        <g className="explore-build-paper">
          <path className="fill-cream-50" d="M16 14h27l6 6v34H16Z" />
          <path d="M43 14v7h6" />
          <path className="explore-build-line" d="M23 31h18" />
          <path className="explore-build-line" d="M23 39h15" />
          <path className="explore-build-line" d="M23 47h11" />
        </g>
        <g className="explore-build-hammer text-gold-500">
          <path className="fill-gold-500/25" d="M15 19h26v9H15Z" />
          <path d="M15 19h26v9H15Z" />
          <path d="M15 19c-4 1-7 3-9 6" />
          <path d="M15 28c-4-1-7-3-9-6" />
          <path d="M35 28 51 51" strokeWidth="5" />
          <path d="M48 52h8" strokeWidth="4" />
        </g>
        <path className="explore-build-spark text-gold-500" d="M51 30l4-3M52 36h5" />
      </svg>
    ),
    cards: (
      <svg aria-hidden="true" {...svgProps}>
        <g className="explore-card-back">
          <path className="fill-cream-50" d="M18 18h25a4 4 0 0 1 4 4v24" />
          <path d="M18 18h25a4 4 0 0 1 4 4v24" />
        </g>
        <g className="explore-card-front">
          <path className="fill-cream-50" d="M14 24h28a4 4 0 0 1 4 4v20H18a4 4 0 0 1-4-4Z" />
          <path d="M14 24h28a4 4 0 0 1 4 4v20H18a4 4 0 0 1-4-4Z" />
          <path d="M22 34h14" />
          <path d="M22 41h9" />
        </g>
      </svg>
    ),
    walk: (
      <svg aria-hidden="true" {...svgProps}>
        <path
          className="explore-walk-path text-blue-900/40"
          d="M12 51c8-10 17-13 27-10 7 2 13-2 15-12"
        />
        <g className="explore-footstep-one">
          <path className="fill-cream-50" d="M16 45c4-2 8 1 8 5 0 5-7 7-10 3-2-3-1-6 2-8Z" />
          <path d="M16 45c4-2 8 1 8 5 0 5-7 7-10 3-2-3-1-6 2-8Z" />
        </g>
        <g className="explore-footstep-two">
          <path className="fill-cream-50" d="M29 34c4-2 8 1 8 5 0 5-7 7-10 3-2-3-1-6 2-8Z" />
          <path d="M29 34c4-2 8 1 8 5 0 5-7 7-10 3-2-3-1-6 2-8Z" />
        </g>
        <g className="explore-walk-marker">
          <path className="fill-gold-500/15" d="M47 12c5 0 9 4 9 9 0 7-9 17-9 17s-9-10-9-17c0-5 4-9 9-9Z" />
          <path d="M47 12c5 0 9 4 9 9 0 7-9 17-9 17s-9-10-9-17c0-5 4-9 9-9Z" />
          <path className="explore-walk-cross" d="M47 17v9M43 21.5h8" />
        </g>
      </svg>
    ),
    prayer: (
      <svg aria-hidden="true" {...svgProps}>
        <path className="explore-prayer-cover fill-gold-500/15" d="M16 17h14a8 8 0 0 1 8 8v25H24a8 8 0 0 0-8-8Z" />
        <path className="explore-prayer-page fill-cream-50" d="M38 17h10v25a8 8 0 0 0-8 8H24a8 8 0 0 1 8-8h6Z" />
        <path d="M16 17h14a8 8 0 0 1 8 8v25" />
        <path d="M38 25a8 8 0 0 1 8-8h2v25a8 8 0 0 0-8 8H24a8 8 0 0 0-8-8V17" />
        <path className="explore-prayer-line" d="M23 29h9" />
        <path className="explore-prayer-line" d="M23 36h10" />
        <path className="explore-prayer-line" d="M43 29h3" />
      </svg>
    ),
    resources: (
      <svg aria-hidden="true" {...svgProps}>
        <circle className="explore-resource-ring fill-cream-50" cx="32" cy="33" r="17" />
        <path className="explore-compass-needle fill-gold-500/20" d="M39 22 34 38 25 44l5-16Z" />
        <path d="M39 22 34 38 25 44l5-16Z" />
        <path className="explore-resource-star" d="M49 12l1.7 3.4 3.8.6-2.7 2.6.6 3.8-3.4-1.8-3.4 1.8.6-3.8-2.7-2.6 3.8-.6Z" />
      </svg>
    ),
  };

  return (
    <span className="card-link-icon flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/5 text-blue-900 transition">
      {icons[name]}
    </span>
  );
}
