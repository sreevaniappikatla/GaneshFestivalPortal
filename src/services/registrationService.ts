import type { Registration } from "@/types";
import type { FestivalConfig } from "@/types";

// Local mock persistence for pooja registrations, using localStorage.
// This is a stand-in for a real backend — everything here is scoped to
// the visitor's own browser. Swap this module out once Supabase is
// wired up; callers (the registration form, the success page) should
// not need to change.
const STORAGE_KEY = "gcf-pooja-registrations";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getRegistrations(): Registration[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Registration[]) : [];
  } catch {
    return [];
  }
}

export function getRegistrationByNumber(id: string): Registration | undefined {
  return getRegistrations().find((registration) => registration.id === id);
}

export function saveRegistration(registration: Registration): void {
  if (!isBrowser()) return;
  const existing = getRegistrations();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, registration]));
}

/**
 * Generates the next registration number, e.g. "GCF-2026-0001", based on
 * how many registrations already exist in local storage.
 */
export function generateRegistrationNumber(festival: FestivalConfig): string {
  const sequence = String(getRegistrations().length + 1).padStart(4, "0");
  return `${festival.registrationPrefix}-${festival.year}-${sequence}`;
}
