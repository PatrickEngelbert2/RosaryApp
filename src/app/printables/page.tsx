import { Card } from "@/components/ui/Card";
import { printables } from "@/content/printables";

export default function PrintablesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Printables
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          Printable resources
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Placeholder metadata for printable PDFs. Actual files can later be
          added under <code className="rounded bg-cream-100 px-1">/public/printables</code>.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {printables.map((printable) => (
          <Card key={printable.id}>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
              {printable.format}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-blue-900">{printable.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{printable.description}</p>
            <dl className="mt-5 grid gap-2 text-sm text-slate-700">
              <div>
                <dt className="font-semibold text-blue-900">Audience</dt>
                <dd>{printable.audience}</dd>
              </div>
              <div>
                <dt className="font-semibold text-blue-900">Future path</dt>
                <dd>{printable.path}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}
