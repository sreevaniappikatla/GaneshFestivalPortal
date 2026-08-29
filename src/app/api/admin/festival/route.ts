import { NextResponse } from "next/server";
import { z } from "zod";

import { updateFestivalSettings } from "@/services/festivalAdmin.service";

const festivalBodySchema = z.object({
  festivalId: z.string().uuid(),
  festivalName: z.string().trim().min(2),
  year: z.coerce.number().int().min(2020).max(2100),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  deityName: z.string().trim().optional().or(z.literal("")),
  heroTitle: z.string().trim().optional().or(z.literal("")),
  heroSubtitle: z.string().trim().optional().or(z.literal("")),
  heroImage: z.string().trim().optional().or(z.literal("")),
  registrationOpenDate: z.string().min(1).optional().or(z.literal("")),
  registrationCloseDate: z.string().min(1).optional().or(z.literal("")),
  status: z.enum(["draft", "open", "closed", "archived"]).optional(),
});

export async function PUT(request: Request) {
  try {
    const payload = festivalBodySchema.parse(await request.json());

    const festival = await updateFestivalSettings(payload.festivalId, {
      festivalName: payload.festivalName,
      year: payload.year,
      startDate: payload.startDate,
      endDate: payload.endDate,
      deityName: payload.deityName ?? "",
      heroTitle: payload.heroTitle ?? "",
      heroSubtitle: payload.heroSubtitle ?? "",
      heroImage: payload.heroImage ?? "",
      registrationOpenDate: payload.registrationOpenDate ?? "",
      registrationCloseDate: payload.registrationCloseDate ?? "",
      status: payload.status ?? "draft",
    });

    return NextResponse.json({ festival });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Please review the festival settings." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save festival settings." },
      { status: 500 },
    );
  }
}
