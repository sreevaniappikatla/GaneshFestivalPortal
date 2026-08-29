import type { PoojaConfig } from "@/types";

// Local pooja data — the single source of truth for /register until
// Supabase is wired up. totalRegistered is baseline "seed" data; actual
// registrations made through the form are tracked separately and added
// on top when computing remaining slots (see services/poojaService.ts).
export const poojas: PoojaConfig[] = [
  {
    id: "ganapathi-homam",
    name: "Ganapathi Homam",
    description:
      "A sacred fire ritual invoking Lord Ganesha for prosperity and the removal of obstacles.",
    active: true,
    totalRegistered: 42,
    maximumRegistrations: 60,
  },
  {
    id: "ganesh-archana",
    name: "Ganesh Archana",
    description:
      "A traditional chanting ritual offering flowers and prayers to Lord Ganesha.",
    active: true,
    totalRegistered: 88,
    maximumRegistrations: 150,
  },
  {
    id: "ganesh-abhishekam",
    name: "Ganesh Abhishekam",
    description:
      "A ceremonial bathing ritual of the deity with milk, honey, and sacred water.",
    active: true,
    totalRegistered: 35,
    maximumRegistrations: 40,
  },
  {
    id: "annadanam-sponsorship",
    name: "Annadanam Sponsorship",
    description:
      "Sponsor a community meal offered as a selfless act of service during the festival.",
    active: true,
    totalRegistered: 12,
    maximumRegistrations: 20,
  },
];
