import type { EventCategory } from "@/types";

export interface CategoryMeta {
  label: string;
  icon: string;
  badgeClass: string;
}

// Centralized display metadata for each event category — icon, label,
// and badge styling. Referenced by EventCard and the schedule filters
// so category presentation stays consistent across the app.
export const CATEGORY_META: Record<EventCategory, CategoryMeta> = {
  pooja: {
    label: "Pooja",
    icon: "🙏",
    badgeClass: "bg-maroon-50 text-maroon-500",
  },
  cultural: {
    label: "Cultural",
    icon: "🎭",
    badgeClass: "bg-saffron-50 text-saffron-600",
  },
  food: {
    label: "Food",
    icon: "🍽️",
    badgeClass: "bg-gold-100 text-gold-600",
  },
  kids: {
    label: "Kids",
    icon: "🎈",
    badgeClass: "bg-cream-300 text-maroon-400",
  },
  celebration: {
    label: "Celebration",
    icon: "🎉",
    badgeClass: "bg-saffron-100 text-saffron-700",
  },
  other: {
    label: "Other",
    icon: "📌",
    badgeClass: "bg-cream-200 text-ink/70",
  },
};

// The filter set shown on /schedule. Only a subset of categories gets a
// dedicated filter chip per the brief — "All", "Pooja", "Cultural",
// "Food", "Kids" — but every category still appears under "All".
export const SCHEDULE_FILTERS: { label: string; value: EventCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pooja", value: "pooja" },
  { label: "Cultural", value: "cultural" },
  { label: "Food", value: "food" },
  { label: "Kids", value: "kids" },
];
