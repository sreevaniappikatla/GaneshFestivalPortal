// Types describing the festival itself (this year's edition).

export interface FestivalConfig {
  /** Name of the festival, e.g. "Ganesh Chaturthi Celebrations" */
  festivalName: string;
  /** Name of the deity being celebrated, e.g. "Sri Maha Ganapathi" */
  deityName: string;
  /** Festival year, e.g. 2026 */
  year: number;
  /** ISO date (YYYY-MM-DD) the festival starts */
  startDate: string;
  /** ISO date (YYYY-MM-DD) the festival ends */
  endDate: string;
  /** Main heading shown in the homepage hero section */
  heroTitle: string;
  /** Supporting line shown under the hero title */
  heroSubtitle: string;
  /** Optional hero image for a branded festival banner */
  heroImage?: string;
  /** Short prefix used for generated registration numbers, e.g. "GCF" */
  registrationPrefix: string;
  /** ISO date when registration opens */
  registrationOpenDate?: string;
  /** ISO date when registration closes */
  registrationCloseDate?: string;
  /** Festival publication state */
  status?: "draft" | "open" | "closed" | "archived";
}
