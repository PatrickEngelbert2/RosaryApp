import { buildRosaryFlow, getMysterySetForConfig } from "@/lib/rosary/buildRosaryFlow";
import type { RenderedRosaryStep, UserRosaryConfig } from "@/lib/rosary/types";

type RosaryFlowPreviewProps = {
  config: UserRosaryConfig;
  compact?: boolean;
};

export function RosaryFlowPreview({ config, compact = false }: RosaryFlowPreviewProps) {
  const flow = buildRosaryFlow(config);
  const mysterySet = getMysterySetForConfig(config);
  const visibleFlow = compact ? flow.slice(0, 24) : flow;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-blue-900/10 bg-cream-100 px-4 py-3">
        <p className="text-sm font-semibold text-blue-900">
          {config.mysterySetMode === "today"
            ? `Using today's mysteries: ${mysterySet.title}`
            : `Using selected mysteries: ${mysterySet.title}`}
        </p>
      </div>
      {visibleFlow.map((step, index) => (
        <PreviewStep key={step.id} step={step} number={index + 1} />
      ))}
      {compact && flow.length > visibleFlow.length ? (
        <p className="rounded-md bg-cream-100 px-4 py-3 text-sm font-medium text-slate-700">
          Showing the first {visibleFlow.length} of {flow.length} steps.
        </p>
      ) : null}
    </div>
  );
}

function PreviewStep({ step, number }: { step: RenderedRosaryStep; number: number }) {
  if (step.type === "section-heading") {
    return (
      <div className="border-b border-blue-900/10 pb-2 pt-2">
        <h3 className="font-semibold text-blue-900">{step.title}</h3>
      </div>
    );
  }

  const label = step.leaderOnly ? "Leader note" : getStepLabel(step.type);
  const border = step.leaderOnly ? "border-gold-500/50 bg-amber-50" : "border-blue-900/10 bg-white";

  return (
    <article className={`rounded-lg border p-4 shadow-sm ${border}`}>
      <div className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
          {number}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{label}</p>
          <h3 className="mt-1 font-semibold text-blue-900">
            {step.prayer && step.repeatCount && step.repeatCount > 1
              ? step.prayer.title
              : step.title}
            {step.repeatCount && step.repeatCount > 1 ? (
              <span className="ml-2 rounded-full bg-cream-100 px-2 py-0.5 text-xs">
                x {step.repeatCount}
              </span>
            ) : null}
          </h3>
          {step.prayer ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">{step.prayer.incipit}</p>
          ) : null}
          {step.mystery ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {step.mystery.setName}
              {step.mystery.fruitOfMystery ? ` - Fruit: ${step.mystery.fruitOfMystery}` : ""}
            </p>
          ) : null}
          {step.text && !step.prayer ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">{step.text}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function getStepLabel(type: RenderedRosaryStep["type"]): string {
  if (type === "prayer-group" || type === "prayer") {
    return "Prayer";
  }

  if (type === "leader-note") {
    return "Leader note";
  }

  if (type === "custom-text") {
    return "Text";
  }

  return type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ");
}
