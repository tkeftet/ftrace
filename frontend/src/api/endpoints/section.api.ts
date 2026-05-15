import axiosInstance from "../axiosInstance";

export interface Section {
  _id: string;
  name: string;
  order: number;
}

export const sectionApi = {
  getAll: () => axiosInstance.get<Section[]>("/sections"),
  create: (payload: { name: string }) =>
    axiosInstance.post<Section>("/sections", payload),
  update: (id: string, payload: { name: string }) =>
    axiosInstance.put<Section>(`/sections/${id}`, payload),
  delete: (id: string) => axiosInstance.delete(`/sections/${id}`),
};
