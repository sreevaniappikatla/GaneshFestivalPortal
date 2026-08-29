import type { CommunityConfig, FestivalConfig } from "@/types";

export default function SiteFooter({
  community,
  festival,
}: {
  community: CommunityConfig | null;
  festival: FestivalConfig | null;
}) {
  if (!community || !festival) return null;

  return (
    <footer className="border-t border-gold-300/60 bg-cream-50 py-6">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm text-ink/60">
        <p>
          &copy; {new Date().getFullYear()} {community.name} &middot; {" "}
          {festival.festivalName} {festival.year}
        </p>
        <p className="mt-1">
          {community.location} &middot; {community.contactPhone} &middot; {" "}
          {community.contactEmail}
        </p>
      </div>
    </footer>
  );
}
