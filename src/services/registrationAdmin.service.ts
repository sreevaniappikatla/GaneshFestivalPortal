import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminRegistrationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type AdminPaymentStatus =
  | "not_required"
  | "pending"
  | "paid"
  | "failed";

export interface AdminRegistration {
  id: string;
  registrationNumber: string;
  residentName: string;
  unitNumber: string;
  phone: string;
  email: string;
  poojaId: string;
  poojaName: string;
  poojaDate: string;
  amount: number;
  paymentStatus: AdminPaymentStatus;
  status: AdminRegistrationStatus;
  createdAt: string;
  familyMembersCount: number;
  gotram?: string;
  familyNames?: string;
  notes?: string;
}

export async function getAdminRegistrations(
  festivalId: string,
): Promise<AdminRegistration[]> {
  const { data: registrations, error } = await getSupabaseAdminClient()
    .from("pooja_registrations")
    .select(
      "id, registration_number, pooja_id, resident_name, unit_number, phone, email, pooja_date, amount, payment_status, status, created_at, family_members_count, gotram, family_names, notes",
    )
    .eq("festival_id", festivalId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load registrations: ${error.message}`);
  }

  if (!registrations || registrations.length === 0) {
    return [];
  }

  const poojaIds = [...new Set(registrations.map((row) => row.pooja_id))];
  const { data: poojas, error: poojaError } = await getSupabaseAdminClient()
    .from("poojas")
    .select("id, name")
    .in("id", poojaIds);

  if (poojaError) {
    throw new Error(`Unable to load pooja names: ${poojaError.message}`);
  }

  const poojaNameMap = new Map<string, string>();
  (poojas ?? []).forEach((pooja) => {
    poojaNameMap.set(pooja.id, pooja.name);
  });

  return (registrations ?? []).map((row) => ({
    id: row.id,
    registrationNumber: row.registration_number ?? "-",
    residentName: row.resident_name,
    unitNumber: row.unit_number,
    phone: row.phone,
    email: row.email ?? "",
    poojaId: row.pooja_id,
    poojaName: poojaNameMap.get(row.pooja_id) ?? "Unknown pooja",
    poojaDate: row.pooja_date,
    amount: Number(row.amount ?? 0),
    paymentStatus: (row.payment_status ?? "not_required") as AdminPaymentStatus,
    status: (row.status ?? "confirmed") as AdminRegistrationStatus,
    createdAt: row.created_at,
    familyMembersCount: Number(row.family_members_count ?? 1),
    gotram: row.gotram ?? undefined,
    familyNames: row.family_names ?? undefined,
    notes: row.notes ?? undefined,
  }));
}
