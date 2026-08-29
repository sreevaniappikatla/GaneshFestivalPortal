import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FestivalConfig } from "@/types";

export type FestivalRecord = FestivalConfig & { id: string };

export async function getFestival(communityId: string): Promise<FestivalRecord> {
  const { data, error } = await getSupabaseAdminClient()
    .from("festivals")
    .select(
      "id, name, deity_name, year, start_date, end_date, hero_title, hero_subtitle, hero_image, registration_prefix, registration_open_date, registration_close_date, status",
    )
    .eq("community_id", communityId)
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load festival: ${error.message}`);
  }
  if (!data) {
    throw new Error("No festival has been configured in Supabase.");
  }

  return {
    id: data.id,
    festivalName: data.name,
    deityName: data.deity_name ?? "",
    year: data.year,
    startDate: data.start_date,
    endDate: data.end_date,
    heroTitle: data.hero_title ?? data.name,
    heroSubtitle: data.hero_subtitle ?? "",
    heroImage: data.hero_image ?? "",
    registrationPrefix: data.registration_prefix ?? "",
    registrationOpenDate: data.registration_open_date ?? data.start_date,
    registrationCloseDate: data.registration_close_date ?? data.end_date,
    status: (data.status ?? "draft") as "draft" | "open" | "closed" | "archived",
  };
}
