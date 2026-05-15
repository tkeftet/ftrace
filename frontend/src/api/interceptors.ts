import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

export const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      // Only treat 401 as session expiry if the user *was* authenticated.
      // A 401 on the login request itself means bad credentials — let the
      // form surface that without nuking state.
      if (status === 401 && useAuthStore.getState().isAuthenticated) {
        useAuthStore.getState().logout();
        // Routing handles the redirect: ProtectedRoute / TenantProtectedRoute
        // will navigate to /login on the next render now that
        // isAuthenticated === false.
      }

      // 403 is intentionally not redirected — the caller decides (e.g. show a
      // snackbar, render an inline "no access" panel, or navigate elsewhere).

      if (typeof status === "number" && status >= 500) {
        console.error("Server error:", error.response?.data);
      }

      return Promise.reject(error);
    },
  );
};
