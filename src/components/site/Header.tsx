import Link from "next/link";
import { Navigation } from "@/components/site/Navigation";

export function Header() {
  return (
    <header className="border-b border-blue-900/10 bg-cream-50/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-blue-900">
          Catholic Rosary Walks
        </Link>
        <Navigation />
      </div>
    </header>
  );
}
