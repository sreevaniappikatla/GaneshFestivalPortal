import type { PoojaConfig, Registration } from "@/types";

// Derives each pooja's live registration count from its baseline seed
// value plus any registrations recorded locally, without mutating the
// pooja configuration itself.

export function getEffectiveRegisteredCount(
  pooja: PoojaConfig,
  registrations: Registration[],
): number {
  const localCount = registrations.filter((r) => r.poojaId === pooja.id).length;
  return pooja.totalRegistered + localCount;
}

export function getRemainingSlots(pooja: PoojaConfig, registrations: Registration[]): number {
  return Math.max(pooja.maximumRegistrations - getEffectiveRegisteredCount(pooja, registrations), 0);
}

export function isPoojaFull(pooja: PoojaConfig, registrations: Registration[]): boolean {
  return getEffectiveRegisteredCount(pooja, registrations) >= pooja.maximumRegistrations;
}
