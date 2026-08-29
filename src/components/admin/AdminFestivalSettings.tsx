"use client";

import { useState } from "react";

import FormField, { inputClass } from "@/components/FormField";
import type { FestivalSettings } from "@/services/festivalAdmin.service";

export default function AdminFestivalSettings({
  initialSettings,
}: {
  initialSettings: FestivalSettings;
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
      const response = await fetch(`/api/admin/festival`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          festivalId: form.id,
          ...form,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        festival?: FestivalSettings;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save festival settings.");
      }

      if (payload.festival) {
        setForm(payload.festival);
      }

      setStatusMessage("Festival settings updated successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save festival settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function updateField<K extends keyof FestivalSettings>(
    field: K,
    value: FestivalSettings[K],
  ) {
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
          <FormField label="Festival name" htmlFor="festival-name" required>
            <input
              id="festival-name"
              value={form.festivalName}
              onChange={(event) => updateField("festivalName", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Year" htmlFor="festival-year" required>
            <input
              id="festival-year"
              type="number"
              value={form.year}
              onChange={(event) => updateField("year", Number(event.target.value))}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Start date" htmlFor="festival-start" required>
            <input
              id="festival-start"
              type="date"
              value={form.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="End date" htmlFor="festival-end" required>
            <input
              id="festival-end"
              type="date"
              value={form.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Deity name" htmlFor="festival-deity">
            <input
              id="festival-deity"
              value={form.deityName}
              onChange={(event) => updateField("deityName", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Festival status" htmlFor="festival-status">
            <select
              id="festival-status"
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as FestivalSettings["status"])
              }
              className={inputClass()}
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          <FormField label="Hero title" htmlFor="festival-hero-title" className="md:col-span-2">
            <input
              id="festival-hero-title"
              value={form.heroTitle}
              onChange={(event) => updateField("heroTitle", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Hero subtitle" htmlFor="festival-hero-subtitle" className="md:col-span-2">
            <input
              id="festival-hero-subtitle"
              value={form.heroSubtitle}
              onChange={(event) => updateField("heroSubtitle", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Hero image URL" htmlFor="festival-hero-image" className="md:col-span-2">
            <input
              id="festival-hero-image"
              value={form.heroImage}
              onChange={(event) => updateField("heroImage", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Registration opening date" htmlFor="festival-registration-open">
            <input
              id="festival-registration-open"
              type="date"
              value={form.registrationOpenDate}
              onChange={(event) => updateField("registrationOpenDate", event.target.value)}
              className={inputClass()}
            />
          </FormField>

          <FormField label="Registration closing date" htmlFor="festival-registration-close">
            <input
              id="festival-registration-close"
              type="date"
              value={form.registrationCloseDate}
              onChange={(event) => updateField("registrationCloseDate", event.target.value)}
              className={inputClass()}
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
          {isSaving ? "Saving..." : "Save festival settings"}
        </button>
      </div>
    </form>
  );
}
