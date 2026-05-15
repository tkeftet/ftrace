/* eslint-disable react-refresh/only-export-components -- route tree definition; not subject to Fast Refresh */
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { lazy } from "react";

import { RootLayout } from "@/layouts/RootLayout";
import { DashboardLayout } from "@/layouts/dashboard/DashboardLayout";

import { ProtectedRoute } from "./ProtectedRoute";
import { ROUTES } from "./routes";
import { LoggedInRedirect, withSuspense } from "./_helpers";

const Home = lazy(() => import("@/features/landing/LandingPage"));
const Login = lazy(() => import("@/features/auth/pages/LoginPage"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/index"));
const Tenants = lazy(() => import("@/features/tenants/pages/Tenants"));
const TenantDetail = lazy(
  () => import("@/features/tenants/pages/TenantDetail"),
);
const Analytics = lazy(() => import("@/features/dashboard/pages/Analytics"));
const Settings = lazy(() => import("@/features/dashboard/pages/AdminSettings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const routeConfig: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: withSuspense(NotFound),
    children: [
      {
        path: ROUTES.HOME,
        element: (
          <LoggedInRedirect to={ROUTES.TENANTS}>
            {withSuspense(Home)}
          </LoggedInRedirect>
        ),
      },
      {
        path: ROUTES.LOGIN,
        element: (
          <LoggedInRedirect to={ROUTES.TENANTS}>
            {withSuspense(Login)}
          </LoggedInRedirect>
        ),
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: ROUTES.DASHBOARD,
                element: <Navigate to={ROUTES.TENANTS} replace />,
              },
              {
                path: ROUTES.DASHBOARD_OVERVIEW,
                element: withSuspense(Dashboard),
              },
              { path: ROUTES.TENANTS, element: withSuspense(Tenants) },
              {
                path: ROUTES.TENANT_DETAIL,
                element: withSuspense(TenantDetail),
              },
              { path: ROUTES.ANALYTICS, element: withSuspense(Analytics) },
              {
                path: ROUTES.DASHBOARD_SETTINGS,
                element: withSuspense(Settings),
              },
            ],
          },
        ],
      },

      { path: ROUTES.NOT_FOUND, element: withSuspense(NotFound) },
    ],
  },
];

export const router = createBrowserRouter(routeConfig);
