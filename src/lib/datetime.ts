/**
 * Returns "today" as an ISO date string (YYYY-MM-DD), computed in the
 * given IANA timezone rather than the server's local timezone.
 */
export function getTodayInTimezone(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Returns the current time as a 24-hour "HH:mm" string, computed in the
 * given IANA timezone.
 */
export function getCurrentTimeInTimezone(timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}
