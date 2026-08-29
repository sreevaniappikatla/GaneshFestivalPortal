"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormField, { inputClass } from "@/components/FormField";
import {
  poojaSchema,
  poojaSlotSchema,
  type PoojaFormValues,
  type PoojaSlotFormValues,
} from "@/lib/validation/poojaSchema";
import type { AdminPooja, AdminPoojaSlot } from "@/services/poojaAdmin.service";

const emptyPoojaValues: PoojaFormValues = {
  name: "",
  description: "",
  amount: 0,
  maximumRegistrations: 20,
  requiresPayment: false,
  isActive: true,
};

const emptySlotValues: PoojaSlotFormValues = {
  slotDate: "",
  startTime: "09:00",
  endTime: "10:00",
  capacity: null,
  isActive: true,
};

export default function AdminPoojaManager({
  festivalId,
  initialPoojas,
}: {
  festivalId: string;
  initialPoojas: AdminPooja[];
}) {
  const [poojas, setPoojas] = useState(initialPoojas);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slotEditingId, setSlotEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const poojaForm = useForm<PoojaFormValues>({
    resolver: zodResolver(poojaSchema),
    defaultValues: emptyPoojaValues,
  });

  const slotForm = useForm<PoojaSlotFormValues>({
    resolver: zodResolver(poojaSlotSchema),
    defaultValues: emptySlotValues,
  });

  const selectedPoojaId = poojaForm.watch("name");

  function resetPoojaForm() {
    poojaForm.reset(emptyPoojaValues);
    setEditingId(null);
    setErrorMessage(null);
  }

  function resetSlotForm() {
    slotForm.reset(emptySlotValues);
    setSlotEditingId(null);
    setErrorMessage(null);
  }

  function startEditingPooja(pooja: AdminPooja) {
    setEditingId(pooja.id);
    setErrorMessage(null);
    poojaForm.reset({
      name: pooja.name,
      description: pooja.description,
      amount: pooja.amount,
      maximumRegistrations: pooja.maximumRegistrations,
      requiresPayment: pooja.requiresPayment,
      isActive: pooja.isActive,
    });
  }

  function startEditingSlot(slot: AdminPoojaSlot) {
    setSlotEditingId(slot.id);
    setErrorMessage(null);
    slotForm.reset({
      slotDate: slot.slotDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      isActive: slot.isActive,
    });
  }

  async function savePooja(values: PoojaFormValues) {
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const endpoint = editingId ? `/api/admin/poojas/${editingId}` : "/api/admin/poojas";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId, ...values }),
      });

      const payload = (await response.json()) as { error?: string; pooja?: AdminPooja };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save pooja.");
      }

      if (!payload.pooja) {
        throw new Error("Pooja data was not returned.");
      }

      setPoojas((current) => {
        if (editingId) {
          return current.map((item) => (item.id === payload.pooja!.id ? payload.pooja! : item));
        }
        return [payload.pooja!, ...current];
      });

      resetPoojaForm();
      setStatusMessage(editingId ? "Pooja updated successfully." : "Pooja created successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save pooja.");
    }
  }

  async function handleDeletePooja(pooja: AdminPooja) {
    const confirmed = window.confirm(`Delete “${pooja.name}”? This also removes its slots.`);
    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/poojas/${pooja.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete pooja.");
      }

      setPoojas((current) => current.filter((item) => item.id !== pooja.id));
      if (editingId === pooja.id) {
        resetPoojaForm();
      }
      setStatusMessage("Pooja deleted successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete pooja.");
    }
  }

  async function saveSlot(values: PoojaSlotFormValues, poojaId: string) {
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const endpoint = slotEditingId ? `/api/admin/poojas/${poojaId}/slots/${slotEditingId}` : `/api/admin/poojas/${poojaId}/slots`;
      const method = slotEditingId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId, ...values }),
      });

      const payload = (await response.json()) as {
        error?: string;
        slot?: AdminPoojaSlot;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save slot.");
      }

      if (!payload.slot) {
        throw new Error("Slot data was not returned.");
      }

      setPoojas((current) =>
        current.map((pooja) => {
          if (pooja.id !== poojaId) return pooja;
          const nextSlots = slotEditingId
            ? pooja.slots.map((slot) => (slot.id === payload.slot!.id ? payload.slot! : slot))
            : [...pooja.slots, payload.slot!];
          return { ...pooja, slots: nextSlots }; 
        }),
      );

      resetSlotForm();
      setStatusMessage(slotEditingId ? "Slot updated successfully." : "Slot created successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save slot.");
    }
  }

  async function handleDeleteSlot(poojaId: string, slot: AdminPoojaSlot) {
    const confirmed = window.confirm(
      `Delete slot for ${slot.slotDate} from ${slot.startTime} to ${slot.endTime}?`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/poojas/${poojaId}/slots/${slot.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete slot.");
      }

      setPoojas((current) =>
        current.map((pooja) =>
          pooja.id === poojaId
            ? { ...pooja, slots: pooja.slots.filter((item) => item.id !== slot.id) }
            : pooja,
        ),
      );
      if (slotEditingId === slot.id) {
        resetSlotForm();
      }
      setStatusMessage("Slot deleted successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete slot.");
    }
  }

  async function togglePoojaStatus(pooja: AdminPooja) {
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/poojas/${pooja.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId, isActive: !pooja.isActive }),
      });

      const payload = (await response.json()) as { error?: string; pooja?: AdminPooja };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update pooja status.");
      }

      if (!payload.pooja) {
        throw new Error("Updated pooja data was not returned.");
      }

      setPoojas((current) =>
        current.map((item) => (item.id === payload.pooja!.id ? payload.pooja! : item)),
      );
      setStatusMessage(`Pooja ${payload.pooja.isActive ? "enabled" : "disabled"}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update pooja status.");
    }
  }

  async function toggleSlotStatus(poojaId: string, slot: AdminPoojaSlot) {
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/admin/poojas/${poojaId}/slots/${slot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId, isActive: !slot.isActive }),
      });

      const payload = (await response.json()) as { error?: string; slot?: AdminPoojaSlot };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update slot status.");
      }

      if (!payload.slot) {
        throw new Error("Updated slot data was not returned.");
      }

      setPoojas((current) =>
        current.map((pooja) =>
          pooja.id === poojaId
            ? {
                ...pooja,
                slots: pooja.slots.map((item) =>
                  item.id === payload.slot!.id ? payload.slot! : item,
                ),
              }
            : pooja,
        ),
      );
      setStatusMessage(`Slot ${payload.slot.isActive ? "enabled" : "disabled"}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update slot status.");
    }
  }

  const hasSlotContext = poojas.some((pooja) => pooja.slots.length > 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gold-200 bg-white p-5 shadow-card">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon-500">
              Pooja setup
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              {editingId ? "Edit pooja" : "Create pooja"}
            </h2>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetPoojaForm}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={poojaForm.handleSubmit(savePooja)} noValidate className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Pooja name" htmlFor="name" required error={poojaForm.formState.errors.name?.message}>
              <input
                id="name"
                type="text"
                className={inputClass(!!poojaForm.formState.errors.name)}
                placeholder="Ganesh Abhishekam"
                {...poojaForm.register("name")}
              />
            </FormField>

            <FormField label="Maximum registrations" htmlFor="maximumRegistrations" required error={poojaForm.formState.errors.maximumRegistrations?.message}>
              <input
                id="maximumRegistrations"
                type="number"
                min={1}
                className={inputClass(!!poojaForm.formState.errors.maximumRegistrations)}
                {...poojaForm.register("maximumRegistrations")}
              />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="description" error={poojaForm.formState.errors.description?.message}>
            <textarea
              id="description"
              rows={3}
              className={inputClass(!!poojaForm.formState.errors.description)}
              placeholder="Describe the pooja, ritual, or participation notes"
              {...poojaForm.register("description")}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Amount" htmlFor="amount" error={poojaForm.formState.errors.amount?.message}>
              <input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                className={inputClass(!!poojaForm.formState.errors.amount)}
                {...poojaForm.register("amount")}
              />
            </FormField>

            <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...poojaForm.register("requiresPayment")} className="h-4 w-4 rounded border-maroon-300 text-maroon-600 focus:ring-maroon-200" />
                Payment required
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...poojaForm.register("isActive")} className="h-4 w-4 rounded border-maroon-300 text-maroon-600 focus:ring-maroon-200" />
                Active
              </label>
            </div>
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
              className="rounded-xl bg-maroon-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-maroon-700"
            >
              {editingId ? "Save pooja" : "Create pooja"}
            </button>
            <button
              type="button"
              onClick={resetPoojaForm}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {poojas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No poojas exist yet. Create one to populate festival registration options.
          </div>
        ) : (
          poojas.map((pooja) => (
            <div key={pooja.id} className="rounded-2xl border border-gold-200 bg-white p-5 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-ink">{pooja.name}</h3>
                    {!pooja.isActive && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        Disabled
                      </span>
                    )}
                    {pooja.requiresPayment && (
                      <span className="rounded-full bg-saffron-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-saffron-700">
                        Payment required
                      </span>
                    )}
                  </div>
                  {pooja.description && <p className="mt-2 text-sm text-slate-600">{pooja.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span>Amount: ₹{pooja.amount.toFixed(2)}</span>
                    <span>Limit: {pooja.maximumRegistrations}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEditingPooja(pooja)}
                    className="rounded-lg border border-maroon-200 bg-white px-3 py-1.5 text-sm font-medium text-maroon-600 hover:bg-maroon-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePoojaStatus(pooja)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {pooja.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePooja(pooja)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-base font-semibold text-ink">Available slots</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSlotEditingId(null);
                      slotForm.reset(emptySlotValues);
                    }}
                    className="rounded-lg border border-maroon-200 bg-white px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-maroon-600"
                  >
                    Add slot
                  </button>
                </div>

                <form
                  onSubmit={slotForm.handleSubmit((values) => saveSlot(values, pooja.id))}
                  noValidate
                  className="mb-4 grid gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-3 md:grid-cols-5"
                >
                  <input
                    type="date"
                    className={inputClass(!!slotForm.formState.errors.slotDate)}
                    {...slotForm.register("slotDate")}
                    placeholder="Date"
                  />
                  <input
                    type="time"
                    className={inputClass(!!slotForm.formState.errors.startTime)}
                    {...slotForm.register("startTime")}
                  />
                  <input
                    type="time"
                    className={inputClass(!!slotForm.formState.errors.endTime)}
                    {...slotForm.register("endTime")}
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Capacity"
                    className={inputClass(!!slotForm.formState.errors.capacity)}
                    {...slotForm.register("capacity")}
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input type="checkbox" {...slotForm.register("isActive")} className="h-4 w-4 rounded border-maroon-300 text-maroon-600 focus:ring-maroon-200" />
                      Active
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg bg-maroon-600 px-3 py-2 text-xs font-semibold text-white hover:bg-maroon-700"
                    >
                      {slotEditingId ? "Save" : "Add"}
                    </button>
                  </div>
                </form>

                {pooja.slots.length === 0 ? (
                  <p className="text-sm text-slate-500">No slots configured yet.</p>
                ) : (
                  <div className="space-y-2">
                    {pooja.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="text-sm text-slate-700">
                          <span className="font-semibold">{slot.slotDate}</span> • {slot.startTime}–{slot.endTime}
                          {slot.capacity !== null && <span> • Capacity: {slot.capacity}</span>}
                          {!slot.isActive && <span className="ml-2 text-slate-500">(disabled)</span>}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingSlot(slot)}
                            className="rounded-lg border border-maroon-200 bg-white px-2.5 py-1.5 text-xs font-medium text-maroon-600 hover:bg-maroon-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSlotStatus(pooja.id, slot)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            {slot.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(pooja.id, slot)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
