import { Card } from "@/components/ui/Card";
import type { MysterySet } from "@/lib/rosary/types";

type MysterySelectorProps = {
  currentSet: MysterySet;
  todaysSet: MysterySet;
};

export function MysterySelector({ currentSet, todaysSet }: MysterySelectorProps) {
  return (
    <Card className="bg-white/80">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
        Mystery set
      </p>
      <h2 className="mt-2 text-xl font-semibold text-blue-900">{currentSet.title}</h2>
      <p className="mt-3 leading-7 text-slate-700">
        Today&apos;s traditional set is <strong>{todaysSet.title}</strong>. This page
        currently follows the {currentSet.title}.
      </p>
    </Card>
  );
}
