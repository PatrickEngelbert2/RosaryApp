import { Card } from "@/components/ui/Card";
import type { LeaderGuide } from "@/lib/rosary/types";

type LeaderGuideCardProps = {
  guide: LeaderGuide;
};

export function LeaderGuideCard({ guide }: LeaderGuideCardProps) {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
        {guide.phase}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-blue-900">{guide.title}</h2>
      <p className="mt-3 leading-7 text-slate-700">{guide.summary}</p>
      <ul className="mt-5 space-y-3">
        {guide.steps.map((step) => (
          <li key={step} className="rounded-md bg-cream-50 px-4 py-3 leading-7 text-slate-800">
            {step}
          </li>
        ))}
      </ul>
    </Card>
  );
}
