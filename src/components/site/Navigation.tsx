import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/pray", label: "Pray" },
  { href: "/pray/custom", label: "Pray My Rosary" },
  { href: "/builder", label: "Build My Rosary" },
  { href: "/lead", label: "Lead a Walk" },
  { href: "/cards", label: "Guide Cards" },
  { href: "/printables", label: "Printables" },
  { href: "/resources", label: "Resources" },
];

export function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <ul className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex rounded-full px-3 py-2 text-sm font-medium text-blue-900 hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 focus:ring-offset-cream-50"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
