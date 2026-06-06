import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

// Renders the button section.
export function Button({ children, variant = "primary", className = "", ...rest }: ButtonProps) {
  const classes = variant === "secondary" ? "btn secondary" : "btn";
  return (
    <button className={`${classes} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
