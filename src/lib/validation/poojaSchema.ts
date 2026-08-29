import { z } from "zod";

export const poojaSchema = z.object({
  name: z.string().trim().min(2, "Pooja name is required.").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number." })
    .min(0, "Amount cannot be negative.")
    .max(1000000, "Amount is too high."),
  maximumRegistrations: z.coerce
    .number({ invalid_type_error: "Maximum registrations must be a number." })
    .int("Maximum registrations must be a whole number.")
    .min(1, "Maximum registrations must be at least 1."),
  requiresPayment: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const poojaSlotSchema = z.object({
  slotDate: z.string().min(1, "Date is required."),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time is required."),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time is required."),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacity must be a number or empty." })
    .int("Capacity must be a whole number.")
    .min(1, "Capacity must be at least 1.")
    .nullable()
    .optional(),
  isActive: z.boolean().default(true),
}).refine((values) => values.endTime > values.startTime, {
  message: "End time must be after the start time.",
  path: ["endTime"],
});

export type PoojaFormValues = z.infer<typeof poojaSchema>;
export type PoojaSlotFormValues = z.infer<typeof poojaSlotSchema>;
