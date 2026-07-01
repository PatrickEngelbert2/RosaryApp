import type { Metadata } from "next";
import Link from "next/link";
import {
  beginnerFaqs,
  beginnerPageIntro,
  beginnerPageSections,
  beginnerStartLinks,
  rosaryStructureParts,
} from "@/content/beginner-rosary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "What is the Rosary?",
  description:
    "A simple beginner-friendly explanation of the Rosary, how Catholics pray it, and how to follow along even if you are new.",
};

export default function BeginnerRosaryPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          New to the Rosary?
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-blue-900 sm:text-5xl">
          {beginnerPageIntro.title}
        </h1>
        <p className="mt-4 text-xl leading-8 text-slate-700">
          {beginnerPageIntro.subtitle}
        </p>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          {beginnerPageIntro.body}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button href="/pray/custom">Pray with guidance</Button>
          <Button href="/builder" variant="secondary">
            Build a simple guide
          </Button>
        </div>
      </header>

      <nav
        aria-label="What is the Rosary page sections"
        className="mt-10 rounded-xl border border-blue-900/10 bg-white/80 p-4"
      >
        <ul className="grid gap-2 text-sm font-semibold text-blue-900 sm:grid-cols-2">
          {beginnerPageSections.map((section) => (
            <li key={section.id}>
              <Link
                href={`#${section.id}`}
                className="interactive-link inline-flex min-h-10 items-center rounded-md px-2 underline"
              >
                {section.title}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="#parts"
              className="interactive-link inline-flex min-h-10 items-center rounded-md px-2 underline"
            >
              Learn the parts
            </Link>
          </li>
          <li>
            <Link
              href="#faq"
              className="interactive-link inline-flex min-h-10 items-center rounded-md px-2 underline"
            >
              Beginner FAQ
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-10 grid gap-5">
        {beginnerPageSections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <Card>
              <h2 className="text-2xl font-bold text-blue-900">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-lg leading-8 text-slate-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Card>
          </section>
        ))}
      </div>

      <section id="parts" className="mt-12 scroll-mt-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            Learn the parts
          </p>
          <h2 className="mt-3 text-3xl font-bold text-blue-900">
            A simple Rosary structure
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            You can think of the Rosary as a path. The beads help mark where
            you are, and this site can guide the same order from your phone.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rosaryStructureParts.map((part) => (
            <Card key={part.title} className="h-full">
              <h3 className="text-xl font-semibold text-blue-900">
                {part.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-700">{part.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="mt-12 scroll-mt-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            Beginner FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold text-blue-900">
            Common first questions
          </h2>
        </div>
        <div className="mt-6 grid gap-3">
          {beginnerFaqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-lg border border-blue-900/10 bg-white p-5 shadow-sm"
            >
              <summary className="cursor-pointer text-lg font-semibold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50">
                {faq.question}
              </summary>
              <p className="mt-3 leading-7 text-slate-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="start-here" className="mt-12 scroll-mt-24">
        <div className="rounded-2xl border border-gold-500/20 bg-cream-100/70 p-5 sm:p-6 lg:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
              Start here
            </p>
            <h2 className="mt-3 text-3xl font-bold text-blue-900">
              Begin without memorizing everything first
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              The Rosary is learned by praying it. Choose the next step that
              fits where you are today.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {beginnerStartLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100"
              >
                <Card className="interactive-card-link h-full bg-white/90">
                  <h3 className="text-xl font-semibold text-blue-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-700">{item.body}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
