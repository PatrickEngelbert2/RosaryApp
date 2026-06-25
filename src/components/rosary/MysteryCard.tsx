import { Card } from "@/components/ui/Card";
import type { Mystery } from "@/lib/rosary/types";

type MysteryCardProps = {
  mystery: Mystery;
  number: number;
};

export function MysteryCard({ mystery, number }: MysteryCardProps) {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
        Mystery {number}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-blue-900">{mystery.title}</h3>
      <p className="mt-3 leading-7 text-slate-700">{mystery.description}</p>
      {mystery.scriptureReference ? (
        <p className="mt-4 text-sm font-medium text-slate-600">
          {mystery.scriptureReference}
        </p>
      ) : null}
    </Card>
  );
}
