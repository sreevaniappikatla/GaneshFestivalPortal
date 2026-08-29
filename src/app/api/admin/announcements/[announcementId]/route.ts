import { NextResponse } from "next/server";
import { z } from "zod";

import {
  deleteAdminAnnouncement,
  updateAdminAnnouncement,
} from "@/services/announcementAdmin.service";

const announcementBodySchema = z.object({
  communityId: z.string().uuid(),
  festivalId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(2).max(200),
  message: z.string().trim().min(2).max(3000),
  priority: z.enum(["normal", "important", "urgent"]),
  isPublished: z.boolean(),
  publishDate: z.string().min(1),
  expiryDate: z.string().optional().or(z.literal("")),
});

export async function PUT(
  request: Request,
  { params }: { params: { announcementId: string } },
) {
  try {
    const payload = announcementBodySchema.parse(await request.json());

    const announcement = await updateAdminAnnouncement(
      params.announcementId,
      payload.communityId,
      payload.festivalId ?? null,
      {
        title: payload.title,
        message: payload.message,
        priority: payload.priority,
        isPublished: payload.isPublished,
        publishDate: payload.publishDate,
        expiryDate: payload.expiryDate || null,
      },
    );

    return NextResponse.json({ announcement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Please review the announcement details." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update announcement." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { announcementId: string } },
) {
  try {
    const payload = z.object({ communityId: z.string().uuid() }).parse(await request.json());
    await deleteAdminAnnouncement(params.announcementId, payload.communityId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete announcement." },
      { status: 500 },
    );
  }
}
