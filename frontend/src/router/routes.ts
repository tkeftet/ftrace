export const ROUTES = {
  // -- Public --
  HOME: "/",
  LOGIN: "/login",

  // -- Super Admin --
  DASHBOARD: "/dashboard",
  DASHBOARD_OVERVIEW: "/dashboard/overview",
  ANALYTICS: "/dashboard/analytics",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  TENANTS: "/dashboard/tenants",
  TENANT_DETAIL: "/dashboard/tenants/:id",

  // -- Tenant (subdomain) --
  TENANT_LOGIN: "/login",
  TENANT_DASHBOARD: "/dashboard",
  TENANT_ORDERS: "/dashboard/orders",
  TENANT_MENU: "/dashboard/menu",
  TENANT_TABLES: "/dashboard/tables",
  TENANT_STAFF: "/dashboard/staff",
  TENANT_SETTINGS: "/dashboard/settings",

  // -- Customer QR order (public, no auth) --
  TABLE_ORDER: "/order",

  NOT_FOUND: "*",
} as const;
