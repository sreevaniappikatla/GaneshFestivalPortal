import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminAnnouncementManager from "@/components/admin/AdminAnnouncementManager";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";
import { getAdminAnnouncements } from "@/services/announcementAdmin.service";

export default async function AdminAnnouncementsPage() {
  const community = await getCommunity();
  const festival = await getFestival(community.id);
  const announcements = await getAdminAnnouncements(community.id, festival.id);

  return (
    <div>
      <AdminPageHeading
        title="Announcements"
        description="Publish updates, schedule visibility windows, and highlight urgent community notices."
      />
      <AdminAnnouncementManager
        communityId={community.id}
        festivalId={festival.id}
        initialAnnouncements={announcements}
      />
    </div>
  );
}
