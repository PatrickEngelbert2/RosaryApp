import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getTodaysMysteries } from "@/lib/rosary/getTodaysMysteries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: "Walk the Rosary | Pray, Lead, and Print Rosary Guides",
  },
  description:
    "Walk the Rosary helps individuals and groups pray the Rosary, lead rosary walks, customize prayer guides, and print simple guide cards.",
};

const primaryLinks = [
  {
    href: "/pray/custom",
    title: "Pray",
    description: "Follow a saved guide with large, readable prayer text.",
    icon: "beads",
  },
  {
    href: "/builder",
    title: "Build a Guide",
    description: "Choose mysteries, closing prayers, leader notes, and custom guidance.",
    icon: "guide",
  },
  {
    href: "/cards",
    title: "Guide Cards",
    description: "Create front/back printable cards for leaders and participants.",
    icon: "cards",
  },
  {
    href: "/lead",
    title: "Lead a Walk",
    description: "Use practical guidance for opening, pacing, transitions, and closing.",
    icon: "walk",
  },
  {
    href: "/prayers",
    title: "Prayers",
    description: "Read the core prayers used throughout the Rosary.",
    icon: "prayer",
  },
  {
    href: "/resources",
    title: "Resources",
    description: "Find simple beginner-friendly help for praying and walking together.",
    icon: "resources",
  },
];

type IconName = (typeof primaryLinks)[number]["icon"];

function FeatureIcon({ name }: { name: IconName }) {
  const commonProps = {
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  const paths: Record<IconName, ReactNode> = {
    beads: (
      <>
        <circle cx="7" cy="8" r="2" />
        <circle cx="12" cy="6" r="2" />
        <circle cx="17" cy="8" r="2" />
        <circle cx="9" cy="14" r="2" />
        <circle cx="15" cy="14" r="2" />
        <path d="M12 16v5" />
        <path d="M10 19h4" />
      </>
    ),
    guide: (
      <>
        <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z" />
        <path d="M9 8h4" />
        <path d="M9 12h6" />
        <path d="M9 16h5" />
      </>
    ),
    cards: (
      <>
        <path d="M7 5h10a2 2 0 0 1 2 2v10" />
        <path d="M5 7h10a2 2 0 0 1 2 2v10H7a2 2 0 0 1-2-2Z" />
        <path d="M9 12h4" />
        <path d="M9 15h3" />
      </>
    ),
    walk: (
      <>
        <circle cx="12" cy="5" r="2" />
        <path d="M10 22l1.5-6" />
        <path d="M17 22l-3-7" />
        <path d="M9 10l3-2 3 3" />
        <path d="M8 14l3-2" />
      </>
    ),
    prayer: (
      <>
        <path d="M8 11V6a2 2 0 0 1 4 0v5" />
        <path d="M12 11V5a2 2 0 0 1 4 0v9" />
        <path d="M8 11 6.5 9.5a2 2 0 0 0-3 2.6L9 20h7a4 4 0 0 0 4-4v-5" />
      </>
    ),
    resources: (
      <>
        <path d="M6 5h10a2 2 0 0 1 2 2v12H8a2 2 0 0 1-2-2Z" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
        <path d="M9 17h3" />
      </>
    ),
  };

  return (
    <span className="card-link-icon flex h-11 w-11 items-center justify-center rounded-full bg-blue-900/5 text-blue-900 transition">
      <svg aria-hidden="true" {...commonProps}>
        {paths[name]}
      </svg>
    </span>
  );
}

export default function HomePage() {
  const today = new Date();
  const todaysMysteries = getTodaysMysteries(today);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(today);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <section className="grid gap-8 pb-12 md:grid-cols-[1.15fr_0.85fr] md:items-start lg:gap-12 lg:pb-14">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            Walk the Rosary
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-blue-900 sm:text-5xl">
            Walk the Rosary with confidence.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Build a rosary guide, pray from your phone, and print simple cards
            for your group.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/pray/custom">Pray Now</Button>
            <Button href="/builder" variant="secondary">
              Build a Guide
            </Button>
          </div>
        </div>
        <Card className="bg-white/80">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            {formattedDate}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-blue-900">
            Today&apos;s Rosary
          </h2>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {todaysMysteries.title}
          </p>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Pray the mysteries commonly assigned for today, or use them as the
            starting point for a group walk guide.
          </p>
          <ol className="mt-5 space-y-2 text-sm text-slate-700">
            {todaysMysteries.mysteries.slice(0, 5).map((mystery, index) => (
              <li key={mystery.id} className="flex gap-2">
                <span className="font-semibold text-blue-900">
                  {index + 1}.
                </span>
                <span>{mystery.title}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <Button href="/pray/custom">Start Praying</Button>
            <Button href="/builder" variant="secondary">
              Build a Guide
            </Button>
          </div>
        </Card>
      </section>

      <section aria-labelledby="toolkit-flow" className="pb-12 lg:pb-14">
        <h2 id="toolkit-flow" className="text-2xl font-bold text-blue-900">
          Pray, lead, and print
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Build your Rosary", "Start with a standard or leader template and save your group's preferred prayer order."],
            ["2", "Pray your saved version", "Use large readable text and collapsible prayers while walking or leading."],
            ["3", "Print guide cards", "Choose the exact number of front/back cards needed for leaders and participants."],
          ].map(([number, title, body]) => (
            <Card key={number}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 font-bold text-white">
                {number}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-blue-900">{title}</h3>
              <p className="mt-2 leading-7 text-slate-700">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="site-sections" className="pb-6">
        <h2 id="site-sections" className="text-2xl font-bold text-blue-900">
          Explore the site
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {primaryLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50">
              <Card className="interactive-card-link h-full">
                <FeatureIcon name={item.icon} />
                <h3 className="mt-4 text-lg font-semibold text-blue-900">
                  {item.title}
                </h3>
                <p className="mt-2 leading-7 text-slate-700">{item.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
