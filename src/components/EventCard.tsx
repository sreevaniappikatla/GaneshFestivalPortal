import type { ScheduleEvent } from "@/types";
import { formatTimeRange } from "@/lib/schedule";
import { CATEGORY_META } from "@/config/categories";

export default function EventCard({
  event,
  emphasize = false,
  statusLabel,
  showDescription = true,
  muted = false,
}: {
  event: ScheduleEvent;
  /** Draws attention to this card (festival highlight, or "next up" on /today). */
  emphasize?: boolean;
  /** Optional small pill shown above the card, e.g. "Up next", "Completed". */
  statusLabel?: string;
  /** Whether to render the event description. Off by default on /today. */
  showDescription?: boolean;
  /** Dims the card — used for events that have already concluded on /today. */
  muted?: boolean;
}) {
  const meta = CATEGORY_META[event.category];

  return (
    <div
      className={`relative flex h-full flex-col gap-2 rounded-2xl border p-5 shadow-card transition ${
        emphasize
          ? "border-gold-500 bg-gradient-to-br from-saffron-50 to-cream-50 ring-2 ring-gold-300"
          : "border-gold-300/50 bg-cream-50"
      } ${muted ? "opacity-60" : ""}`}
    >
      {statusLabel && (
        <span className="absolute -top-3 left-4 rounded-full bg-maroon-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-100 shadow-sm">
          {statusLabel}
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-maroon-500 sm:text-lg">
          {event.title}
        </h3>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.badgeClass}`}
        >
          <span aria-hidden="true">{meta.icon}</span>
          {meta.label}
        </span>
      </div>

      {showDescription && event.description && (
        <p className="text-sm leading-relaxed text-ink/70">{event.description}</p>
      )}

      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/70">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true">🕒</span>
          {formatTimeRange(event.startTime, event.endTime)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true">📍</span>
          {event.venue}
        </span>
      </div>
    </div>
  );
}
