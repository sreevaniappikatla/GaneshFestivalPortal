// Types describing the residential community running the festival.

export interface CommunityConfig {
  /** Full display name, e.g. "Mayfair Visista" */
  name: string;
  /** Short name/initials used in compact UI spots, e.g. nav badges */
  shortName: string;
  /** City/area, e.g. "Hyderabad" */
  location: string;
  /** Full mailing address */
  address?: string;
  /** City value stored separately from location */
  city?: string;
  /** Path to the community logo, relative to /public */
  logo: string;
  /** Contact phone number for general queries */
  contactPhone: string;
  /** Contact email for general queries */
  contactEmail: string;
  /** WhatsApp number for community updates/groups */
  whatsappNumber: string;
  /** IANA timezone, e.g. "Asia/Kolkata" */
  timezone: string;
  /** ISO 4217 currency code, e.g. "INR" */
  currency: string;
  /** Brand colors for the resident portal */
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}
