import axiosInstance from "../axiosInstance";
import type {
  StaffMember,
  CreateStaffPayload,
  UpdateStaffPayload,
} from "@/types/staff.types";

export const staffApi = {
  list: () => axiosInstance.get<StaffMember[]>("/staff"),

  create: (payload: CreateStaffPayload) =>
    axiosInstance.post<StaffMember>("/staff", payload),

  update: (id: string, payload: UpdateStaffPayload) =>
    axiosInstance.put<StaffMember>(`/staff/${id}`, payload),

  deactivate: (id: string) => axiosInstance.delete(`/staff/${id}`),

  reactivate: (id: string) => axiosInstance.patch(`/staff/${id}/reactivate`),
};
