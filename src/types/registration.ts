// Types describing a resident's pooja registration.

export interface Registration {
  /** Generated registration number, e.g. "GCF-2026-0001". Used as the id. */
  id: string;
  poojaId: string;
  poojaName?: string;
  slotId?: string;
  residentName: string;
  unitNumber: string;
  phone: string;
  email: string;
  /** ISO date (YYYY-MM-DD) the resident wants the pooja performed. */
  poojaDate: string;
  familyMembersCount: number;
  gotram?: string;
  familyNames?: string;
  notes?: string;
  /** ISO datetime the registration was submitted. */
  createdAt: string;
}
