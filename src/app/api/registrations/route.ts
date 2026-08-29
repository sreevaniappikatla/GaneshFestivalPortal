import { NextResponse } from "next/server";
import { z } from "zod";
import { createRegistration } from "@/services/registration.service";

const requestSchema = z.object({
  festivalId: z.string().uuid(),
  poojaId: z.string().uuid(),
  poojaSlotId: z.string().uuid(),
  residentName: z.string().trim().min(2).max(120),
  unitNumber: z.string().trim().min(1).max(40),
  phone: z.string().regex(/^[6-9][0-9]{9}$/),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  poojaDate: z.string().date(),
  familyMembersCount: z.number().int().min(1).max(20),
  gotram: z.string().trim().max(100).optional(),
  familyNames: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(500).optional(),
});

function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("Could not find the function public.create_pooja_registration")) {
    return "The registration backend is not configured in Supabase. Please run the latest Supabase migration for the registration workflow.";
  }
  if (message.includes("SLOT_FULL")) return "Sorry, that slot just became full. Please choose another slot.";
  if (message.includes("INACTIVE_OR_INVALID_POOJA")) return "That pooja is no longer available. Please choose another pooja.";
  if (message.includes("INVALID_OR_INACTIVE_SLOT")) return "That slot is no longer available. Please choose another slot.";
  if (message.includes("INVALID_")) return "Please check the form details and try again.";
  return "We could not complete your registration right now. Please try again.";
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const registration = await createRegistration(payload);
    return NextResponse.json({ registration });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please check the form details and try again." }, { status: 400 });
    }
    return NextResponse.json({ error: friendlyError(error) }, { status: 409 });
  }
}
