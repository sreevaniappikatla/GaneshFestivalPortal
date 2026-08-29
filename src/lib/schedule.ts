import type { ScheduleEvent } from "@/types";

/**
 * Groups events by their ISO date, preserving each group's original
 * relative order (callers typically sort each group with sortEventsByTime).
 */
export function groupEventsByDate(
  events: ScheduleEvent[],
): Record<string, ScheduleEvent[]> {
  return events.reduce<Record<string, ScheduleEvent[]>>((acc, event) => {
    acc[event.date] = acc[event.date] ? [...acc[event.date], event] : [event];
    return acc;
  }, {});
}

/**
 * Returns a new array of events sorted by start time, ascending.
 */
export function sortEventsByTime(events: ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/**
 * Returns all events on a given ISO date, sorted by start time.
 */
export function getEventsForDate(
  events: ScheduleEvent[],
  date: string,
): ScheduleEvent[] {
  return sortEventsByTime(events.filter((event) => event.date === date));
}

export type EventTimeStatus = "upcoming" | "current" | "past";

/**
 * Classifies an event as upcoming, currently happening, or past, relative
 * to a given "HH:mm" time string.
 */
export function getEventTimeStatus(
  event: ScheduleEvent,
  nowTime: string,
): EventTimeStatus {
  if (nowTime < event.startTime) return "upcoming";
  if (nowTime < event.endTime) return "current";
  return "past";
}

/**
 * Formats a 24-hour "HH:mm" string as a friendly 12-hour time, e.g. "6:00 AM".
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const reference = new Date();
  reference.setHours(hours, minutes, 0, 0);
  return reference.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats a start/end "HH:mm" pair as a friendly time range, e.g.
 * "6:00 AM – 7:00 AM".
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}
