"use client";

import { useState } from "react";

import FormField, { inputClass } from "@/components/FormField";
import type { CommunitySettings } from "@/services/communityAdmin.service";

export default function AdminCommunitySettings({
  initialSettings,
}: {
  initialSettings: CommunitySettings;
}) {
  const [form, setForm] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/community`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: form.id,
          ...form,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        community?: CommunitySettings;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save community settings.");
      }

      if (payload.community) {
        setForm(payload.community);
      }

      setStatusMessage("Community settings updated successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save community settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(field: keyof CommunitySettings, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {statusMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Name" htmlFor="community-name" required>
            <input
              id="community-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Short name" htmlFor="community-short-name" required>
            <input
              id="community-short-name"
              value={form.shortName}
              onChange={(event) => updateField("shortName", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Logo URL" htmlFor="community-logo">
            <input
              id="community-logo"
              value={form.logo}
              onChange={(event) => updateField("logo", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="City" htmlFor="community-city" required>
            <input
              id="community-city"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Address" htmlFor="community-address" className="md:col-span-2">
            <textarea
              id="community-address"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              className={`${inputClass()} min-h-24`}
            />
          </FormField>

          <FormField label="Email" htmlFor="community-email">
            <input
              id="community-email"
              type="email"
              value={form.contactEmail}
              onChange={(event) => updateField("contactEmail", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Phone" htmlFor="community-phone">
            <input
              id="community-phone"
              value={form.contactPhone}
              onChange={(event) => updateField("contactPhone", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="WhatsApp" htmlFor="community-whatsapp">
            <input
              id="community-whatsapp"
              value={form.whatsappNumber}
              onChange={(event) => updateField("whatsappNumber", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Timezone" htmlFor="community-timezone">
            <input
              id="community-timezone"
              value={form.timezone}
              onChange={(event) => updateField("timezone", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Currency" htmlFor="community-currency">
            <input
              id="community-currency"
              value={form.currency}
              onChange={(event) => updateField("currency", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Primary color" htmlFor="community-primary-color">
            <input
              id="community-primary-color"
              type="color"
              value={form.primaryColor}
              onChange={(event) => updateField("primaryColor", event.target.value)}
              className="h-11 w-full rounded-lg border border-gold-300 bg-white p-1"
            />
          </FormField>

          <FormField label="Secondary color" htmlFor="community-secondary-color">
            <input
              id="community-secondary-color"
              type="color"
              value={form.secondaryColor}
              onChange={(event) => updateField("secondaryColor", event.target.value)}
              className="h-11 w-full rounded-lg border border-gold-300 bg-white p-1"
            />
          </FormField>

          <FormField label="Accent color" htmlFor="community-accent-color">
            <input
              id="community-accent-color"
              type="color"
              value={form.accentColor}
              onChange={(event) => updateField("accentColor", event.target.value)}
              className="h-11 w-full rounded-lg border border-gold-300 bg-white p-1"
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-maroon-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-maroon-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save community settings"}
        </button>
      </div>
    </form>
  );
}
