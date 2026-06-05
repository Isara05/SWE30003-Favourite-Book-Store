import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// Renders the input section.
export function Input({ label, id, className = "", ...rest }: InputProps) {
  return (
    <label className="stack" htmlFor={id}>
      {label ? <span className="label">{label}</span> : null}
      <input id={id} className={`input ${className}`.trim()} {...rest} />
    </label>
  );
}
