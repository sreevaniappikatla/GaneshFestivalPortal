export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "FESTIVAL_ADMIN",
  "POOJA_ADMIN",
  "EVENT_ADMIN",
  "VIEWER",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin/") && pathname !== "/admin/login";
}

export function isAuthorizedAdminRole(
  role: unknown,
): role is AdminRole {
  return (
    typeof role === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(role)
  );
}
