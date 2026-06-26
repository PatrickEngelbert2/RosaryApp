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
  className: "h-8 w-8",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2.2,
  viewBox: "0 0 64 64",
};

export function ExploreIcon({ name }: ExploreIconProps) {
  const icons: Record<ExploreIconName, ReactNode> = {
    pray: (
      <svg aria-hidden="true" {...svgProps}>
        <path
          className="explore-pray-chain text-blue-900/35"
          d="M18 22c5-8 23-8 28 0 5 8-2 21-14 25-12-4-19-17-14-25Z"
        />
        {[18, 26, 38, 46, 22, 32, 42].map((cx, index) => (
          <circle
            key={`${cx}-${index}`}
            className="explore-pray-bead fill-cream-50"
            cx={cx}
            cy={index < 4 ? 23 + (index % 2) * 7 : 39}
            r="4.2"
          />
        ))}
        <path className="explore-pray-cross" d="M32 43v12M26 49h12" />
      </svg>
    ),
    guide: (
      <svg aria-hidden="true" {...svgProps}>
        <g className="explore-build-paper">
          <path className="fill-cream-50" d="M23 14h23v36H18V19l5-5Z" />
          <path d="M23 14v6h-5" />
          <path d="M26 28h13" />
          <path d="M26 36h16" />
          <path d="M26 44h11" />
        </g>
        <g className="explore-build-hammer">
          <path className="fill-gold-500/20" d="M18 23l8-8 6 6-8 8Z" />
          <path d="M18 23l8-8 6 6-8 8" />
          <path d="M27 26l17 17" />
          <path d="M39 45l7-7" />
        </g>
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
          d="M13 49c12-16 23-8 18-23-2-6 8-12 20-7"
        />
        <g className="explore-footstep-one">
          <path className="fill-cream-50" d="M20 41c4-2 8 1 8 5 0 5-7 7-10 3-2-3-1-6 2-8Z" />
          <path d="M20 41c4-2 8 1 8 5 0 5-7 7-10 3-2-3-1-6 2-8Z" />
        </g>
        <g className="explore-footstep-two">
          <path className="fill-cream-50" d="M38 20c4-2 8 1 8 5 0 5-7 7-10 3-2-3-1-6 2-8Z" />
          <path d="M38 20c4-2 8 1 8 5 0 5-7 7-10 3-2-3-1-6 2-8Z" />
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
