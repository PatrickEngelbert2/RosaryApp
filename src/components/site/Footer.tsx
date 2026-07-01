import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const links = [
    { href: "/learn/rosary", label: "New to the Rosary?" },
    { href: "/pray/custom", label: "Pray" },
    { href: "/builder", label: "Build a Guide" },
    { href: "/cards", label: "Guide Cards" },
    { href: "/lead", label: "Lead a Walk" },
    { href: "/prayers", label: "Prayers" },
    { href: "/resources", label: "Resources" },
  ];

  return (
    <footer className="mt-12 border-t border-blue-900/10 bg-cream-100/60">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 text-sm leading-6 text-slate-700 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/faviconRiver.svg"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg bg-blue-900 object-contain"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold text-blue-900">
              Walk the Rosary
            </h2>
          </div>
          <p className="mt-3 max-w-md">
            A Catholic resource for praying the Rosary, leading rosary walks,
            and printing simple guide cards.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-base font-semibold text-blue-900">Site</h2>
          <ul className="mt-3 grid gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link className="interactive-link font-medium" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-base font-semibold text-blue-900">Contact</h2>
          <p className="mt-3">
            Questions, corrections, or parish use:
            <br />
            <a className="interactive-link font-medium text-blue-900 underline" href="mailto:patrickengelbert2@gmail.com">
              patrickengelbert2@gmail.com
            </a>
          </p>
          <p className="mt-4">
            Created by{" "}
            <a className="interactive-link font-medium text-blue-900 underline" href="https://patrickengelbert.com">
              patrickengelbert.com
            </a>
          </p>
          <p className="mt-4 text-xs leading-5">
            Use Scripture excerpts and copyrighted prayer resources only with
            proper permission.
          </p>
        </div>
      </div>
    </footer>
  );
}
