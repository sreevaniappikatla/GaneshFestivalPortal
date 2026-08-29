import { communityConfig } from "@/config/community";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { redirectTo?: string };
}) {
  const redirectTo = searchParams?.redirectTo ?? "/admin/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10 font-body">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-maroon-200 bg-white shadow-card">
        <div className="bg-temple-glow px-6 py-6 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream-100/90">
            {communityConfig.shortName}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-none">Admin Portal</h1>
        </div>

        <div className="p-6 sm:p-8">
          <p className="mb-6 text-center text-sm text-ink/70">
            Sign in to manage festival operations.
          </p>
          <AdminLoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
