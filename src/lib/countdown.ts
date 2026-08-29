export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target date/time has passed. */
  hasPassed: boolean;
}

/**
 * Computes the time remaining between now and a target ISO date string.
 * Pure function — safe to call on both server and client.
 */
export function getTimeRemaining(targetIso: string): TimeRemaining {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, hasPassed: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, hasPassed: false };
}
