import type { ReactNode } from "react";

export default function FormField({
  label,
  htmlFor,
  error,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`.trim()}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label} {required && <span className="text-maroon-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink/50">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-maroon-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Shared input styling so every field in the form looks consistent.
export function inputClass(hasError?: boolean): string {
  return `w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-maroon-400 focus:border-maroon-400 focus:ring-maroon-100"
      : "border-gold-300/70 focus:border-saffron-500 focus:ring-saffron-100"
  }`;
}
