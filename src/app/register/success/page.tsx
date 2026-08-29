"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import type { RegistrationConfirmation } from "@/services/registration.client";

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gold-200/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-ink/60">{label}</dt>
      <dd className={emphasize ? "font-display text-base font-bold text-maroon-500" : "font-medium text-ink"}>
        {value}
      </dd>
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [registration, setRegistration] = useState<RegistrationConfirmation | null | undefined>(undefined);

  useEffect(() => {
    if (!ref) {
      setRegistration(null);
      return;
    }
    try {
      const stored = sessionStorage.getItem("gcf-registration-confirmation");
      const parsed = stored ? (JSON.parse(stored) as RegistrationConfirmation) : null;
      setRegistration(parsed?.id === ref ? parsed : null);
    } catch {
      setRegistration(null);
    }
  }, [ref]);

  if (registration === undefined) {
    return <p className="text-center text-ink/60">Loading your registration…</p>;
  }

  if (!registration) {
    return (
      <div className="text-center">
        <p className="text-ink/70">We couldn&apos;t find that registration on this device.</p>
        <Link href="/register" className="mt-4 inline-block font-semibold text-saffron-600 hover:text-saffron-700">
          Back to registration
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <span className="text-5xl" aria-hidden="true">
        🙏
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold text-maroon-500 sm:text-3xl">
        Registration Successful
      </h1>
      <p className="mt-2 text-ink/70">
        Thank you, {registration.residentName}. Your pooja registration is confirmed.
      </p>

      <div className="mt-8 rounded-2xl border border-gold-300/60 bg-cream-50 p-6 text-left shadow-card">
        <dl className="space-y-3 text-sm">
          <Row label="Registration Number" value={registration.id} emphasize />
          <Row label="Pooja" value={registration.poojaName ?? registration.poojaId} />
          <Row label="Date" value={formatDate(registration.poojaDate)} />
          <Row label="Time" value={`${registration.slotStartTime.slice(0, 5)}–${registration.slotEndTime.slice(0, 5)}`} />
          <Row label="Unit" value={registration.unitNumber} />
          <Row label="Family Members" value={String(registration.familyMembersCount)} />
          {registration.amount > 0 && <Row label="Amount" value={`INR ${registration.amount.toLocaleString("en-IN")}`} />}
        </dl>
      </div>

      <p className="mt-6 text-xs text-ink/50">
        Ganapati Bappa Morya! 🙏
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/register"
          className="rounded-full bg-saffron-600 px-6 py-3 text-sm font-semibold text-cream-50 shadow-sm transition hover:bg-saffron-700"
        >
          Register Another Pooja
        </Link>
        <Link
          href="/"
          className="rounded-full border border-gold-300 bg-cream-50 px-6 py-3 text-sm font-semibold text-maroon-500 transition hover:border-gold-500"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Suspense fallback={<p className="text-center text-ink/60">Loading…</p>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
