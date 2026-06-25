import { LeaderGuideCard } from "@/components/rosary/LeaderGuideCard";
import { leaderGuides } from "@/content/leader-guides";

export default function LeadPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Lead a Walk
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          Practical guidance for leading outdoors
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Keep the group prayerful, audible, and unhurried. These notes are
          designed for parish sidewalks, school grounds, retreat paths, or parks.
        </p>
      </header>

      <div className="grid gap-5">
        {leaderGuides.map((guide) => (
          <LeaderGuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
}
