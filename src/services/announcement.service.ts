import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Announcement } from "@/types";

export async function getAnnouncements(
  communityId: string,
  festivalId: string,
): Promise<Announcement[]> {
  const today = new Date().toISOString();

  const { data, error } = await getSupabaseAdminClient()
    .from("announcements")
    .select("id, title, message, priority, posted_at, publish_date, expiry_date, is_published")
    .eq("community_id", communityId)
    .eq("is_published", true)
    .or(`festival_id.is.null,festival_id.eq.${festivalId}`)
    .lt("publish_date", today)
    .or(`expiry_date.is.null,expiry_date.gt.${today}`)
    .order("priority", { ascending: false })
    .order("posted_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load announcements: ${error.message}`);
  }

  return (data ?? []).map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    priority: (announcement.priority ?? "normal") as Announcement["priority"],
    postedAt: announcement.posted_at,
    publishDate: announcement.publish_date ?? announcement.posted_at,
    expiryDate: announcement.expiry_date ?? null,
    isPublished: announcement.is_published ?? true,
  }));
}
