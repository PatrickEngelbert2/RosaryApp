import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg border border-blue-900/10 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
