import type { StaffRole } from "@/types/staff.types";
import { ROUTES } from "@/router/routes";

/**
 * Defines which roles are allowed to access each tenant route.
 *
 * admin   → full access
 * manager → overview, orders, menu, tables   (no staff management)
 * waiter  → overview, orders, tables
 * barman  → overview, orders
 * kitchen → overview, orders
 * cashier → overview, orders
 */
export const ROUTE_PERMISSIONS: Record<string, StaffRole[]> = {
  [ROUTES.TENANT_DASHBOARD]: [
    "admin",
    "manager",
    "waiter",
    "barman",
    "kitchen",
    "cashier",
  ],
  [ROUTES.TENANT_ORDERS]: [
    "admin",
    "manager",
    "waiter",
    "barman",
    "kitchen",
    "cashier",
  ],
  [ROUTES.TENANT_MENU]: ["admin", "manager"],
  [ROUTES.TENANT_TABLES]: ["admin", "manager", "waiter"],
  [ROUTES.TENANT_STAFF]: ["admin"],
};

export function canAccess(role: string, path: string): boolean {
  const allowed = ROUTE_PERMISSIONS[path];
  if (!allowed) return false;
  return allowed.includes(role as StaffRole);
}

/** Default landing route per role after login. */
export const ROLE_HOME: Record<StaffRole, string> = {
  admin: ROUTES.TENANT_DASHBOARD,
  manager: ROUTES.TENANT_DASHBOARD,
  waiter: ROUTES.TENANT_ORDERS,
  barman: ROUTES.TENANT_ORDERS,
  kitchen: ROUTES.TENANT_ORDERS,
  cashier: ROUTES.TENANT_ORDERS,
};
