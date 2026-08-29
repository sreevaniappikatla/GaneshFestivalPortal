import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PoojaConfig } from "@/types";

export async function getPoojas(festivalId: string): Promise<PoojaConfig[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("poojas")
    .select("id, name, description, is_active, maximum_registrations, amount, pooja_registrations(count)")
    .eq("festival_id", festivalId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load poojas: ${error.message}`);
  }

  return (data ?? []).map((pooja) => ({
    id: pooja.id,
    name: pooja.name,
    description: pooja.description ?? "",
    active: pooja.is_active,
    totalRegistered: pooja.pooja_registrations?.[0]?.count ?? 0,
    maximumRegistrations: pooja.maximum_registrations ?? Number.MAX_SAFE_INTEGER,
    amount: pooja.amount,
  }));
}

export async function getAvailablePoojaSlots(festivalId: string): Promise<import("@/types").PoojaSlot[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("pooja_slots")
    .select("id, pooja_id, slot_date, start_time, end_time, capacity, poojas!inner(festival_id, is_active), pooja_registrations(count)")
    .eq("poojas.festival_id", festivalId)
    .eq("is_active", true)
    .order("slot_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Unable to load pooja slots: ${error.message}`);
  }

  return (data ?? [])
    .map((slot) => ({
      id: slot.id,
      poojaId: slot.pooja_id,
      date: slot.slot_date,
      startTime: slot.start_time.slice(0, 5),
      endTime: slot.end_time.slice(0, 5),
      capacity: slot.capacity,
      registeredCount: slot.pooja_registrations?.[0]?.count ?? 0,
    }))
    .filter((slot) => slot.capacity === null || slot.registeredCount < slot.capacity);
}
