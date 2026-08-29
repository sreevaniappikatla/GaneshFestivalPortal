import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { scheduleEventSchema } from "@/lib/validation/scheduleEventSchema";

const updateEventBody = z.object({
  festivalId: z.string().uuid(),
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  date: z.string().min(1).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  venue: z.string().trim().min(2).max(200).optional(),
  category: z.enum([
    "pooja",
    "cultural",
    "food",
    "kids",
    "celebration",
    "other",
  ]).optional(),
  highlighted: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { eventId: string } },
) {
  try {
    const payload = updateEventBody.parse(await request.json());
    const eventId = params.eventId;

    const validated = scheduleEventSchema.parse({
      title: payload.title ?? "",
      description: payload.description ?? "",
      date: payload.date ?? "",
      startTime: payload.startTime ?? "09:00",
      endTime: payload.endTime ?? "10:00",
      venue: payload.venue ?? "",
      category: payload.category ?? "pooja",
      highlighted: Boolean(payload.highlighted),
      isActive: payload.isActive ?? true,
    });

    const { data, error } = await getSupabaseAdminClient()
      .from("festival_events")
      .update({
        title: validated.title,
        description: validated.description || null,
        event_date: validated.date,
        start_time: validated.startTime,
        end_time: validated.endTime,
        venue: validated.venue,
        category: validated.category,
        highlighted: validated.highlighted,
        is_active: validated.isActive,
      })
      .eq("id", eventId)
      .eq("festival_id", payload.festivalId)
      .select(
        "id, festival_id, event_date, title, description, start_time, end_time, venue, category, highlighted, is_active, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Please check the event details." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update schedule event." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string } },
) {
  try {
    const payload = z.object({
      festivalId: z.string().uuid(),
      isActive: z.boolean(),
    }).parse(await request.json());

    const { data, error } = await getSupabaseAdminClient()
      .from("festival_events")
      .update({ is_active: payload.isActive })
      .eq("id", params.eventId)
      .eq("festival_id", payload.festivalId)
      .select(
        "id, festival_id, event_date, title, description, start_time, end_time, venue, category, highlighted, is_active, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update event status." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } },
) {
  try {
    const payload = z.object({ festivalId: z.string().uuid() }).parse(await request.json());

    const { error } = await getSupabaseAdminClient()
      .from("festival_events")
      .delete()
      .eq("id", params.eventId)
      .eq("festival_id", payload.festivalId);

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
      { error: error instanceof Error ? error.message : "Unable to delete schedule event." },
      { status: 500 },
    );
  }
}
