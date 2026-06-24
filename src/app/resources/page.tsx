import { Card } from "@/components/ui/Card";

const resources = [
  {
    title: "For first-time prayer",
    body: "Start slowly. It is fine to follow the words from the page, pause between prayers, and let the rhythm become familiar over time.",
  },
  {
    title: "For walking groups",
    body: "Choose a safe route, set a gentle pace, and ask one clear voice to lead while the group responds together.",
  },
  {
    title: "For families",
    body: "Consider praying one decade at a time. A short faithful beginning is better than rushing through the whole Rosary.",
  },
  {
    title: "For parishes",
    body: "Prepare a leader, a backup leader, and a simple printed handout so visitors can participate without feeling lost.",
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
          A few gentle notes for praying the Rosary with confidence and charity.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {resources.map((resource) => (
          <Card key={resource.title}>
            <h2 className="text-xl font-semibold text-blue-900">{resource.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{resource.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
