"use client";

import { useEffect, useState } from "react";
import { getTimeRemaining, type TimeRemaining } from "@/lib/countdown";

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="relative flex w-16 flex-col items-center gap-1 rounded-t-full rounded-b-xl border border-gold-300/70 bg-maroon-600/40 px-2 pb-3 pt-5 shadow-[inset_0_1px_0_rgba(228,199,122,0.4)] sm:w-20">
      <span className="font-display text-2xl font-bold tabular-nums text-gold-100 sm:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-widest text-cream-200/80 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function FestivalCountdown({
  targetDate,
  targetLabel,
}: {
  targetDate: string;
  targetLabel: string;
}) {
  const [remaining, setRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    setRemaining(getTimeRemaining(targetDate));
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Render a stable placeholder until the client clock kicks in, so the
  // server-rendered markup and first client render match.
  const display = remaining ?? { days: 0, hours: 0, minutes: 0, seconds: 0, hasPassed: false };

  if (remaining?.hasPassed) {
    return (
      <p className="font-display text-lg font-semibold text-gold-100">
        {targetLabel} is here — Ganapati Bappa Morya! 🙏
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cream-200/80">
        Counting down to {targetLabel}
      </p>
      <div className="flex items-end gap-2 sm:gap-3" suppressHydrationWarning>
        <CountdownUnit value={display.days} label="Days" />
        <CountdownUnit value={display.hours} label="Hrs" />
        <CountdownUnit value={display.minutes} label="Min" />
        <CountdownUnit value={display.seconds} label="Sec" />
      </div>
    </div>
  );
}
