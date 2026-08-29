const accentClass = {
  neutral: "text-slate-500",
  positive: "text-emerald-600",
  warning: "text-amber-600",
} as const;

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: keyof typeof accentClass;
}

export default function StatCard({ label, value, hint, accent = "neutral" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className={`mt-1 text-xs font-medium ${accentClass[accent]}`}>{hint}</p>}
    </div>
  );
}
