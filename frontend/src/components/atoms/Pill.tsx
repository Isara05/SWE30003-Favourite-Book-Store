import type { ReactNode } from "react";

// Renders the pill section.
export function Pill({ children }: { children: ReactNode }) {
  return <span className="pill">{children}</span>;
}
