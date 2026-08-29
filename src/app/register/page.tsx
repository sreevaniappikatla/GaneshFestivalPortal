import PageHeading from "@/components/PageHeading";
import RegistrationForm from "@/components/RegistrationForm";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";
import { getAvailablePoojaSlots, getPoojas } from "@/services/pooja.service";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const community = await getCommunity();
  const festival = await getFestival(community.id);
  const poojas = await getPoojas(festival.id);
  const slots = await getAvailablePoojaSlots(festival.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeading
        title="Register for Pooja"
        description="Reserve your family's spot for a pooja during the festival."
      />
      <div className="rounded-2xl border border-gold-300/60 bg-cream-50 p-6 shadow-card sm:p-8">
        <RegistrationForm festival={festival} festivalId={festival.id} poojas={poojas} slots={slots} />
      </div>
    </div>
  );
}
