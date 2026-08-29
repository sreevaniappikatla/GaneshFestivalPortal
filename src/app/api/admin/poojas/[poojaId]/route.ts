import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { poojaSchema } from "@/lib/validation/poojaSchema";

const poojaPayload = z.object({
  festivalId: z.string().uuid(),
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  amount: z.coerce.number().min(0).max(1000000).optional(),
  maximumRegistrations: z.coerce.number().int().min(1).optional(),
  requiresPayment: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { poojaId: string } },
) {
  try {
    const payload = poojaPayload.parse(await request.json());
    const validated = poojaSchema.parse({
      name: payload.name ?? "",
      description: payload.description ?? "",
      amount: payload.amount ?? 0,
      maximumRegistrations: payload.maximumRegistrations ?? 1,
      requiresPayment: payload.requiresPayment ?? false,
      isActive: payload.isActive ?? true,
    });

    const { data, error } = await getSupabaseAdminClient()
      .from("poojas")
      .update({
        name: validated.name,
        description: validated.description || null,
        amount: validated.requiresPayment ? validated.amount : 0,
        maximum_registrations: validated.maximumRegistrations,
        is_active: validated.isActive,
      })
      .eq("id", params.poojaId)
      .eq("festival_id", payload.festivalId)
      .select(
        "id, festival_id, name, description, is_active, amount, maximum_registrations, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ pooja: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Please check the pooja details." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update pooja." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { poojaId: string } },
) {
  try {
    const payload = z.object({
      festivalId: z.string().uuid(),
      isActive: z.boolean(),
    }).parse(await request.json());

    const { data, error } = await getSupabaseAdminClient()
      .from("poojas")
      .update({ is_active: payload.isActive })
      .eq("id", params.poojaId)
      .eq("festival_id", payload.festivalId)
      .select(
        "id, festival_id, name, description, is_active, amount, maximum_registrations, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ pooja: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update pooja status." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { poojaId: string } },
) {
  try {
    const payload = z.object({ festivalId: z.string().uuid() }).parse(await request.json());

    const { error } = await getSupabaseAdminClient()
      .from("poojas")
      .delete()
      .eq("id", params.poojaId)
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
      { error: error instanceof Error ? error.message : "Unable to delete pooja." },
      { status: 500 },
    );
  }
}
