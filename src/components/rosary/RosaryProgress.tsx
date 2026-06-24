type RosaryProgressProps = {
  completedSteps: number;
  totalSteps: number;
};

export function RosaryProgress({ completedSteps, totalSteps }: RosaryProgressProps) {
  const value = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  return (
    <section aria-label="Rosary progress" className="mt-5">
      <div className="flex items-center justify-between text-sm font-medium text-slate-700">
        <span>
          Step {completedSteps} of {totalSteps}
        </span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-900/10">
        <div className="h-full rounded-full bg-blue-900" style={{ width: `${value}%` }} />
      </div>
    </section>
  );
}
