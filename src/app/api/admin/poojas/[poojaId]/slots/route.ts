import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { poojaSlotSchema } from "@/lib/validation/poojaSchema";

const slotInput = z.object({
  festivalId: z.string().uuid(),
  slotDate: z.string().min(1),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  capacity: z.coerce.number().int().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { poojaId: string } },
) {
  try {
    const payload = slotInput.parse(await request.json());
    const validated = poojaSlotSchema.parse({
      slotDate: payload.slotDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      capacity: payload.capacity ?? null,
      isActive: payload.isActive ?? true,
    });

    const { data: existingPooja, error: existingError } = await getSupabaseAdminClient()
      .from("poojas")
      .select("id, maximum_registrations")
      .eq("id", params.poojaId)
      .eq("festival_id", payload.festivalId)
      .single();

    if (existingError || !existingPooja) {
      throw new Error("Pooja not found.");
    }

    const { data: confirmedRegistrations, error: countError } = await getSupabaseAdminClient()
      .from("pooja_registrations")
      .select("id")
      .eq("pooja_id", params.poojaId)
      .neq("status", "cancelled");

    if (countError) {
      throw new Error(countError.message);
    }

    const slotCapacity = validated.capacity ?? null;
    if (slotCapacity !== null && slotCapacity < (confirmedRegistrations?.length ?? 0)) {
      throw new Error("Slot capacity cannot be lower than the number of confirmed registrations already assigned to this pooja.");
    }

    const { data, error } = await getSupabaseAdminClient()
      .from("pooja_slots")
      .insert({
        pooja_id: params.poojaId,
        slot_date: validated.slotDate,
        start_time: validated.startTime,
        end_time: validated.endTime,
        capacity: slotCapacity,
        is_active: validated.isActive,
      })
      .select("id, pooja_id, slot_date, start_time, end_time, capacity, is_active, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ slot: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Please check the slot details." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create pooja slot." },
      { status: 500 },
    );
  }
}
