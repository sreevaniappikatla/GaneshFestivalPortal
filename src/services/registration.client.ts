import type { Registration } from "@/types";

export type RegistrationConfirmation = Registration & {
  slotStartTime: string;
  slotEndTime: string;
  amount: number;
  paymentStatus: string;
  status: string;
};

export async function submitRegistration(
  payload: Record<string, unknown>,
): Promise<RegistrationConfirmation> {
  const response = await fetch("/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as { registration?: RegistrationConfirmation; error?: string };

  if (!response.ok || !result.registration) {
    throw new Error(result.error ?? "We could not complete your registration right now.");
  }

  return result.registration;
}
