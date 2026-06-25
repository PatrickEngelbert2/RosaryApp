import { MysteryCard } from "@/components/rosary/MysteryCard";
import { mysterySets } from "@/content/mysteries";

export default function MysteriesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Mysteries
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          The Mysteries of the Rosary
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Each set invites meditation on the life of Jesus with Mary.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {mysterySets.map((set) => (
          <section key={set.id} aria-labelledby={`${set.id}-title`}>
            <h2 id={`${set.id}-title`} className="mb-4 text-2xl font-bold text-blue-900">
              {set.title}
            </h2>
            <div className="grid gap-4">
              {set.mysteries.map((mystery, index) => (
                <MysteryCard key={mystery.id} mystery={mystery} number={index + 1} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
