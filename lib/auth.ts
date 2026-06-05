export const ROLES = ["ADMIN", "OFICINISTA", "CLIENTE", "CHOFER"] as const;

export type UserRole = (typeof ROLES)[number];

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  ADMIN: "/admin",
  OFICINISTA: "/oficinista",
  CLIENTE: "/cliente",
  CHOFER: "/chofer",
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && ROLES.includes(value as UserRole);
}

export function getDashboardPathForRole(role: unknown): string {
  return isUserRole(role) ? ROLE_DASHBOARD_PATHS[role] : "/";
}
