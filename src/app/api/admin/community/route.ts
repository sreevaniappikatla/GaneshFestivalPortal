import { NextResponse } from "next/server";
import { z } from "zod";

import { updateCommunitySettings } from "@/services/communityAdmin.service";

const communityBodySchema = z.object({
  communityId: z.string().uuid(),
  name: z.string().trim().min(2),
  shortName: z.string().trim().min(1),
  logo: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  timezone: z.string().trim().min(1),
  currency: z.string().trim().min(3).max(3),
  primaryColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function PUT(request: Request) {
  try {
    const payload = communityBodySchema.parse(await request.json());

    const community = await updateCommunitySettings(payload.communityId, {
      name: payload.name,
      shortName: payload.shortName,
      logo: payload.logo ?? "",
      address: payload.address ?? "",
      city: payload.city,
      email: payload.email ?? "",
      phone: payload.phone ?? "",
      whatsapp: payload.whatsapp ?? "",
      timezone: payload.timezone,
      currency: payload.currency,
      primaryColor: payload.primaryColor,
      secondaryColor: payload.secondaryColor,
      accentColor: payload.accentColor,
    });

    return NextResponse.json({ community });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Please review the community settings." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save community settings." },
      { status: 500 },
    );
  }
}
