import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="interactive-brand inline-flex items-center gap-3 rounded-md text-xl font-bold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
      aria-label="Walk the Rosary home"
    >
      <span className="brand-mark flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900" aria-hidden="true">
        <svg viewBox="0 0 64 64" className="h-7 w-7">
          <path
            d="M17 39c7-16 20-20 32-15"
            fill="none"
            stroke="#fffaf0"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="18" cy="39" r="3.4" fill="#fffaf0" />
          <circle cx="25" cy="31" r="3.4" fill="#fffaf0" />
          <circle cx="34" cy="26" r="3.4" fill="#fffaf0" />
          <circle cx="44" cy="24" r="3.4" fill="#fffaf0" />
          <path
            d="M45 35v15M37.5 42.5h15"
            stroke="#fffaf0"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="brand-title">Walk the Rosary</span>
    </Link>
  );
}
