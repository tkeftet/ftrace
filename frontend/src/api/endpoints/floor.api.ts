import axiosInstance from "../axiosInstance";

export interface Floor {
  _id: string;
  name: string;
  order: number;
}

export const floorApi = {
  getAll: () => axiosInstance.get<Floor[]>("/floors"),
  create: (payload: { name: string }) =>
    axiosInstance.post<Floor>("/floors", payload),
  update: (id: string, payload: { name: string }) =>
    axiosInstance.put<Floor>(`/floors/${id}`, payload),
  delete: (id: string) => axiosInstance.delete(`/floors/${id}`),
};
