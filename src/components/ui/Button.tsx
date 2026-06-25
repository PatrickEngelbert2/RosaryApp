import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
};

export function Button({ children, href, variant = "primary" }: ButtonProps) {
  const classes =
    variant === "primary"
      ? "bg-blue-900 text-white hover:bg-blue-800"
      : "border border-blue-900/20 bg-white text-blue-900 hover:border-blue-800";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md px-5 py-3 text-base font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 focus:ring-offset-cream-50 ${classes}`}
    >
      {children}
    </Link>
  );
}
