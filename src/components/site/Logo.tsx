import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link
      href="/"
      className="interactive-brand inline-flex items-center gap-3 rounded-md text-xl font-bold text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
      aria-label="Walk the Rosary home"
    >
      <span className="brand-mark flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-blue-900" aria-hidden="true">
        <Image
          src="/faviconRiver.svg"
          alt=""
          className="h-9 w-9 object-contain"
          width={36}
          height={36}
        />
      </span>
      <span className="brand-title">Walk the Rosary</span>
    </Link>
  );
}
