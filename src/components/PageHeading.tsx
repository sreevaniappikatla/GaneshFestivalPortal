export default function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-2xl font-bold text-maroon-500 sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-ink/70">{description}</p>}
    </div>
  );
}
