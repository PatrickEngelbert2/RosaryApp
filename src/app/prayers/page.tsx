import { Card } from "@/components/ui/Card";
import { prayers } from "@/content/prayers";

export default function PrayersPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Prayers
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          Core Rosary prayers
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          These prayers are kept in structured content so Rosary flows can reuse
          them without hardcoding long text into pages.
        </p>
      </header>

      <div className="grid gap-5">
        {prayers.map((prayer) => (
          <Card key={prayer.id}>
            <h2 className="text-2xl font-semibold text-blue-900">{prayer.title}</h2>
            <p className="mt-4 whitespace-pre-line text-xl leading-9 text-slate-800">
              {prayer.text}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
