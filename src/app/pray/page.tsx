import { MysterySelector } from "@/components/rosary/MysterySelector";
import { PrayerStepCard } from "@/components/rosary/PrayerStepCard";
import { RosaryProgress } from "@/components/rosary/RosaryProgress";
import { joyfulMysteries } from "@/content/mysteries";
import { buildRosaryFlow } from "@/lib/rosary/buildRosaryFlow";
import { getTodaysMysteries } from "@/lib/rosary/getTodaysMysteries";

export default function PrayPage() {
  const todaysMysteries = getTodaysMysteries();
  const flow = buildRosaryFlow({ mysterySet: joyfulMysteries });

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Pray the Rosary
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          Pray a simple Rosary
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Follow the prayers in order with readable text and a steady rhythm.
          For your own saved guide, use Pray My Rosary.
        </p>
      </header>

      <MysterySelector currentSet={joyfulMysteries} todaysSet={todaysMysteries} />
      <RosaryProgress completedSteps={0} totalSteps={flow.length} />

      <ol className="mt-8 space-y-5">
        {flow.map((step, index) => (
          <li key={step.id}>
            <PrayerStepCard step={step} stepNumber={index + 1} />
          </li>
        ))}
      </ol>
    </div>
  );
}
