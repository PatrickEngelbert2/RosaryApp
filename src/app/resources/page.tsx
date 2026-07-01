import Link from "next/link";
import { beginnerResourceLink } from "@/content/beginner-rosary";
import { Card } from "@/components/ui/Card";

const resources = [
  beginnerResourceLink,
  {
    title: "How to pray the Rosary",
    body: "Start slowly. It is fine to follow the words from the page, pause between prayers, and let the rhythm become familiar over time.",
  },
  {
    title: "How to lead a Rosary walk",
    body: "Choose a safe route, set a gentle pace, and ask one clear voice to lead while the group responds together.",
  },
  {
    title: "Tips for guide cards",
    body: "Print enough cards for leaders and visitors. Use short prompts for people who know the prayers, and larger cards when beginners need fuller text.",
  },
  {
    title: "Beginner help",
    body: "If a full Rosary feels like too much, begin with one decade. A short faithful beginning is better than rushing.",
  },
  {
    title: "For parishes and groups",
    body: "Prepare a leader, a backup leader, a simple meeting point, and a clear invitation so visitors can participate without feeling lost.",
  },
  {
    title: "Catholic resources",
    body: "For parish schedules, confession times, and local events, check your parish or diocesan website. Keep Walk the Rosary focused on the prayer guide itself.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Resources
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          Simple guidance for beginning well
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Practical notes for praying, leading, printing, and helping beginners feel welcome.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {resources.map((resource) => (
          "href" in resource ? (
            <Link
              key={resource.title}
              href={resource.href}
              className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            >
              <Card className="interactive-card-link h-full">
                <h2 className="text-xl font-semibold text-blue-900">{resource.title}</h2>
                <p className="mt-3 leading-7 text-slate-700">{resource.body}</p>
              </Card>
            </Link>
          ) : (
            <Card key={resource.title}>
              <h2 className="text-xl font-semibold text-blue-900">{resource.title}</h2>
              <p className="mt-3 leading-7 text-slate-700">{resource.body}</p>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}
