import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { scheduleEventSchema } from "@/lib/validation/scheduleEventSchema";

const createEventBody = z.object({
  festivalId: z.string().uuid(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  date: z.string().min(1),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  venue: z.string().trim().min(2).max(200),
  category: z.enum([
    "pooja",
    "cultural",
    "food",
    "kids",
    "celebration",
    "other",
  ]),
  highlighted: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const festivalId = searchParams.get("festivalId");

    if (!festivalId) {
      return NextResponse.json({ error: "Festival ID is required." }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdminClient()
      .from("festival_events")
      .select(
        "id, festival_id, event_date, title, description, start_time, end_time, venue, category, highlighted, is_active, created_at, updated_at",
      )
      .eq("festival_id", festivalId)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ events: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load schedule events." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = createEventBody.parse(await request.json());
    const validated = scheduleEventSchema.parse({
      title: payload.title,
      description: payload.description ?? "",
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      venue: payload.venue,
      category: payload.category,
      highlighted: Boolean(payload.highlighted),
      isActive: payload.isActive ?? true,
    });

    const { data, error } = await getSupabaseAdminClient()
      .from("festival_events")
      .insert({
        festival_id: payload.festivalId,
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
      { error: error instanceof Error ? error.message : "Unable to create schedule event." },
      { status: 500 },
    );
  }
}
