"use client";

import { useState } from "react";

import FormField, { inputClass } from "@/components/FormField";
import type { AdminAnnouncement, AnnouncementPriority } from "@/services/announcementAdmin.service";

const defaultForm = {
  title: "",
  message: "",
  priority: "normal" as AnnouncementPriority,
  isPublished: true,
  publishDate: new Date().toISOString().slice(0, 10),
  expiryDate: "",
};

export default function AdminAnnouncementManager({
  communityId,
  festivalId,
  initialAnnouncements,
}: {
  communityId: string;
  festivalId: string | null;
  initialAnnouncements: AdminAnnouncement[];
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
  }

  function startEditing(announcement: AdminAnnouncement) {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      isPublished: announcement.isPublished,
      publishDate: announcement.publishDate.slice(0, 10),
      expiryDate: announcement.expiryDate ? announcement.expiryDate.slice(0, 10) : "",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const endpoint = editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          festivalId,
          ...form,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        announcement?: AdminAnnouncement;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save announcement.");
      }

      if (!payload.announcement) {
        throw new Error("Announcement data was not returned.");
      }

      setAnnouncements((current) => {
        const next = editingId
          ? current.map((item) => (item.id === payload.announcement!.id ? payload.announcement! : item))
          : [payload.announcement!, ...current];

        return [...next].sort((a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
        );
      });

      resetForm();
      setStatusMessage(editingId ? "Announcement updated." : "Announcement created.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save announcement.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const target = announcements.find((item) => item.id === id);
    if (!target) return;

    const confirmed = window.confirm(`Delete “${target.title}”?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete announcement.");
      }

      setAnnouncements((current) => current.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
      setStatusMessage("Announcement deleted.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete announcement.",
      );
    }
  }

  function updateField<K extends keyof typeof defaultForm>(field: K, value: (typeof defaultForm)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon-500">
              Announcement editor
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-800">
              {editingId ? "Edit announcement" : "Create announcement"}
            </h2>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel edit
            </button>
          )}
        </div>

        {statusMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Title" htmlFor="announcement-title" required className="md:col-span-2">
              <input
                id="announcement-title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={inputClass()}
              />
            </FormField>

            <FormField label="Message" htmlFor="announcement-message" required className="md:col-span-2">
              <textarea
                id="announcement-message"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                className={`${inputClass()} min-h-32`}
              />
            </FormField>

            <FormField label="Priority" htmlFor="announcement-priority">
              <select
                id="announcement-priority"
                value={form.priority}
                onChange={(event) =>
                  updateField("priority", event.target.value as AnnouncementPriority)
                }
                className={inputClass()}
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </FormField>

            <FormField label="Enabled" htmlFor="announcement-enabled">
              <select
                id="announcement-enabled"
                value={String(form.isPublished)}
                onChange={(event) => updateField("isPublished", event.target.value === "true")}
                className={inputClass()}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </FormField>

            <FormField label="Publish date" htmlFor="announcement-publish-date">
              <input
                id="announcement-publish-date"
                type="date"
                value={form.publishDate}
                onChange={(event) => updateField("publishDate", event.target.value)}
                className={inputClass()}
              />
            </FormField>

            <FormField label="Expiry date" htmlFor="announcement-expiry-date">
              <input
                id="announcement-expiry-date"
                type="date"
                value={form.expiryDate}
                onChange={(event) => updateField("expiryDate", event.target.value)}
                className={inputClass()}
              />
            </FormField>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-maroon-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-maroon-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : editingId ? "Update announcement" : "Create announcement"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon-500">
            Existing announcements
          </p>
        </div>

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No announcements yet.
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-800">{announcement.title}</h3>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                        {announcement.priority}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        {announcement.isPublished ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {announcement.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Publish: {announcement.publishDate.slice(0, 10)}
                      {announcement.expiryDate ? ` • Expires: ${announcement.expiryDate.slice(0, 10)}` : " • No expiry"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(announcement)}
                      className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(announcement.id)}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
