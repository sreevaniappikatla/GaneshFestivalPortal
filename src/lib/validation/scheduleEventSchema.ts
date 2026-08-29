import { z } from "zod";

export const scheduleEventCategorySchema = z.enum([
  "pooja",
  "cultural",
  "food",
  "kids",
  "celebration",
  "other",
]);

export const scheduleEventSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required.").max(120),
    description: z.string().trim().max(1000).optional().or(z.literal("")),
    date: z.string().min(1, "Date is required."),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time is required."),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time is required."),
    venue: z.string().trim().min(2, "Venue is required.").max(200),
    category: scheduleEventCategorySchema,
    highlighted: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .refine((values) => values.endTime > values.startTime, {
    message: "End time must be after the start time.",
    path: ["endTime"],
  });

export type ScheduleEventFormValues = z.infer<typeof scheduleEventSchema>;
