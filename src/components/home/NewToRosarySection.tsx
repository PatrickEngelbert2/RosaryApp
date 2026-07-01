import Link from "next/link";
import { beginnerHomeSection } from "@/content/beginner-rosary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type NewToRosarySectionProps = {
  className?: string;
};

export function NewToRosarySection({ className = "" }: NewToRosarySectionProps) {
  return (
    <section
      aria-labelledby="new-to-rosary"
      className={`mb-12 rounded-2xl border border-gold-500/20 bg-cream-100/70 p-5 shadow-sm sm:p-6 lg:mb-14 lg:p-8 ${className}`}
    >
      <div className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            {beginnerHomeSection.eyebrow}
          </p>
          <h2
            id="new-to-rosary"
            className="mt-3 text-3xl font-bold leading-tight text-blue-900 sm:text-4xl"
          >
            {beginnerHomeSection.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            {beginnerHomeSection.body}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {beginnerHomeSection.ctas.map((cta) => (
              <Button
                key={cta.href}
                href={cta.href}
                variant={cta.variant === "primary" ? "primary" : "secondary"}
              >
                {cta.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {beginnerHomeSection.paths.map((path) => (
            <Link
              key={path.title}
              href={path.href}
              className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100"
            >
              <Card className="interactive-card-link h-full bg-white/88">
                <h3 className="text-lg font-semibold text-blue-900">
                  {path.title}
                </h3>
                <p className="mt-2 leading-7 text-slate-700">{path.body}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
