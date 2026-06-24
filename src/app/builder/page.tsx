import { RosaryBuilder } from "@/components/rosary/RosaryBuilder";

export default function BuilderPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Build My Rosary
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          Create the way your group prays the Rosary
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          This builder lets you create the way your group prays the Rosary. Save
          your version, follow it during a walk, or turn it into printable guide cards.
        </p>
      </header>
      <RosaryBuilder />
    </div>
  );
}
