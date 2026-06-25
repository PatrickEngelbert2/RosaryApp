import { Card } from "@/components/ui/Card";
import type { RenderedRosaryStep } from "@/lib/rosary/types";

type PrayerStepCardProps = {
  step: RenderedRosaryStep;
  stepNumber: number;
};

export function PrayerStepCard({ step, stepNumber }: PrayerStepCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
          {stepNumber}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            {step.type === "prayer-group" ? "Prayer" : step.type.replace("-", " ")}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-900">
            {step.prayer && step.repeatCount && step.repeatCount > 1
              ? step.prayer.title
              : step.title}
            {step.repeatCount && step.repeatCount > 1 ? (
              <span className="ml-2 rounded-full bg-cream-100 px-2 py-1 text-sm">
                x {step.repeatCount}
              </span>
            ) : null}
          </h2>
          {step.description ? (
            <p className="mt-2 text-base leading-7 text-slate-700">{step.description}</p>
          ) : null}
          {step.mystery ? (
            <div className="mt-4 text-lg leading-8 text-slate-800">
              {step.mystery.scriptureReference ? <p>{step.mystery.scriptureReference}</p> : null}
              {step.mystery.fruitOfMystery ? <p>Fruit: {step.mystery.fruitOfMystery}</p> : null}
            </div>
          ) : null}
          {step.text ? (
            <p className="mt-4 whitespace-pre-line text-xl leading-9 text-slate-800">
              {step.text}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
