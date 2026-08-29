import PageHeading from "@/components/PageHeading";
import EventCard from "@/components/EventCard";
import { getCurrentTimeInTimezone, getTodayInTimezone } from "@/lib/datetime";
import { getEventsForDate, getEventTimeStatus } from "@/lib/schedule";
import { formatDate } from "@/lib/utils";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";
import { getFestivalSchedule } from "@/services/schedule.service";

// Today's date/time must be computed fresh on every request (in the
// community's configured timezone), not baked in at build time.
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const community = await getCommunity();
  const festival = await getFestival(community.id);
  const scheduleEvents = await getFestivalSchedule(festival.id);
  const today = getTodayInTimezone(community.timezone);
  const nowTime = getCurrentTimeInTimezone(community.timezone);

  const todaysEvents = getEventsForDate(scheduleEvents, today);
  const eventsWithStatus = todaysEvents.map((event) => ({
    event,
    status: getEventTimeStatus(event, nowTime),
  }));

  // The next event that hasn't concluded yet — either happening right
  // now, or still to come.
  const nextIndex = eventsWithStatus.findIndex(({ status }) => status !== "past");
  const hasEvents = todaysEvents.length > 0;
  const allConcluded = hasEvents && nextIndex === -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeading title="Today's Schedule" description={formatDate(today)} />

      {!hasEvents && (
        <div className="rounded-2xl border border-dashed border-gold-300 bg-cream-50 p-8 text-center text-ink/70">
          No festival events are scheduled today.
        </div>
      )}

      {allConcluded && (
        <div className="rounded-2xl border border-dashed border-gold-300 bg-cream-50 p-8 text-center text-ink/70">
          Today&apos;s programs have concluded. See you tomorrow! 🙏
        </div>
      )}

      {hasEvents && !allConcluded && (
        <div className="space-y-5">
          {eventsWithStatus.map(({ event, status }, index) => {
            const isNext = index === nextIndex;
            return (
              <EventCard
                key={event.id}
                event={event}
                showDescription={false}
                emphasize={isNext}
                muted={status === "past"}
                statusLabel={
                  isNext
                    ? status === "current"
                      ? "Happening now"
                      : "Up next"
                    : status === "past"
                      ? "Completed"
                      : undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
