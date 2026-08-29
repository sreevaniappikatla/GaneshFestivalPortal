"use client";

export interface CategoryFilterOption<T extends string> {
  label: string;
  value: T;
}

export default function CategoryFilter<T extends string>({
  options,
  value,
  onChange,
}: {
  options: CategoryFilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by category">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              active
                ? "border-saffron-600 bg-saffron-600 text-cream-50 shadow-sm"
                : "border-gold-300/70 bg-cream-50 text-ink/70 hover:border-saffron-400 hover:text-saffron-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
