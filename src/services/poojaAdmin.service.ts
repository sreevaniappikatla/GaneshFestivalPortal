import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AdminPoojaSlot {
  id: string;
  poojaId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminPooja {
  id: string;
  festivalId: string;
  name: string;
  description: string;
  isActive: boolean;
  amount: number;
  requiresPayment: boolean;
  maximumRegistrations: number;
  slots: AdminPoojaSlot[];
  createdAt: string;
  updatedAt: string;
}

function mapSlot(row: any): AdminPoojaSlot {
  return {
    id: row.id,
    poojaId: row.pooja_id,
    slotDate: row.slot_date,
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    capacity: row.capacity,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  };
}

function mapPooja(row: any, slots: AdminPoojaSlot[]): AdminPooja {
  return {
    id: row.id,
    festivalId: row.festival_id,
    name: row.name,
    description: row.description ?? "",
    isActive: row.is_active,
    amount: Number(row.amount ?? 0),
    requiresPayment: Number(row.amount ?? 0) > 0,
    maximumRegistrations: row.maximum_registrations ?? Number.MAX_SAFE_INTEGER,
    slots,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminPoojas(festivalId: string): Promise<AdminPooja[]> {
  const { data: poojas, error: poojasError } = await getSupabaseAdminClient()
    .from("poojas")
    .select(
      "id, festival_id, name, description, is_active, amount, maximum_registrations, created_at, updated_at",
    )
    .eq("festival_id", festivalId)
    .order("created_at", { ascending: true });

  if (poojasError) {
    throw new Error(`Unable to load poojas: ${poojasError.message}`);
  }

  const { data: slots, error: slotsError } = await getSupabaseAdminClient()
    .from("pooja_slots")
    .select(
      "id, pooja_id, slot_date, start_time, end_time, capacity, is_active, created_at",
    )
    .in(
      "pooja_id",
      (poojas ?? []).map((pooja) => pooja.id),
    )
    .order("slot_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (slotsError) {
    throw new Error(`Unable to load pooja slots: ${slotsError.message}`);
  }

  const slotMap = new Map<string, AdminPoojaSlot[]>();
  (slots ?? []).forEach((slot) => {
    const list = slotMap.get(slot.pooja_id) ?? [];
    list.push(mapSlot(slot));
    slotMap.set(slot.pooja_id, list);
  });

  return (poojas ?? []).map((pooja) =>
    mapPooja(pooja, slotMap.get(pooja.id) ?? []),
  );
}

export async function createAdminPooja(
  festivalId: string,
  input: {
    name: string;
    description?: string;
    amount: number;
    maximumRegistrations: number;
    requiresPayment: boolean;
    isActive?: boolean;
  },
): Promise<AdminPooja> {
  const { data, error } = await getSupabaseAdminClient()
    .from("poojas")
    .insert({
      festival_id: festivalId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      amount: input.requiresPayment ? Number(input.amount) : 0,
      maximum_registrations: input.maximumRegistrations,
      is_active: input.isActive ?? true,
    })
    .select(
      "id, festival_id, name, description, is_active, amount, maximum_registrations, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(`Unable to create pooja: ${error.message}`);
  }

  return mapPooja(data, []);
}

export async function updateAdminPooja(
  poojaId: string,
  festivalId: string,
  input: {
    name: string;
    description?: string;
    amount: number;
    maximumRegistrations: number;
    requiresPayment: boolean;
    isActive?: boolean;
  },
): Promise<AdminPooja> {
  const { data, error } = await getSupabaseAdminClient()
    .from("poojas")
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      amount: input.requiresPayment ? Number(input.amount) : 0,
      maximum_registrations: input.maximumRegistrations,
      is_active: input.isActive ?? true,
    })
    .eq("id", poojaId)
    .eq("festival_id", festivalId)
    .select(
      "id, festival_id, name, description, is_active, amount, maximum_registrations, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(`Unable to update pooja: ${error.message}`);
  }

  return mapPooja(data, []);
}

export async function deleteAdminPooja(
  poojaId: string,
  festivalId: string,
): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("poojas")
    .delete()
    .eq("id", poojaId)
    .eq("festival_id", festivalId);

  if (error) {
    throw new Error(`Unable to delete pooja: ${error.message}`);
  }
}

export async function createAdminPoojaSlot(
  poojaId: string,
  festivalId: string,
  input: {
    slotDate: string;
    startTime: string;
    endTime: string;
    capacity?: number | null;
    isActive?: boolean;
  },
): Promise<AdminPoojaSlot> {
  const { data, error } = await getSupabaseAdminClient()
    .from("pooja_slots")
    .insert({
      pooja_id: poojaId,
      slot_date: input.slotDate,
      start_time: input.startTime,
      end_time: input.endTime,
      capacity: input.capacity ?? null,
      is_active: input.isActive ?? true,
    })
    .select("id, pooja_id, slot_date, start_time, end_time, capacity, is_active, created_at")
    .single();

  if (error) {
    throw new Error(`Unable to create slot: ${error.message}`);
  }

  return mapSlot(data);
}

export async function updateAdminPoojaSlot(
  slotId: string,
  poojaId: string,
  festivalId: string,
  input: {
    slotDate: string;
    startTime: string;
    endTime: string;
    capacity?: number | null;
    isActive?: boolean;
  },
): Promise<AdminPoojaSlot> {
  const { data, error } = await getSupabaseAdminClient()
    .from("pooja_slots")
    .update({
      slot_date: input.slotDate,
      start_time: input.startTime,
      end_time: input.endTime,
      capacity: input.capacity ?? null,
      is_active: input.isActive ?? true,
    })
    .eq("id", slotId)
    .eq("pooja_id", poojaId)
    .select("id, pooja_id, slot_date, start_time, end_time, capacity, is_active, created_at")
    .single();

  if (error) {
    throw new Error(`Unable to update slot: ${error.message}`);
  }

  return mapSlot(data);
}

export async function deleteAdminPoojaSlot(
  slotId: string,
  poojaId: string,
): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("pooja_slots")
    .delete()
    .eq("id", slotId)
    .eq("pooja_id", poojaId);

  if (error) {
    throw new Error(`Unable to delete slot: ${error.message}`);
  }
}

export async function toggleAdminPoojaSlot(
  slotId: string,
  poojaId: string,
  isActive: boolean,
): Promise<AdminPoojaSlot> {
  const { data, error } = await getSupabaseAdminClient()
    .from("pooja_slots")
    .update({ is_active: isActive })
    .eq("id", slotId)
    .eq("pooja_id", poojaId)
    .select("id, pooja_id, slot_date, start_time, end_time, capacity, is_active, created_at")
    .single();

  if (error) {
    throw new Error(`Unable to update slot status: ${error.message}`);
  }

  return mapSlot(data);
}
