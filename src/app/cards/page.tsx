import { CardSetEditor } from "@/components/cards/CardSetEditor";

export default function CardsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Guide Cards
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          Guide Cards
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Choose a saved rosary guide, card size, and prayer text options for your group. The
          cards are generated from the prayers, mysteries, and options in the selected guide.
        </p>
      </header>
      <CardSetEditor />
    </div>
  );
}
