import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { poojaSlotSchema } from "@/lib/validation/poojaSchema";

const slotPayload = z.object({
  festivalId: z.string().uuid(),
  slotDate: z.string().min(1).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  capacity: z.coerce.number().int().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { poojaId: string; slotId: string } },
) {
  try {
    const payload = slotPayload.parse(await request.json());
    const validated = poojaSlotSchema.parse({
      slotDate: payload.slotDate ?? "",
      startTime: payload.startTime ?? "09:00",
      endTime: payload.endTime ?? "10:00",
      capacity: payload.capacity ?? null,
      isActive: payload.isActive ?? true,
    });

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
      .update({
        slot_date: validated.slotDate,
        start_time: validated.startTime,
        end_time: validated.endTime,
        capacity: slotCapacity,
        is_active: validated.isActive,
      })
      .eq("id", params.slotId)
      .eq("pooja_id", params.poojaId)
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
      { error: error instanceof Error ? error.message : "Unable to update pooja slot." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { poojaId: string; slotId: string } },
) {
  try {
    const payload = z.object({
      festivalId: z.string().uuid(),
      isActive: z.boolean(),
    }).parse(await request.json());

    const { data, error } = await getSupabaseAdminClient()
      .from("pooja_slots")
      .update({ is_active: payload.isActive })
      .eq("id", params.slotId)
      .eq("pooja_id", params.poojaId)
      .select("id, pooja_id, slot_date, start_time, end_time, capacity, is_active, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ slot: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update slot status." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { poojaId: string; slotId: string } },
) {
  try {
    const payload = z.object({ festivalId: z.string().uuid() }).parse(await request.json());

    const { error } = await getSupabaseAdminClient()
      .from("pooja_slots")
      .delete()
      .eq("id", params.slotId)
      .eq("pooja_id", params.poojaId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete slot." },
      { status: 500 },
    );
  }
}
