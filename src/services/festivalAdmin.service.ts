import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FestivalConfig } from "@/types";

export type FestivalSettings = FestivalConfig & {
  id: string;
  heroImage: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  status: "draft" | "open" | "closed" | "archived";
};

export async function getFestivalSettings(communityId: string): Promise<FestivalSettings> {
  const { data, error } = await getSupabaseAdminClient()
    .from("festivals")
    .select(
      "id, name, deity_name, year, start_date, end_date, hero_title, hero_subtitle, hero_image, registration_open_date, registration_close_date, status, registration_prefix",
    )
    .eq("community_id", communityId)
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load festival settings: ${error.message}`);
  }

  if (!data) {
    throw new Error("No festival settings found in Supabase.");
  }

  return {
    id: data.id,
    festivalName: data.name ?? "",
    deityName: data.deity_name ?? "",
    year: Number(data.year ?? new Date().getFullYear()),
    startDate: data.start_date ?? "",
    endDate: data.end_date ?? "",
    heroTitle: data.hero_title ?? "",
    heroSubtitle: data.hero_subtitle ?? "",
    heroImage: data.hero_image ?? "",
    registrationPrefix: data.registration_prefix ?? "GCF",
    registrationOpenDate: data.registration_open_date ?? data.start_date ?? "",
    registrationCloseDate: data.registration_close_date ?? data.end_date ?? "",
    status: (data.status ?? "draft") as FestivalSettings["status"],
  };
}

export async function updateFestivalSettings(
  festivalId: string,
  input: {
    festivalName: string;
    year: number;
    startDate: string;
    endDate: string;
    deityName: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    registrationOpenDate: string;
    registrationCloseDate: string;
    status: FestivalSettings["status"];
  },
): Promise<FestivalSettings> {
  const { data, error } = await getSupabaseAdminClient()
    .from("festivals")
    .update({
      name: input.festivalName.trim(),
      year: Number(input.year),
      start_date: input.startDate,
      end_date: input.endDate,
      deity_name: input.deityName.trim() || null,
      hero_title: input.heroTitle.trim() || null,
      hero_subtitle: input.heroSubtitle.trim() || null,
      hero_image: input.heroImage.trim() || null,
      registration_open_date: input.registrationOpenDate || null,
      registration_close_date: input.registrationCloseDate || null,
      status: input.status,
      registration_prefix: input.festivalName.trim().slice(0, 3).toUpperCase() || "GCF",
    })
    .eq("id", festivalId)
    .select(
      "id, name, deity_name, year, start_date, end_date, hero_title, hero_subtitle, hero_image, registration_open_date, registration_close_date, status, registration_prefix",
    )
    .single();

  if (error) {
    throw new Error(`Unable to save festival settings: ${error.message}`);
  }

  return {
    id: data.id,
    festivalName: data.name ?? "",
    deityName: data.deity_name ?? "",
    year: Number(data.year ?? new Date().getFullYear()),
    startDate: data.start_date ?? "",
    endDate: data.end_date ?? "",
    heroTitle: data.hero_title ?? "",
    heroSubtitle: data.hero_subtitle ?? "",
    heroImage: data.hero_image ?? "",
    registrationPrefix: data.registration_prefix ?? "GCF",
    registrationOpenDate: data.registration_open_date ?? data.start_date ?? "",
    registrationCloseDate: data.registration_close_date ?? data.end_date ?? "",
    status: (data.status ?? "draft") as FestivalSettings["status"],
  };
}
