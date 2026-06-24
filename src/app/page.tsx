import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const primaryLinks = [
  {
    href: "/builder",
    title: "Build My Rosary",
    description: "Choose a template, closing prayers, leader notes, and custom guidance.",
  },
  {
    href: "/pray/custom",
    title: "Pray My Rosary",
    description: "Follow your saved Rosary style with collapsible, readable prayers.",
  },
  {
    href: "/cards",
    title: "Guide Cards",
    description: "Create front/back printable cards for leaders and participants.",
  },
  {
    href: "/pray",
    title: "Pray the Rosary",
    description: "Follow a clear step-by-step Rosary flow with readable prayer text.",
  },
  {
    href: "/lead",
    title: "Lead a Rosary Walk",
    description: "Use practical guidance for opening, pacing, transitions, and closing.",
  },
  {
    href: "/prayers",
    title: "Prayers",
    description: "Read the core prayers used throughout the Rosary.",
  },
  {
    href: "/mysteries",
    title: "Mysteries",
    description: "Browse the Joyful, Luminous, Sorrowful, and Glorious Mysteries.",
  },
  {
    href: "/printables",
    title: "Printables",
    description: "Preview planned printable guides and handouts for future PDFs.",
  },
  {
    href: "/resources",
    title: "Resources",
    description: "Find simple beginner-friendly help for praying and walking together.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 py-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            Catholic Rosary Walks
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-blue-900 sm:text-5xl">
            A calm guide for praying the Rosary, alone or walking with others.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Prepare a group rosary walk with less friction. Build your preferred
            prayer order, follow it on your phone, and print simple guide cards
            for leaders and participants.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/builder">Build my Rosary</Button>
            <Button href="/pray/custom" variant="secondary">
              Pray my Rosary
            </Button>
          </div>
        </div>
        <Card className="bg-white/80">
          <h2 className="text-xl font-semibold text-blue-900">Today&apos;s rhythm</h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            Begin with the Sign of the Cross, move bead by bead through the
            prayers and mysteries, and close together in peace.
          </p>
          <dl className="mt-6 grid gap-4 text-sm text-slate-700">
            <div>
              <dt className="font-semibold text-blue-900">Website-first</dt>
              <dd>Fast, readable pages using static local content.</dd>
            </div>
            <div>
              <dt className="font-semibold text-blue-900">Walk-ready</dt>
              <dd>Guidance that works for a parish path, sidewalk, or park.</dd>
            </div>
          </dl>
        </Card>
      </section>

      <section aria-labelledby="toolkit-flow" className="py-8">
        <h2 id="toolkit-flow" className="text-2xl font-bold text-blue-900">
          Rosary Walk Toolkit
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
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

      <section aria-labelledby="site-sections" className="py-8">
        <h2 id="site-sections" className="text-2xl font-bold text-blue-900">
          Explore the site
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {primaryLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group block">
              <Card className="h-full transition group-hover:border-blue-800 group-hover:shadow-md">
                <h3 className="text-lg font-semibold text-blue-900">{item.title}</h3>
                <p className="mt-2 leading-7 text-slate-700">{item.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
