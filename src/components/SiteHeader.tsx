import Link from "next/link";
import { siteConfig } from "@/config/site";
import LogoMark from "@/components/LogoMark";
import type { CommunityConfig } from "@/types";

export default function SiteHeader({ community }: { community: CommunityConfig | null }) {
  const displayCommunity = community ?? {
    name: "Community Portal",
    shortName: "CP",
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gold-300/60 bg-cream-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark shortName={displayCommunity.shortName} />
          <span className="font-display text-base font-bold text-maroon-500 sm:text-lg">
            {displayCommunity.name}
          </span>
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-ink/80 sm:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-saffron-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
