import AdminPageHeading from "@/components/admin/AdminPageHeading";

export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div>
      <AdminPageHeading title={title} description="This section is coming soon." />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        {title} management tools will appear here.
      </div>
    </div>
  );
}
