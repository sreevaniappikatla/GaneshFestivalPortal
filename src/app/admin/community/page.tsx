import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminCommunitySettings from "@/components/admin/AdminCommunitySettings";
import { getCommunitySettings } from "@/services/communityAdmin.service";

export default async function AdminCommunityPage() {
  const community = await getCommunitySettings();

  return (
    <div>
      <AdminPageHeading
        title="Community settings"
        description="Update the resident-facing community branding, contact details, and color palette."
      />
      <AdminCommunitySettings initialSettings={community} />
    </div>
  );
}
