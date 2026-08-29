import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CommunityConfig } from "@/types";

export type CommunitySettings = CommunityConfig & {
  id: string;
  address: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

export async function getCommunitySettings(): Promise<CommunitySettings> {
  const { data, error } = await getSupabaseAdminClient()
    .from("communities")
    .select(
      "id, name, short_name, location, address, logo_url, contact_phone, contact_email, whatsapp_number, timezone, currency, primary_color, secondary_color, accent_color",
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load community settings: ${error.message}`);
  }

  if (!data) {
    throw new Error("No community settings found in Supabase.");
  }

  return {
    id: data.id,
    name: data.name ?? "",
    shortName: data.short_name ?? "",
    location: data.location ?? "",
    address: data.address ?? "",
    city: data.location ?? "",
    logo: data.logo_url ?? "/logo.png",
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

export async function updateCommunitySettings(
  communityId: string,
  input: {
    name: string;
    shortName: string;
    logo: string;
    address: string;
    city: string;
    email: string;
    phone: string;
    whatsapp: string;
    timezone: string;
    currency: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  },
): Promise<CommunitySettings> {
  const { data, error } = await getSupabaseAdminClient()
    .from("communities")
    .update({
      name: input.name.trim(),
      short_name: input.shortName.trim() || null,
      logo_url: input.logo.trim() || null,
      address: input.address.trim() || null,
      city: input.city.trim() || null,
      location: input.city.trim() || null,
      contact_email: input.email.trim() || null,
      contact_phone: input.phone.trim() || null,
      whatsapp_number: input.whatsapp.trim() || null,
      timezone: input.timezone.trim() || "Asia/Kolkata",
      currency: input.currency.trim().toUpperCase() || "INR",
      primary_color: input.primaryColor.trim() || "#7c1d28",
      secondary_color: input.secondaryColor.trim() || "#f7d27d",
      accent_color: input.accentColor.trim() || "#d97706",
    })
    .eq("id", communityId)
    .select(
      "id, name, short_name, location, city, address, logo_url, contact_phone, contact_email, whatsapp_number, timezone, currency, primary_color, secondary_color, accent_color",
    )
    .single();

  if (error) {
    throw new Error(`Unable to save community settings: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name ?? "",
    shortName: data.short_name ?? "",
    location: data.location ?? "",
    address: data.address ?? "",
    city: data.location ?? "",
    logo: data.logo_url ?? "/logo.png",
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
