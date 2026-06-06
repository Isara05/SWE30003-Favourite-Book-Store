import type { ReactNode } from "react";

// Renders the card section.
export function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}
