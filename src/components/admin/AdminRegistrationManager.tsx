"use client";

import { useMemo, useState } from "react";

import type {
  AdminPaymentStatus,
  AdminRegistration,
  AdminRegistrationStatus,
} from "@/services/registrationAdmin.service";

const paymentStatusLabels: Record<AdminPaymentStatus, string> = {
  not_required: "Not Required",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

const registrationStatusLabels: Record<AdminRegistrationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminRegistrationManager({
  festivalId,
  initialRegistrations,
}: {
  festivalId: string;
  initialRegistrations: AdminRegistration[];
}) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [selectedRegistration, setSelectedRegistration] = useState<AdminRegistration | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [poojaFilter, setPoojaFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusyId, setIsBusyId] = useState<string | null>(null);

  const poojaOptions = useMemo(
    () => [...new Set(registrations.map((registration) => registration.poojaName))].sort(),
    [registrations],
  );

  const paymentOptions = useMemo(
    () =>
      ["all", "not_required", "pending", "paid", "failed"] as Array<
        "all" | AdminPaymentStatus
      >,
    [],
  );

  const statusOptions = useMemo(
    () =>
      ["all", "pending", "confirmed", "completed", "cancelled"] as Array<
        "all" | AdminRegistrationStatus
      >,
    [],
  );

  const dateOptions = useMemo(
    () => [...new Set(registrations.map((registration) => registration.poojaDate))].sort(),
    [registrations],
  );

  const filteredRegistrations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return registrations.filter((registration) => {
      const matchesPooja = poojaFilter === "all" || registration.poojaName === poojaFilter;
      const matchesDate = dateFilter === "all" || registration.poojaDate === dateFilter;
      const matchesPayment =
        paymentFilter === "all" || registration.paymentStatus === paymentFilter;
      const matchesStatus = statusFilter === "all" || registration.status === statusFilter;

      const searchable = [
        registration.registrationNumber,
        registration.residentName,
        registration.unitNumber,
        registration.phone,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = query.length === 0 || searchable.includes(query);

      return (
        matchesPooja &&
        matchesDate &&
        matchesPayment &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [dateFilter, paymentFilter, poojaFilter, registrations, searchTerm, statusFilter]);

  async function updateRegistrationAction(
    registrationId: string,
    action: "confirm" | "cancel" | "complete" | "mark-payment-received",
  ) {
    const registration = registrations.find((item) => item.id === registrationId);
    if (!registration) {
      return;
    }

    if (action === "cancel") {
      const confirmed = window.confirm(
        `Cancel registration ${registration.registrationNumber} for ${registration.residentName}?`,
      );
      if (!confirmed) {
        return;
      }
    }

    setIsBusyId(registrationId);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId, action }),
      });

      const payload = (await response.json()) as {
        error?: string;
        registration?: AdminRegistration;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update registration.");
      }

      if (!payload.registration) {
        throw new Error("Updated registration was not returned.");
      }

      setRegistrations((current) =>
        current.map((item) => (item.id === payload.registration!.id ? payload.registration! : item)),
      );
      setSelectedRegistration(payload.registration);
      setStatusMessage(`Registration ${payload.registration.registrationNumber} updated.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update registration.",
      );
    } finally {
      setIsBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
        <div className="grid gap-3 md:grid-cols-5">
          <label className="md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Search</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Registration no, name, apartment, phone"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-maroon-300 focus:bg-white"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Pooja</span>
            <select
              value={poojaFilter}
              onChange={(event) => setPoojaFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-maroon-300 focus:bg-white"
            >
              <option value="all">All</option>
              {poojaOptions.map((pooja) => (
                <option key={pooja} value={pooja}>
                  {pooja}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Date</span>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-maroon-300 focus:bg-white"
            >
              <option value="all">All</option>
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Payment</span>
            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-maroon-300 focus:bg-white"
            >
              {paymentOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All" : paymentStatusLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-start-3 md:col-end-6">
            <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-maroon-300 focus:bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All" : registrationStatusLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Registration #</th>
                <th className="px-4 py-3 font-semibold">Resident Name</th>
                <th className="px-4 py-3 font-semibold">Apartment</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Pooja</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Registered</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
                    No registrations match the current filters.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="border-t border-slate-200 align-top hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedRegistration(registration)}
                        className="text-left text-maroon-600 hover:underline"
                      >
                        {registration.registrationNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{registration.residentName}</td>
                    <td className="px-4 py-3 text-slate-700">{registration.unitNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{registration.phone}</td>
                    <td className="px-4 py-3 text-slate-700">{registration.poojaName}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(registration.poojaDate)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(registration.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {paymentStatusLabels[registration.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-maroon-50 px-2 py-1 text-xs font-medium text-maroon-700">
                        {registrationStatusLabels[registration.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDateTime(registration.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateRegistrationAction(registration.id, "confirm")}
                          disabled={isBusyId === registration.id}
                          className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRegistrationAction(registration.id, "cancel")}
                          disabled={isBusyId === registration.id}
                          className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRegistrationAction(registration.id, "complete")}
                          disabled={isBusyId === registration.id}
                          className="rounded-md bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRegistrationAction(registration.id, "mark-payment-received")}
                          disabled={isBusyId === registration.id}
                          className="rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Payment Received
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRegistration && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon-500">
                  Registration details
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-800">
                  {selectedRegistration.registrationNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRegistration(null)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Resident name
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {selectedRegistration.residentName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Apartment
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {selectedRegistration.unitNumber}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {selectedRegistration.phone}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {selectedRegistration.email || "Not mentioned"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Pooja
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {selectedRegistration.poojaName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Date
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {formatDate(selectedRegistration.poojaDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Amount
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {formatCurrency(selectedRegistration.amount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Registration status
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {registrationStatusLabels[selectedRegistration.status]}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Payment status
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {paymentStatusLabels[selectedRegistration.paymentStatus]}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Family members
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {selectedRegistration.familyMembersCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Registered on
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {formatDateTime(selectedRegistration.createdAt)}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Gotram
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {selectedRegistration.gotram || "Not mentioned"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Family names
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {selectedRegistration.familyNames || "Not mentioned"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Notes
                </p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {selectedRegistration.notes || "Not mentioned"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateRegistrationAction(selectedRegistration.id, "confirm")}
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => updateRegistrationAction(selectedRegistration.id, "cancel")}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => updateRegistrationAction(selectedRegistration.id, "complete")}
                className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600"
              >
                Mark Complete
              </button>
              <button
                type="button"
                onClick={() => updateRegistrationAction(selectedRegistration.id, "mark-payment-received")}
                className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-400"
              >
                Mark Payment Received
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
