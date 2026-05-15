/* eslint-disable react-refresh/only-export-components -- route tree definition; not subject to Fast Refresh */
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { lazy } from "react";

import { TenantProtectedRoute } from "./TenantProtectedRoute";
import { TenantRoleRoute } from "./TenantRoleRoute";
import { ValidateTenantSlug } from "./ValidateTenantSlug";
import { ROUTES } from "./routes";
import { LoggedInRedirect, withSuspense } from "./_helpers";
import { ROLE_HOME } from "@/utils/rbac";
import type { StaffRole } from "@/types/staff.types";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const TableOrderPage = lazy(
  () => import("@/features/customer-order/pages/TableOrderPage"),
);
const TenantDashboardLayout = lazy(() =>
  import("@/layouts/tenant/TenantDashboardLayout").then((m) => ({
    default: m.TenantDashboardLayout,
  })),
);
const TenantDashboard = lazy(
  () => import("@/features/tenant-app/pages/TenantDashboard"),
);
const StaffPage = lazy(() => import("@/features/tenant-app/pages/StaffPage"));
const MenuPage = lazy(() => import("@/features/tenant-app/pages/MenuPage"));
const OrdersPage = lazy(() => import("@/features/tenant-app/pages/OrdersPage"));
const TablesPage = lazy(() => import("@/features/tenant-app/pages/TablesPage"));
const SettingsPage = lazy(
  () => import("@/features/tenant-app/pages/SettingsPage"),
);
const NotFound = lazy(() => import("@/pages/NotFound"));

const tenantHome = (role: string) =>
  ROLE_HOME[role as StaffRole] ?? ROUTES.TENANT_DASHBOARD;

const routeConfig: RouteObject[] = [
  {
    element: <ValidateTenantSlug />,
    errorElement: withSuspense(NotFound),
    children: [
      {
        path: "/",
        element: <Navigate to={ROUTES.TENANT_LOGIN} replace />,
      },
      // Public customer QR-order page — no authentication required
      {
        path: ROUTES.TABLE_ORDER,
        element: withSuspense(TableOrderPage),
      },
      {
        path: ROUTES.TENANT_LOGIN,
        element: (
          <LoggedInRedirect to={(u) => tenantHome(u.role)}>
            {withSuspense(LoginPage)}
          </LoggedInRedirect>
        ),
      },
      {
        element: <TenantProtectedRoute />,
        children: [
          {
            element: withSuspense(TenantDashboardLayout),
            children: [
              {
                path: ROUTES.TENANT_DASHBOARD,
                element: withSuspense(TenantDashboard),
              },
              {
                path: ROUTES.TENANT_ORDERS,
                element: withSuspense(OrdersPage),
              },
              {
                element: (
                  <TenantRoleRoute
                    allowedRoles={["admin", "manager", "waiter"]}
                  />
                ),
                children: [
                  {
                    path: ROUTES.TENANT_TABLES,
                    element: withSuspense(TablesPage),
                  },
                ],
              },
              {
                element: (
                  <TenantRoleRoute allowedRoles={["admin", "manager"]} />
                ),
                children: [
                  {
                    path: ROUTES.TENANT_STAFF,
                    element: withSuspense(StaffPage),
                  },
                  {
                    path: ROUTES.TENANT_MENU,
                    element: withSuspense(MenuPage),
                  },
                ],
              },
              {
                path: ROUTES.TENANT_SETTINGS,
                element: withSuspense(SettingsPage),
              },
            ],
          },
        ],
      },
      { path: "*", element: withSuspense(NotFound) },
    ],
  },
];

export const tenantRouter = createBrowserRouter(routeConfig);
