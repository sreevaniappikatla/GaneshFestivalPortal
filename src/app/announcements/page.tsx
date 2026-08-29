import PageHeading from "@/components/PageHeading";
import { getAnnouncements } from "@/services/announcement.service";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const community = await getCommunity();
  const festival = await getFestival(community.id);
  const announcements = await getAnnouncements(community.id, festival.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeading
        title="Announcements"
        description="Community announcements will appear here."
      />
      {announcements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-orange-300 bg-white p-8 text-center text-gray-500">
          No announcements yet.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className={`rounded-xl border p-6 shadow-card ${
                announcement.priority === "urgent"
                  ? "border-red-300 bg-red-50"
                  : announcement.priority === "important"
                    ? "border-amber-300 bg-amber-50"
                    : "border-gold-300/60 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-saffron-600">
                  {new Date(announcement.postedAt).toLocaleDateString("en-IN")}
                </p>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  {announcement.priority}
                </span>
              </div>
              <h2 className="mt-2 font-display text-xl font-bold text-maroon-500">
                {announcement.title}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-ink/75">{announcement.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
