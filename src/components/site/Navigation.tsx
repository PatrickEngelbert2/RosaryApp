import Link from "next/link";

const navItems = [
  { href: "/pray/custom", label: "Pray" },
  { href: "/builder", label: "Build a Guide" },
  { href: "/cards", label: "Guide Cards" },
  { href: "/lead", label: "Lead a Walk" },
  { href: "/prayers", label: "Prayers" },
  { href: "/resources", label: "Resources" },
];

export function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <ul className="flex flex-wrap gap-x-2 gap-y-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex rounded-full px-3 py-1.5 text-sm font-medium text-blue-900 hover:bg-white hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
