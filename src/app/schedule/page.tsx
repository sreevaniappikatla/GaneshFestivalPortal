import PageHeading from "@/components/PageHeading";
import ScheduleView from "@/components/ScheduleView";
import { formatDateRange } from "@/lib/utils";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";
import { getFestivalSchedule } from "@/services/schedule.service";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const community = await getCommunity();
  const festival = await getFestival(community.id);
  const scheduleEvents = await getFestivalSchedule(festival.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeading
        title="Festival Schedule"
        description={`${festival.festivalName} ${festival.year} · ${formatDateRange(
          festival.startDate,
          festival.endDate,
        )}`}
      />
      <ScheduleView events={scheduleEvents} />
    </div>
  );
}
