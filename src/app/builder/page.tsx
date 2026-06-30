import { EasyGuideBuilder } from "@/components/rosary/EasyGuideBuilder";
import { RosaryBuilder } from "@/components/rosary/RosaryBuilder";

export default function BuilderPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Build My Rosary
        </p>
        <h1 className="mt-3 text-3xl font-bold text-blue-900 sm:text-4xl">
          Build a Rosary guide without getting lost
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Start with the Quick Builder if you want a simple question-based path. Use the
          Custom Builder when you want detailed control without losing the thread.
        </p>
      </header>
      <EasyGuideBuilder />
      <section id="custom-builder" className="mb-6 rounded-xl border border-blue-900/10 bg-cream-100 px-5 py-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Want detailed control?
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-blue-900">
          Continue with the Custom Builder
        </h2>
        <p className="mt-2 leading-7 text-slate-700">
          Choose mysteries, repeated-prayer behavior, leader notes, closing prayers, saint
          invocations, prayer languages, custom guidance, preview, save, and backup options.
        </p>
      </section>
      <RosaryBuilder />
    </div>
  );
}
