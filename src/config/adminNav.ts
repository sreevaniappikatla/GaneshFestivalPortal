import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  PartyPopper,
  CalendarDays,
  Flame,
  ClipboardList,
  Megaphone,
  Music2,
  HeartHandshake,
  Gift,
  Image as ImageIcon,
  Settings,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

// Centralized sidebar navigation for the admin portal. Add or reorder
// items here — the sidebar and any breadcrumbs should read from this
// single list rather than hard-coding links elsewhere.
export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Community", href: "/admin/community", icon: Users },
  { label: "Festival", href: "/admin/festival", icon: PartyPopper },
  { label: "Schedule", href: "/admin/schedule", icon: CalendarDays },
  { label: "Poojas", href: "/admin/poojas", icon: Flame },
  { label: "Registrations", href: "/admin/registrations", icon: ClipboardList },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Cultural Events", href: "/admin/cultural-events", icon: Music2 },
  { label: "Volunteers", href: "/admin/volunteers", icon: HeartHandshake },
  { label: "Sponsorships", href: "/admin/sponsorships", icon: Gift },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
