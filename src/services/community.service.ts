import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CommunityConfig } from "@/types";

export type CommunityRecord = CommunityConfig & { id: string };

export async function getCommunity(): Promise<CommunityRecord> {
  const { data, error } = await getSupabaseAdminClient()
    .from("communities")
    .select(
      "id, name, short_name, location, city, address, logo_url, contact_phone, contact_email, whatsapp_number, timezone, currency, primary_color, secondary_color, accent_color",
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load community: ${error.message}`);
  }
  if (!data) {
    throw new Error("No community has been configured in Supabase.");
  }

  return {
    id: data.id,
    name: data.name,
    shortName: data.short_name ?? "",
    location: data.location ?? data.city ?? "",
    address: data.address ?? "",
    city: data.city ?? data.location ?? "",
    logo: data.logo_url ?? "",
    contactPhone: data.contact_phone ?? "",
    contactEmail: data.contact_email ?? "",
    whatsappNumber: data.whatsapp_number ?? "",
    timezone: data.timezone ?? "Asia/Kolkata",
    currency: data.currency ?? "INR",
    primaryColor: data.primary_color ?? "#7c1d28",
    secondaryColor: data.secondary_color ?? "#f7d27d",
    accentColor: data.accent_color ?? "#d97706",
  };
}
