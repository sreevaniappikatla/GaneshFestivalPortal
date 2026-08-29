import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminScheduleManager from "@/components/admin/AdminScheduleManager";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";
import { getAdminScheduleEvents } from "@/services/scheduleAdmin.service";

export default async function AdminSchedulePage() {
  const community = await getCommunity();
  const festival = await getFestival(community.id);
  const events = await getAdminScheduleEvents(festival.id);

  return (
    <div>
      <AdminPageHeading
        title="Schedule"
        description="Manage festival events, times, venue details, and featured highlights."
      />
      <AdminScheduleManager festivalId={festival.id} initialEvents={events} />
    </div>
  );
}
