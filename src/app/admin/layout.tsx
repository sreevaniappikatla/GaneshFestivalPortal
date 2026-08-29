"use client";

import { usePathname } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

// The login screen is deliberately outside the admin shell — no
// sidebar/nav chrome should be visible before signing in. Every other
// /admin/* route gets the full sidebar + topbar layout.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
