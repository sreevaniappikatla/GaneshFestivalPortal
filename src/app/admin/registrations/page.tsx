import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminRegistrationManager from "@/components/admin/AdminRegistrationManager";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";
import { getAdminRegistrations } from "@/services/registrationAdmin.service";

export default async function AdminRegistrationsPage() {
  const community = await getCommunity();
  const festival = await getFestival(community.id);
  const registrations = await getAdminRegistrations(festival.id);

  return (
    <div>
      <AdminPageHeading
        title="Registrations"
        description="Review registrations, track payment status, and update each pooja entry."
      />
      <AdminRegistrationManager festivalId={festival.id} initialRegistrations={registrations} />
    </div>
  );
}
