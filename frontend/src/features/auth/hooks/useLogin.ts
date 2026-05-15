import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, type LoginPayload } from "@/api/endpoints/auth.api";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/router/routes";

export function useLogin() {
  const storeLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      authApi.login(payload).then((r) => r.data),
    onSuccess: (data) => {
      storeLogin(data.token, data.user);
      navigate(ROUTES.DASHBOARD);
    },
  });
}
