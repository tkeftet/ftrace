import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "./routes";
import type { StaffRole } from "@/types/staff.types";

interface Props {
  allowedRoles: StaffRole[];
}

/**
 * Wraps routes that require a specific set of roles.
 * Redirects to the dashboard (or login) if the user's role isn't allowed.
 */
export function TenantRoleRoute({ allowedRoles }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to={ROUTES.TENANT_LOGIN} replace />;
  }

  if (!allowedRoles.includes(user.role as StaffRole)) {
    // Redirect to their default landing page instead of a blank 403
    return <Navigate to={ROUTES.TENANT_DASHBOARD} replace />;
  }

  return <Outlet />;
}
