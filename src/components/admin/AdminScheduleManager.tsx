"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormField, { inputClass } from "@/components/FormField";
import {
  scheduleEventSchema,
  type ScheduleEventFormValues,
} from "@/lib/validation/scheduleEventSchema";
import type { AdminScheduleEvent } from "@/services/scheduleAdmin.service";

const defaultValues: ScheduleEventFormValues = {
  title: "",
  description: "",
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  venue: "",
  category: "pooja",
  highlighted: false,
  isActive: true,
};

export default function AdminScheduleManager({
  festivalId,
  initialEvents,
}: {
  festivalId: string;
  initialEvents: AdminScheduleEvent[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ScheduleEventFormValues>({
    resolver: zodResolver(scheduleEventSchema),
    defaultValues,
  });

  const selectedCategory = watch("category");

  const categoryOptions = useMemo(
    () => [
      { label: "Pooja", value: "pooja" },
      { label: "Cultural", value: "cultural" },
      { label: "Food", value: "food" },
      { label: "Kids", value: "kids" },
      { label: "Celebration", value: "celebration" },
      { label: "Other", value: "other" },
    ],
    [],
  );

  function resetForm() {
    reset(defaultValues);
    setEditingId(null);
    setErrorMessage(null);
  }

  function startEditing(event: AdminScheduleEvent) {
    setEditingId(event.id);
    setStatusMessage(null);
    setErrorMessage(null);
    reset({
      title: event.title,
      description: event.description ?? "",
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      category: event.category,
      highlighted: event.highlighted,
      isActive: event.isActive,
    });
  }

  async function saveEvent(values: ScheduleEventFormValues) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/schedule/${editingId}` : "/api/admin/schedule";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId, ...values }),
      });

      const payload = (await response.json()) as {
        error?: string;
        event?: AdminScheduleEvent;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save schedule event.");
      }

      if (!payload.event) {
        throw new Error("Event data was not returned.");
      }

      setEvents((current) => {
        const next = editingId
          ? current.map((event) => (event.id === payload.event!.id ? payload.event! : event))
          : [payload.event!, ...current];

        return [...next].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
      });

      resetForm();
      setStatusMessage(editingId ? "Event updated successfully." : "Event added successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save schedule event.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(event: AdminScheduleEvent) {
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/schedule/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId, isActive: !event.isActive }),
      });

      const payload = (await response.json()) as {
        error?: string;
        event?: AdminScheduleEvent;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update event status.");
      }

      if (!payload.event) {
        throw new Error("Updated event data was not returned.");
      }

      setEvents((current) =>
        current
          .map((item) => (item.id === payload.event!.id ? payload.event! : item))
          .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
      );
      setStatusMessage(`Event ${payload.event.isActive ? "enabled" : "disabled"}.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update event status.",
      );
    }
  }

  async function handleDelete(event: AdminScheduleEvent) {
    const confirmed = window.confirm(
      `Delete “${event.title}” scheduled for ${event.date}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/schedule/${event.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete event.");
      }

      setEvents((current) => current.filter((item) => item.id !== event.id));
      if (editingId === event.id) {
        resetForm();
      }
      setStatusMessage("Event deleted successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete event.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gold-200 bg-white p-5 shadow-card">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon-500">
              Manage schedule
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              {editingId ? "Edit event" : "Add event"}
            </h2>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(saveEvent)} className="space-y-5" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Title" htmlFor="title" required error={errors.title?.message}>
              <input
                id="title"
                type="text"
                placeholder="Sthapana ceremony"
                className={inputClass(!!errors.title)}
                {...register("title")}
              />
            </FormField>

            <FormField label="Category" htmlFor="category" required error={errors.category?.message}>
              <select
                id="category"
                className={inputClass(!!errors.category)}
                {...register("category")}
                value={selectedCategory}
                onChange={(event) => setValue("category", event.target.value as ScheduleEventFormValues["category"], { shouldValidate: true })}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Date" htmlFor="date" required error={errors.date?.message}>
              <input
                id="date"
                type="date"
                className={inputClass(!!errors.date)}
                {...register("date")}
              />
            </FormField>

            <FormField label="Venue" htmlFor="venue" required error={errors.venue?.message}>
              <input
                id="venue"
                type="text"
                placeholder="Main hall"
                className={inputClass(!!errors.venue)}
                {...register("venue")}
              />
            </FormField>

            <FormField label="Start time" htmlFor="startTime" required error={errors.startTime?.message}>
              <input
                id="startTime"
                type="time"
                className={inputClass(!!errors.startTime)}
                {...register("startTime")}
              />
            </FormField>

            <FormField label="End time" htmlFor="endTime" required error={errors.endTime?.message}>
              <input
                id="endTime"
                type="time"
                className={inputClass(!!errors.endTime)}
                {...register("endTime")}
              />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="description" error={errors.description?.message}>
            <textarea
              id="description"
              rows={3}
              placeholder="Optional notes or instructions"
              className={inputClass(!!errors.description)}
              {...register("description")}
            />
          </FormField>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" {...register("highlighted")} className="h-4 w-4 rounded border-maroon-300 text-maroon-600 focus:ring-maroon-200" />
              Highlight event
            </label>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-maroon-300 text-maroon-600 focus:ring-maroon-200" />
              Enable event
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {statusMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {statusMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-maroon-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-maroon-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : editingId ? "Save changes" : "Add event"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-gold-200 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">Current events</h3>
          <span className="rounded-full bg-cream-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-ink/70">
            {events.length} total
          </span>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No events yet. Add the first item to populate the festival schedule.
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-semibold text-ink">{event.title}</h4>
                      {event.highlighted && (
                        <span className="rounded-full bg-saffron-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-saffron-700">
                          Highlighted
                        </span>
                      )}
                      {!event.isActive && (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {event.date} • {event.startTime}–{event.endTime} • {event.venue}
                    </p>
                    {event.description && (
                      <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(event)}
                      className="rounded-lg border border-maroon-200 bg-white px-3 py-1.5 text-sm font-medium text-maroon-600 hover:bg-maroon-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(event)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {event.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(event)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
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
