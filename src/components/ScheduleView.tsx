"use client";

import { useMemo, useState } from "react";
import type { EventCategory, ScheduleEvent } from "@/types";
import EventCard from "@/components/EventCard";
import CategoryFilter from "@/components/CategoryFilter";
import { SCHEDULE_FILTERS } from "@/config/categories";
import { groupEventsByDate, sortEventsByTime } from "@/lib/schedule";
import { formatDate } from "@/lib/utils";

type FilterValue = EventCategory | "all";

export default function ScheduleView({ events }: { events: ScheduleEvent[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredEvents = useMemo(
    () => (filter === "all" ? events : events.filter((event) => event.category === filter)),
    [events, filter],
  );

  const groupedByDate = useMemo(() => groupEventsByDate(filteredEvents), [filteredEvents]);
  const dates = useMemo(() => Object.keys(groupedByDate).sort(), [groupedByDate]);

  return (
    <div>
      <CategoryFilter options={SCHEDULE_FILTERS} value={filter} onChange={setFilter} />

      {dates.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-gold-300 bg-cream-50 p-8 text-center text-ink/60">
          No events match this filter.
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {dates.map((date) => (
            <section key={date}>
              <h2 className="mb-4 font-display text-xl font-bold text-maroon-500">
                {formatDate(date)}
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {sortEventsByTime(groupedByDate[date]).map((event) => (
                  <EventCard key={event.id} event={event} emphasize={event.highlighted} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
