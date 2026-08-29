"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-maroon-500">
        Festival details are unavailable
      </h1>
      <p className="mt-3 text-ink/70">
        We could not load the latest community information. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-saffron-600 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-saffron-700"
      >
        Try again
      </button>
    </div>
  );
}
