import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCommunity } from "@/services/community.service";
import { getFestival } from "@/services/festival.service";

export const dynamic = "force-dynamic";

// Display face: warm, rounded, festive — used with restraint for headings
// and the countdown numerals.
const displayFont = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Body face: clean and neutral for everything else.
const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const community = await getCommunity();
    const festival = await getFestival(community.id);
    return {
      title: `${festival.heroTitle} — ${community.name}`,
      description: `${festival.festivalName} ${festival.year} for ${community.name}, ${community.location}.`,
    };
  } catch {
    return { title: "Ganesh Festival Community Portal" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let community = null;
  let festival = null;

  try {
    community = await getCommunity();
    festival = await getFestival(community.id);
  } catch {}

  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="flex min-h-screen flex-col bg-cream font-body text-ink antialiased">
        <SiteHeader community={community} />
        <main className="flex-1">{children}</main>
        <SiteFooter community={community} festival={festival} />
      </body>
    </html>
  );
}
