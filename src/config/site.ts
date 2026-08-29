import { communityConfig } from "@/config/community";
import { festivalConfig } from "@/config/festival";

// Site-level metadata, derived from community + festival configuration.
// Do not hard-code the community or festival name here — pull it in.
export const siteConfig = {
  name: `${festivalConfig.heroTitle} — ${communityConfig.name}`,
  description: `A community portal for ${communityConfig.name}, ${communityConfig.location}, coordinating ${festivalConfig.festivalName} ${festivalConfig.year} — schedules, daily pooja timings, registrations, and announcements.`,
  nav: [
    { label: "Home", href: "/" },
    { label: "Schedule", href: "/schedule" },
    { label: "Today", href: "/today" },
    { label: "Register", href: "/register" },
    { label: "Announcements", href: "/announcements" },
  ],
};
