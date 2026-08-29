import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EventCategory, ScheduleEvent } from "@/types";

const eventCategories: EventCategory[] = [
  "pooja",
  "cultural",
  "food",
  "kids",
  "celebration",
  "other",
];

function toEventCategory(value: string): EventCategory {
  return eventCategories.includes(value as EventCategory)
    ? (value as EventCategory)
    : "other";
}

export async function getFestivalSchedule(
  festivalId: string,
): Promise<ScheduleEvent[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("festival_events")
    .select(
      "id, event_date, title, description, start_time, end_time, venue, category, highlighted",
    )
    .eq("festival_id", festivalId)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Unable to load festival schedule: ${error.message}`);
  }

  return (data ?? []).map((event) => ({
    id: event.id,
    date: event.event_date,
    title: event.title,
    description: event.description ?? "",
    startTime: event.start_time.slice(0, 5),
    endTime: event.end_time.slice(0, 5),
    venue: event.venue ?? "",
    category: toEventCategory(event.category),
    highlighted: event.highlighted,
  }));
}
