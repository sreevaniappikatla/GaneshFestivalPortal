import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { poojaSchema } from "@/lib/validation/poojaSchema";

const inputSchema = z.object({
  festivalId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  amount: z.coerce.number().min(0).max(1000000),
  maximumRegistrations: z.coerce.number().int().min(1),
  requiresPayment: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = inputSchema.parse(await request.json());
    const validated = poojaSchema.parse({
      name: payload.name,
      description: payload.description ?? "",
      amount: payload.amount,
      maximumRegistrations: payload.maximumRegistrations,
      requiresPayment: payload.requiresPayment ?? false,
      isActive: payload.isActive ?? true,
    });

    const { data, error } = await getSupabaseAdminClient()
      .from("poojas")
      .insert({
        festival_id: payload.festivalId,
        name: validated.name,
        description: validated.description || null,
        amount: validated.requiresPayment ? validated.amount : 0,
        maximum_registrations: validated.maximumRegistrations,
        is_active: validated.isActive,
      })
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
      { error: error instanceof Error ? error.message : "Unable to create pooja." },
      { status: 500 },
    );
  }
}
