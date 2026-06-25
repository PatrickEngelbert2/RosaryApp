import { Logo } from "@/components/site/Logo";
import { Navigation } from "@/components/site/Navigation";

export function Header() {
  return (
    <header className="border-b border-blue-900/10 bg-cream-50/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6 md:py-4 lg:px-8">
        <Logo />
        <Navigation />
      </div>
    </header>
  );
}
