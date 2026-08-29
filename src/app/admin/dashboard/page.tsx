import AdminPageHeading from "@/components/admin/AdminPageHeading";
import StatCard from "@/components/admin/StatCard";
import { adminDashboardMock } from "@/config/adminDashboardMock";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const stats = [
    {
      label: "Total Pooja Registrations",
      value: String(adminDashboardMock.totalPoojaRegistrations),
      hint: `+${adminDashboardMock.totalRegistrationsThisWeek} this week`,
      accent: "positive" as const,
    },
    {
      label: "Today's Registrations",
      value: String(adminDashboardMock.todaysRegistrations),
      hint: "As of this morning",
      accent: "neutral" as const,
    },
    {
      label: "Amount Collected",
      value: formatCurrency(adminDashboardMock.amountCollected),
      hint: "Across all poojas",
      accent: "positive" as const,
    },
    {
      label: "Pending Payments",
      value: formatCurrency(adminDashboardMock.pendingPayments),
      hint: `${adminDashboardMock.pendingPaymentsCount} registrations`,
      accent: "warning" as const,
    },
    {
      label: "Cultural Participants",
      value: String(adminDashboardMock.culturalParticipants),
      hint: `Across ${adminDashboardMock.culturalEventsCount} events`,
      accent: "neutral" as const,
    },
    {
      label: "Volunteers",
      value: String(adminDashboardMock.volunteers),
      hint: "Signed up",
      accent: "neutral" as const,
    },
  ];

  return (
    <div>
      <AdminPageHeading
        title="Dashboard"
        description="Overview of festival registrations, payments, and participation."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
