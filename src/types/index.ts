// Shared domain types for the Ganesh Festival Community Portal.

import type { ReactNode } from "react";

export * from "./community";
export * from "./festival";
export * from "./schedule";
export * from "./pooja";
export * from "./registration";

export interface NavItem {
  label: string;
  href: string;
}

export interface FeatureCardData {
  title: string;
  description: string;
  href: string;
  /** Optional decorative icon shown on the card. */
  icon?: ReactNode;
}

export type AnnouncementPriority = "normal" | "important" | "urgent";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  postedAt: string;
  publishDate?: string;
  expiryDate?: string | null;
  isPublished?: boolean;
}
