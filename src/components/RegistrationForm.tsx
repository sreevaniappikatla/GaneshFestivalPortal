"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField, { inputClass } from "@/components/FormField";
import {
  createRegistrationSchema,
  type RegistrationFormValues,
} from "@/lib/validation/registrationSchema";
import { submitRegistration } from "@/services/registration.client";
import type { FestivalConfig, PoojaConfig, PoojaSlot } from "@/types";

export default function RegistrationForm({
  festival,
  festivalId,
  poojas,
  slots,
}: {
  festival: FestivalConfig;
  festivalId: string;
  poojas: PoojaConfig[];
  slots: PoojaSlot[];
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const availableSlots = slots.filter((slot) => slot.capacity === null || slot.registeredCount < slot.capacity);
  const activePoojas = poojas.filter(
    (pooja) => pooja.active && availableSlots.some((slot) => slot.poojaId === pooja.id),
  );
  const registrationSchema = createRegistrationSchema(festival.startDate, festival.endDate);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      residentName: "",
      unitNumber: "",
      phone: "",
      email: "",
      poojaId: "",
      poojaSlotId: "",
      poojaDate: festival.startDate,
      familyMembersCount: 1,
      gotram: "",
      familyNames: "",
      notes: "",
    },
  });

  const selectedPoojaId = watch("poojaId");
  const selectedSlotId = watch("poojaSlotId");
  const selectedSlots = availableSlots.filter((slot) => slot.poojaId === selectedPoojaId);

  useEffect(() => {
    const selectedSlot = availableSlots.find((slot) => slot.id === selectedSlotId);
    if (selectedSlot) setValue("poojaDate", selectedSlot.date, { shouldValidate: true });
  }, [availableSlots, selectedSlotId, setValue]);

  const onSubmit = async (values: RegistrationFormValues) => {
    setSubmitError(null);
    try {
      const registration = await submitRegistration({
        festivalId,
        ...values,
        email: values.email || undefined,
        gotram: values.gotram || undefined,
        familyNames: values.familyNames || undefined,
        notes: values.notes || undefined,
      });
      sessionStorage.setItem("gcf-registration-confirmation", JSON.stringify(registration));
      router.push(`/register/success?ref=${encodeURIComponent(registration.id)}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not complete your registration right now.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Resident Name" htmlFor="residentName" required error={errors.residentName?.message}>
          <input
            id="residentName"
            type="text"
            placeholder="e.g. Priya Sharma"
            className={inputClass(!!errors.residentName)}
            {...register("residentName")}
          />
        </FormField>

        <FormField
          label="Apartment / Villa Number"
          htmlFor="unitNumber"
          required
          error={errors.unitNumber?.message}
        >
          <input
            id="unitNumber"
            type="text"
            placeholder="e.g. B-204"
            className={inputClass(!!errors.unitNumber)}
            {...register("unitNumber")}
          />
        </FormField>

        <FormField label="Phone Number" htmlFor="phone" required error={errors.phone?.message}>
          <input
            id="phone"
            type="tel"
            placeholder="10-digit mobile number"
            className={inputClass(!!errors.phone)}
            {...register("phone")}
          />
        </FormField>

        <FormField label="Email Address" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={inputClass(!!errors.email)}
            {...register("email")}
          />
        </FormField>

        <FormField label="Select Pooja" htmlFor="poojaId" required error={errors.poojaId?.message}>
          <select
            id="poojaId"
            className={inputClass(!!errors.poojaId)}
            defaultValue=""
            {...register("poojaId")}
          >
            <option value="" disabled>
              Choose a pooja
            </option>
            {activePoojas.map((pooja) => {
              return (
                <option key={pooja.id} value={pooja.id}>
                  {pooja.name}
                </option>
              );
            })}
          </select>
        </FormField>

        <FormField label="Select Pooja Date / Slot" htmlFor="poojaSlotId" required error={errors.poojaSlotId?.message}>
          <select id="poojaSlotId" className={inputClass(!!errors.poojaSlotId)} {...register("poojaSlotId")}>
            <option value="" disabled>
              {selectedPoojaId ? "Choose a date and time" : "Choose a pooja first"}
            </option>
            {selectedSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.date} · {slot.startTime}–{slot.endTime}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Number of Family Members"
          htmlFor="familyMembersCount"
          required
          error={errors.familyMembersCount?.message}
        >
          <input
            id="familyMembersCount"
            type="number"
            min={1}
            max={20}
            className={inputClass(!!errors.familyMembersCount)}
            {...register("familyMembersCount")}
          />
        </FormField>

        <FormField
          label="Gotram"
          htmlFor="gotram"
          hint="If known — helps the priest during sankalpam"
          error={errors.gotram?.message}
        >
          <input
            id="gotram"
            type="text"
            placeholder="e.g. Kashyapa"
            className={inputClass(!!errors.gotram)}
            {...register("gotram")}
          />
        </FormField>
      </div>

      <FormField
        label="Family Names"
        htmlFor="familyNames"
        hint="Names of family members participating, separated by commas"
        error={errors.familyNames?.message}
      >
        <textarea
          id="familyNames"
          rows={2}
          placeholder="e.g. Priya Sharma, Raj Sharma, Anaya Sharma"
          className={inputClass(!!errors.familyNames)}
          {...register("familyNames")}
        />
      </FormField>

      <FormField label="Notes" htmlFor="notes" hint="Any special requests or information" error={errors.notes?.message}>
        <textarea
          id="notes"
          rows={3}
          placeholder="Optional"
          className={inputClass(!!errors.notes)}
          {...register("notes")}
        />
      </FormField>

      {submitError && (
        <p className="rounded-lg border border-maroon-400/50 bg-maroon-50 px-4 py-3 text-sm font-medium text-maroon-500" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-saffron-600 px-6 py-3 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-saffron-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Submitting…" : "Submit Registration"}
      </button>
    </form>
  );
}
