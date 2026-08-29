// Types describing a pooja that residents can register for.

export interface PoojaConfig {
  id: string;
  name: string;
  description: string;
  /** Whether this pooja is currently open for registration. */
  active: boolean;
  /** Baseline number of registrations already on record (seed data). */
  totalRegistered: number;
  /** Maximum number of registrations this pooja can accept. */
  maximumRegistrations: number;
  amount?: number;
}

export interface PoojaSlot {
  id: string;
  poojaId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number | null;
  registeredCount: number;
}
