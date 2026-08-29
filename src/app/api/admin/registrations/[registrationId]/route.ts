import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const actionSchema = z.object({
  festivalId: z.string().uuid(),
  action: z.enum([
    "confirm",
    "cancel",
    "complete",
    "mark-payment-received",
  ]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { registrationId: string } },
) {
  try {
    const payload = actionSchema.parse(await request.json());

    const updateMap: Record<string, { status?: string; payment_status?: string }> = {
      confirm: { status: "confirmed" },
      cancel: { status: "cancelled" },
      complete: { status: "completed" },
      "mark-payment-received": { payment_status: "paid" },
    };

    const nextValues = updateMap[payload.action];
    const { data, error } = await getSupabaseAdminClient()
      .from("pooja_registrations")
      .update(nextValues)
      .eq("id", params.registrationId)
      .eq("festival_id", payload.festivalId)
      .select(
        "id, registration_number, resident_name, unit_number, phone, email, pooja_id, pooja_date, amount, payment_status, status, created_at, family_members_count, gotram, family_names, notes",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const { data: poojaData, error: poojaError } = await getSupabaseAdminClient()
      .from("poojas")
      .select("id, name")
      .eq("id", data.pooja_id)
      .single();

    if (poojaError) {
      throw new Error(poojaError.message);
    }

    return NextResponse.json({
      registration: {
        id: data.id,
        registrationNumber: data.registration_number ?? "-",
        residentName: data.resident_name,
        unitNumber: data.unit_number,
        phone: data.phone,
        email: data.email ?? "",
        poojaId: data.pooja_id,
        poojaName: poojaData.name,
        poojaDate: data.pooja_date,
        amount: Number(data.amount ?? 0),
        paymentStatus: data.payment_status ?? "not_required",
        status: data.status ?? "confirmed",
        createdAt: data.created_at,
        familyMembersCount: Number(data.family_members_count ?? 1),
        gotram: data.gotram ?? undefined,
        familyNames: data.family_names ?? undefined,
        notes: data.notes ?? undefined,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update registration." },
      { status: 500 },
    );
  }
}
