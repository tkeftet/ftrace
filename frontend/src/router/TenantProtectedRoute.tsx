import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "./routes";

export function TenantProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.TENANT_LOGIN} state={{ from: location }} replace />
    );
  }

  return <Outlet />;
}
