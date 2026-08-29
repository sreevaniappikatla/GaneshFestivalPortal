import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Registration } from "@/types";

export type CreateRegistrationInput = {
  festivalId: string;
  poojaId: string;
  poojaSlotId: string;
  residentName: string;
  unitNumber: string;
  phone: string;
  email?: string;
  poojaDate: string;
  familyMembersCount: number;
  gotram?: string;
  familyNames?: string;
  notes?: string;
};

export type RegistrationConfirmation = Registration & {
  slotStartTime: string;
  slotEndTime: string;
  amount: number;
  paymentStatus: string;
  status: string;
};

export async function createRegistration(
  input: CreateRegistrationInput,
): Promise<RegistrationConfirmation> {
  const { data, error } = await getSupabaseAdminClient().rpc(
    "create_pooja_registration",
    {
      p_festival_id: input.festivalId,
      p_pooja_id: input.poojaId,
      p_pooja_slot_id: input.poojaSlotId,
      p_resident_name: input.residentName,
      p_unit_number: input.unitNumber,
      p_phone: input.phone,
      p_email: input.email ?? null,
      p_pooja_date: input.poojaDate,
      p_family_members_count: input.familyMembersCount,
      p_gotram: input.gotram ?? null,
      p_family_names: input.familyNames ?? null,
      p_notes: input.notes ?? null,
    },
  );

  if (error || !data?.[0]) {
    const code = error?.message ?? "DATABASE_ERROR";
    throw new Error(code);
  }

  const registration = data[0];
  return {
    id: registration.registration_number,
    poojaId: registration.pooja_id,
    poojaName: registration.pooja_name,
    slotId: registration.pooja_slot_id,
    residentName: registration.resident_name,
    unitNumber: registration.unit_number,
    phone: registration.phone,
    email: registration.email ?? "",
    poojaDate: registration.pooja_date,
    familyMembersCount: registration.family_members_count,
    gotram: registration.gotram ?? undefined,
    familyNames: registration.family_names ?? undefined,
    notes: registration.notes ?? undefined,
    createdAt: registration.created_at,
    slotStartTime: registration.slot_start_time,
    slotEndTime: registration.slot_end_time,
    amount: Number(registration.amount),
    paymentStatus: registration.payment_status,
    status: registration.status,
  };
}
