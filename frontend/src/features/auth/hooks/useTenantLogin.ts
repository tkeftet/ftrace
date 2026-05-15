import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, type TenantLoginPayload } from "@/api/endpoints/auth.api";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/router/routes";
import { ROLE_HOME } from "@/utils/rbac";
import type { StaffRole } from "@/types/staff.types";

export function useTenantLogin() {
  const storeLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: TenantLoginPayload) =>
      authApi.tenantLogin(payload).then((r) => r.data),
    onSuccess: (data) => {
      storeLogin(data.token, data.user);
      const home =
        ROLE_HOME[data.user.role as StaffRole] ?? ROUTES.TENANT_DASHBOARD;
      navigate(home, { replace: true });
    },
  });
}
