import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminPoojaManager from "@/components/admin/AdminPoojaManager";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";
import { getAdminPoojas } from "@/services/poojaAdmin.service";

export default async function AdminPoojasPage() {
  const community = await getCommunity();
  const festival = await getFestival(community.id);
  const poojas = await getAdminPoojas(festival.id);

  return (
    <div>
      <AdminPageHeading
        title="Poojas"
        description="Create, edit, and manage pooja availability, amounts, and time slots."
      />
      <AdminPoojaManager festivalId={festival.id} initialPoojas={poojas} />
    </div>
  );
}
