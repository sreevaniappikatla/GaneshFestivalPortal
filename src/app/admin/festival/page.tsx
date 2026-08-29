import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminFestivalSettings from "@/components/admin/AdminFestivalSettings";
import { getCommunity } from "@/services/community.service";
import { getFestivalSettings } from "@/services/festivalAdmin.service";

export default async function AdminFestivalPage() {
  const community = await getCommunity();
  const festival = await getFestivalSettings(community.id);

  return (
    <div>
      <AdminPageHeading
        title="Festival settings"
        description="Keep the event details, registration window, and hero content synced with the public website."
      />
      <AdminFestivalSettings initialSettings={festival} />
    </div>
  );
}
