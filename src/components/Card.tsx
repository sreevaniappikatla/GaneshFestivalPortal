import Link from "next/link";
import type { FeatureCardData } from "@/types";

export default function Card({ title, description, href, icon }: FeatureCardData) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col justify-between rounded-2xl border border-gold-300/60 bg-cream-50 p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-gold-500 hover:shadow-card-hover focus-visible:-translate-y-1"
    >
      <div>
        {icon && (
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-saffron-50 text-2xl text-saffron-600 transition group-hover:bg-saffron-100">
            {icon}
          </span>
        )}
        <h3 className="font-display text-lg font-semibold text-maroon-500 group-hover:text-maroon-600">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{description}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-saffron-600 transition group-hover:gap-2 group-hover:text-saffron-700">
        View <span aria-hidden="true">&rarr;</span>
      </span>
    </Link>
  );
}
