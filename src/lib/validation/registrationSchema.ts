import { z } from "zod";
export function createRegistrationSchema(startDate: string, endDate: string) {
  return z.object({
  residentName: z.string().trim().min(2, "Enter your full name"),
  unitNumber: z.string().trim().min(1, "Enter your apartment / villa number"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  email: z
    .union([
      z.string().trim().email("Enter a valid email address"),
      z.literal(""),
    ])
    .optional()
    .default(""),
  poojaId: z.string().min(1, "Select a pooja"),
  poojaSlotId: z.string().uuid("Select a valid pooja slot"),
  poojaDate: z
    .string()
    .min(1, "Select a date")
    .refine(
      (date) => date >= startDate && date <= endDate,
      `Select a date within the festival (${startDate} to ${endDate})`,
    ),
  familyMembersCount: z.coerce
    .number({ invalid_type_error: "Enter the number of family members" })
    .int("Enter a whole number")
    .min(1, "At least 1 family member")
    .max(20, "For groups larger than 20, please contact the committee directly"),
  gotram: z.string().trim().max(100, "Keep this under 100 characters").optional().or(z.literal("")),
  familyNames: z
    .string()
    .trim()
    .max(500, "Keep this under 500 characters")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(500, "Keep this under 500 characters").optional().or(z.literal("")),
  });
}

export type RegistrationFormValues = z.infer<ReturnType<typeof createRegistrationSchema>>;
