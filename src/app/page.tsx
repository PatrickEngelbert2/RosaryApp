import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import {
  ExploreIcon,
  type ExploreIconName,
} from "@/components/site/icons/ExploreIcon";
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
    title: "Pray Now",
    description: "Follow the default Rosary or a saved guide with large, readable prayer text.",
    icon: "pray",
  },
  {
    href: "/builder",
    title: "Build a Guide",
    description: "Use the Easy Builder for a quick guide, or advanced settings for full control.",
    icon: "guide",
  },
  {
    href: "/cards",
    title: "Guide Cards",
    description: "Print small front/back cards so leaders and participants can follow along.",
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
] satisfies ReadonlyArray<{
  href: string;
  title: string;
  description: string;
  icon: ExploreIconName;
}>;

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
            Pray, lead, and print rosary guides.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Walk the Rosary helps you pray from your phone, build a simple guide for your group,
            and print cards for a rosary walk.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/builder">Start Easy Builder</Button>
            <Button href="/cards" variant="secondary">
              Print Guide Cards
            </Button>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            New here? Start with the Easy Builder. Already have a guide saved? Open Pray or Guide Cards.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Link className="interactive-link font-semibold text-blue-900 underline" href="/pray/custom">
              Pray now
            </Link>
            <Link className="interactive-link font-semibold text-blue-900 underline" href="/builder#advanced-builder">
              Advanced builder
            </Link>
          </div>
        </div>
        <Card className="bg-white/80">
          <div className="flex items-start gap-4">
            <Image
              src="/faviconRiver.svg"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-lg bg-blue-900 object-contain shadow-sm"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
                {formattedDate}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-blue-900">
                Today&apos;s Rosary
              </h2>
            </div>
          </div>
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {todaysMysteries.title}
          </p>
          <p className="mt-3 text-base leading-7 text-slate-700">
            These are the traditional mysteries for today. Use them for personal prayer or as a
            starting point for a group walk.
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
          Start here
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ["1", "Pray now", "Use the default Rosary immediately, or follow a saved guide once you have one."],
            ["2", "Build with help", "Answer a few simple questions and let Easy Builder make the guide."],
            ["3", "Print cards", "Choose a saved guide, card count, and card size, then print or save as PDF."],
            ["4", "Fine-tune later", "Use the advanced builder for exact prayers, Latin choices, notes, and structure."],
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
                <ExploreIcon name={item.icon} />
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
