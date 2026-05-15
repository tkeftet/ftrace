import axiosInstance from "../axiosInstance";
import type {
  Tenant,
  TenantListResponse,
  CreateTenantPayload,
  UpdateTenantPayload,
} from "@/features/tenants/types";

export const tenantApi = {
  verifySlug: (slug: string) =>
    axiosInstance.get<{ exists: boolean; name?: string; slug?: string }>(
      `/public/${slug}/verify`,
    ),

  getAll: (page = 1, limit = 10) =>
    axiosInstance.get<TenantListResponse>("/super-admin/tenants", {
      params: { page, limit },
    }),

  getInfo: () => axiosInstance.get<Tenant>("/tenant/info"),

  getById: (id: string) =>
    axiosInstance.get<Tenant>(`/super-admin/tenants/${id}`),

  create: (payload: CreateTenantPayload) =>
    axiosInstance.post<Tenant>("/super-admin/tenants", payload),

  update: (id: string, payload: UpdateTenantPayload) =>
    axiosInstance.patch<Tenant>(`/super-admin/tenants/${id}`, payload),

  delete: (id: string) => axiosInstance.delete(`/super-admin/tenants/${id}`),
};
