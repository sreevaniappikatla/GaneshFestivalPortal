import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AnnouncementPriority = "normal" | "important" | "urgent";

export interface AdminAnnouncement {
  id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  isPublished: boolean;
  publishDate: string;
  expiryDate: string | null;
  postedAt: string;
}

function mapAnnouncement(row: any): AdminAnnouncement {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    priority: (row.priority ?? "normal") as AnnouncementPriority,
    isPublished: row.is_published ?? true,
    publishDate: row.publish_date ?? row.posted_at,
    expiryDate: row.expiry_date ?? null,
    postedAt: row.posted_at,
  };
}

export async function getAdminAnnouncements(
  communityId: string,
  festivalId: string,
): Promise<AdminAnnouncement[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("announcements")
    .select(
      "id, title, message, priority, is_published, publish_date, expiry_date, posted_at",
    )
    .eq("community_id", communityId)
    .or(`festival_id.is.null,festival_id.eq.${festivalId}`)
    .order("publish_date", { ascending: false })
    .order("posted_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load announcements: ${error.message}`);
  }

  return (data ?? []).map(mapAnnouncement);
}

export async function createAdminAnnouncement(
  communityId: string,
  festivalId: string | null,
  input: {
    title: string;
    message: string;
    priority: AnnouncementPriority;
    isPublished: boolean;
    publishDate: string;
    expiryDate?: string | null;
  },
): Promise<AdminAnnouncement> {
  const publishDate = input.publishDate || new Date().toISOString();
  const { data, error } = await getSupabaseAdminClient()
    .from("announcements")
    .insert({
      community_id: communityId,
      festival_id: festivalId,
      title: input.title.trim(),
      message: input.message.trim(),
      priority: input.priority,
      is_published: input.isPublished,
      publish_date: publishDate,
      expiry_date: input.expiryDate || null,
      posted_at: publishDate,
    })
    .select(
      "id, title, message, priority, is_published, publish_date, expiry_date, posted_at",
    )
    .single();

  if (error) {
    throw new Error(`Unable to create announcement: ${error.message}`);
  }

  return mapAnnouncement(data);
}

export async function updateAdminAnnouncement(
  announcementId: string,
  communityId: string,
  festivalId: string | null,
  input: {
    title: string;
    message: string;
    priority: AnnouncementPriority;
    isPublished: boolean;
    publishDate: string;
    expiryDate?: string | null;
  },
): Promise<AdminAnnouncement> {
  const publishDate = input.publishDate || new Date().toISOString();
  const { data, error } = await getSupabaseAdminClient()
    .from("announcements")
    .update({
      title: input.title.trim(),
      message: input.message.trim(),
      priority: input.priority,
      is_published: input.isPublished,
      publish_date: publishDate,
      expiry_date: input.expiryDate || null,
      posted_at: publishDate,
    })
    .eq("id", announcementId)
    .eq("community_id", communityId)
    .select(
      "id, title, message, priority, is_published, publish_date, expiry_date, posted_at",
    )
    .single();

  if (error) {
    throw new Error(`Unable to update announcement: ${error.message}`);
  }

  return mapAnnouncement(data);
}

export async function deleteAdminAnnouncement(
  announcementId: string,
  communityId: string,
): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("announcements")
    .delete()
    .eq("id", announcementId)
    .eq("community_id", communityId);

  if (error) {
    throw new Error(`Unable to delete announcement: ${error.message}`);
  }
}
