/* eslint-disable react-refresh/only-export-components -- this module exports both
   components (PageLoader, LoggedInRedirect) and helpers (withSuspense). Splitting
   them across files makes the call sites less readable for negligible HMR benefit. */
import { Suspense, type ComponentType, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAuthStore, type AuthUser } from "@/store/authStore";

export const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      height: "100vh",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress />
  </Box>
);

export const withSuspense = (Component: ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

interface LoggedInRedirectProps {
  to: string | ((user: AuthUser) => string);
  children: ReactNode;
}

export function LoggedInRedirect({ to, children }: LoggedInRedirectProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated && user) {
    const dest = typeof to === "function" ? to(user) : to;
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}
