import { CardSetEditor } from "@/components/cards/CardSetEditor";

export default function CardsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Guide Cards
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          Create printable rosary walk cards
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Build front/back cards for leaders and participants. Choose only the number of cards you
          need so you do not waste ink or paper.
        </p>
      </header>
      <CardSetEditor />
    </div>
  );
}
