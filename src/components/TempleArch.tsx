/**
 * A row of small temple-spire (shikhara) peaks used as a decorative
 * threshold between the hero section and the page content below —
 * evoking the silhouette of pandal rooftops against the sky.
 */
export default function TempleArch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 40 L0 26 L25 6 L50 26 L75 6 L100 26 L125 6 L150 26 L175 6 L200 26 L225 6 L250 26 L275 6 L300 26 L325 6 L350 26 L375 6 L400 26 L400 40 Z"
        fill="currentColor"
      />
    </svg>
  );
}
