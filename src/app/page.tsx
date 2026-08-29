import Card from "@/components/Card";
import FestivalCountdown from "@/components/FestivalCountdown";
import TempleArch from "@/components/TempleArch";
import type { FeatureCardData } from "@/types";
import { formatDateRange } from "@/lib/utils";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";
import { getAnnouncements } from "@/services/announcement.service";

export const dynamic = "force-dynamic";

const features: FeatureCardData[] = [
  {
    title: "Festival Schedule",
    description: "View the full day-by-day schedule for the festival.",
    href: "/schedule",
    icon: "📅",
  },
  {
    title: "Today's Schedule",
    description: "See what's happening today at a glance.",
    href: "/today",
    icon: "🪔",
  },
  {
    title: "Register for Pooja",
    description: "Sign up for a pooja slot during the festival.",
    href: "/register",
    icon: "🙏",
  },
  {
    title: "Announcements",
    description: "Stay updated with the latest community announcements.",
    href: "/announcements",
    icon: "📢",
  },
];

export default async function HomePage() {
  const community = await getCommunity();
  const festival = await getFestival(community.id);
  const announcements = await getAnnouncements(community.id, festival.id);
  const urgentAnnouncements = announcements.filter((item) => item.priority === "urgent");
  const dateRange = formatDateRange(festival.startDate, festival.endDate);

  return (
    <div>
      {urgentAnnouncements.length > 0 && (
        <section className="border-b border-red-200 bg-red-50">
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="space-y-3">
              {urgentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="rounded-xl border border-red-300 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">Urgent announcement</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-maroon-500">{announcement.title}</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{announcement.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-temple-glow text-cream-50">
        {/* Subtle rangoli-dot texture */}
        <div
          className="absolute inset-0 bg-rangoli-dots opacity-40 [background-size:22px_22px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pb-14 pt-16 text-center sm:pt-20">
          <span className="text-3xl" aria-hidden="true">
            ॐ
          </span>
          <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.3em] text-gold-100">
            {festival.deityName}
          </p>

          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-cream-50 drop-shadow-sm sm:text-6xl">
            Ganapati Bappa Morya
          </h1>

          <p className="mt-4 max-w-2xl text-base text-cream-100/90 sm:text-lg">
            Welcome to the {community.name} {festival.festivalName} {" "}
            {festival.year} portal — schedules, daily pooja timings,
            registration, and announcements, all in one place.
          </p>

          <p className="mt-3 font-display text-lg font-semibold text-gold-100 sm:text-xl">
            {dateRange} &middot; {community.location}
          </p>

          <div className="mt-10">
            <FestivalCountdown
              targetDate={festival.startDate}
              targetLabel={festival.festivalName}
            />
          </div>
        </div>

        {/* Threshold arch into the content below */}
        <TempleArch className="relative block h-6 w-full text-cream sm:h-8" />
      </section>

      {/* Navigation cards */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-maroon-500 sm:text-3xl">
            Get Involved
          </h2>
          <p className="mt-2 text-ink/70">
            Everything you need for the celebrations, in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.href} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
}
