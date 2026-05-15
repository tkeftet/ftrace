import axiosInstance from "../axiosInstance";

// ── Types ────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface TenantLoginPayload {
  email: string;
  password: string;
  slug: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ── Endpoints ────────────────────────────────────────────────────
export const authApi = {
  login: (payload: LoginPayload) =>
    axiosInstance.post<LoginResponse>("/auth/login", payload),

  tenantLogin: (payload: TenantLoginPayload) =>
    axiosInstance.post<LoginResponse>("/auth/tenant-login", payload),

  logout: () => axiosInstance.post("/auth/logout"),

  getMe: () => axiosInstance.get<LoginResponse["user"]>("/auth/me"),

  updateProfile: (payload: UpdateProfilePayload) =>
    axiosInstance.patch<{ user: LoginResponse["user"] }>("/auth/me", payload),

  changePassword: (payload: ChangePasswordPayload) =>
    axiosInstance.patch<{ message: string }>("/auth/me/password", payload),
};
