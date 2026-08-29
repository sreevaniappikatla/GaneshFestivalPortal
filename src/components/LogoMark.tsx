/**
 * Renders the community logo inside a gold ring. Falls back to a simple
 * Om glyph badge when no logo image has been configured yet, so the
 * header never breaks while `communityConfig.logo` still points at a
 * placeholder path.
 */
export default function LogoMark({
  shortName,
  className,
}: {
  shortName: string;
  className?: string;
}) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold-300 bg-maroon-500 font-display text-sm font-bold text-gold-100 shadow-sm ${className ?? ""}`}
      aria-hidden="true"
    >
      {shortName.slice(0, 3).toUpperCase()}
    </span>
  );
}
