// Types describing individual festival schedule events.

export type EventCategory =
  | "pooja"
  | "cultural"
  | "food"
  | "kids"
  | "celebration"
  | "other";

export interface ScheduleEvent {
  id: string;
  /** ISO date the event falls on, e.g. "2026-09-14" */
  date: string;
  title: string;
  description: string;
  /** 24-hour "HH:mm" start time, e.g. "18:00" */
  startTime: string;
  /** 24-hour "HH:mm" end time, e.g. "19:30" */
  endTime: string;
  venue: string;
  category: EventCategory;
  /** Marks an event as a festival highlight (e.g. Sthapana, Visarjan) */
  highlighted: boolean;
}
