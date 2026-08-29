import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EventCategory } from "@/types";

export interface AdminScheduleEvent {
  id: string;
  festivalId: string;
  date: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  category: EventCategory;
  highlighted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const eventCategories: EventCategory[] = [
  "pooja",
  "cultural",
  "food",
  "kids",
  "celebration",
  "other",
];

function normalizeCategory(value: string | null | undefined): EventCategory {
  return value && eventCategories.includes(value as EventCategory)
    ? (value as EventCategory)
    : "other";
}

function mapEvent(row: any): AdminScheduleEvent {
  return {
    id: row.id,
    festivalId: row.festival_id,
    date: row.event_date,
    title: row.title,
    description: row.description ?? "",
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    venue: row.venue ?? "",
    category: normalizeCategory(row.category),
    highlighted: Boolean(row.highlighted),
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminScheduleEvents(
  festivalId: string,
): Promise<AdminScheduleEvent[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("festival_events")
    .select(
      "id, festival_id, event_date, title, description, start_time, end_time, venue, category, highlighted, is_active, created_at, updated_at",
    )
    .eq("festival_id", festivalId)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Unable to load festival schedule: ${error.message}`);
  }

  return (data ?? []).map(mapEvent);
}

export async function createAdminScheduleEvent(
  festivalId: string,
  input: {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
    category: EventCategory;
    highlighted?: boolean;
    isActive?: boolean;
  },
): Promise<AdminScheduleEvent> {
  const { data, error } = await getSupabaseAdminClient()
    .from("festival_events")
    .insert({
      festival_id: festivalId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      event_date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      venue: input.venue.trim(),
      category: input.category,
      highlighted: Boolean(input.highlighted),
      is_active: input.isActive ?? true,
    })
    .select(
      "id, festival_id, event_date, title, description, start_time, end_time, venue, category, highlighted, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(`Unable to add event: ${error.message}`);
  }

  return mapEvent(data);
}

export async function updateAdminScheduleEvent(
  eventId: string,
  festivalId: string,
  input: {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
    category: EventCategory;
    highlighted?: boolean;
    isActive?: boolean;
  },
): Promise<AdminScheduleEvent> {
  const { data, error } = await getSupabaseAdminClient()
    .from("festival_events")
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      event_date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      venue: input.venue.trim(),
      category: input.category,
      highlighted: Boolean(input.highlighted),
      is_active: input.isActive ?? true,
    })
    .eq("id", eventId)
    .eq("festival_id", festivalId)
    .select(
      "id, festival_id, event_date, title, description, start_time, end_time, venue, category, highlighted, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(`Unable to update event: ${error.message}`);
  }

  return mapEvent(data);
}

export async function deleteAdminScheduleEvent(
  eventId: string,
  festivalId: string,
): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("festival_events")
    .delete()
    .eq("id", eventId)
    .eq("festival_id", festivalId);

  if (error) {
    throw new Error(`Unable to delete event: ${error.message}`);
  }
}

export async function toggleAdminScheduleEvent(
  eventId: string,
  festivalId: string,
  isActive: boolean,
): Promise<AdminScheduleEvent> {
  const { data, error } = await getSupabaseAdminClient()
    .from("festival_events")
    .update({ is_active: isActive })
    .eq("id", eventId)
    .eq("festival_id", festivalId)
    .select(
      "id, festival_id, event_date, title, description, start_time, end_time, venue, category, highlighted, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(`Unable to update event status: ${error.message}`);
  }

  return mapEvent(data);
}
