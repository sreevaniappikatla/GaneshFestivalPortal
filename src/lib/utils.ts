// Generic, reusable helper functions for the app.

import { communityConfig } from "@/config/community";

/**
 * Parses a "YYYY-MM-DD" string into a local Date set to that calendar
 * day. Deliberately avoids `new Date(isoString)`, which JS parses as
 * UTC midnight and can display as the previous day depending on the
 * server's local timezone offset.
 */
function parseCalendarDate(isoDate: string): Date | null {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/**
 * Formats a "YYYY-MM-DD" date string into a readable, human-friendly date,
 * e.g. "Monday, September 14, 2026".
 */
export function formatDate(isoDate: string): string {
  const date = parseCalendarDate(isoDate);
  if (!date) return isoDate;
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a start/end "YYYY-MM-DD" date pair into a compact range, e.g.
 * "Sep 14 – Sep 23, 2026".
 */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = parseCalendarDate(startIso);
  const end = parseCalendarDate(endIso);
  if (!start || !end) return `${startIso} – ${endIso}`;

  const startLabel = start.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

/**
 * Formats a number as currency using the community's configured
 * currency code (see config/community.ts) — never hard-code a symbol.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: communityConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Joins class names together, filtering out falsy values.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
