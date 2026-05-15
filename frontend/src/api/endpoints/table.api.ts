import axiosInstance from "../axiosInstance";

export interface Table {
  _id: string;
  number: number;
  label?: string;
  capacity: number;
  isOccupied: boolean;
  qrCode?: string;
  floorId: string;
  sectionId?: string;
}

export interface CreateTablePayload {
  number: number;
  label?: string;
  capacity?: number;
  floorId: string;
  sectionId?: string | null;
}

export interface UpdateTablePayload {
  number?: number;
  label?: string;
  capacity?: number;
  isOccupied?: boolean;
  floorId?: string;
  sectionId?: string | null;
}

export const tableApi = {
  getAll: () => axiosInstance.get<Table[]>("/tables"),

  create: (payload: CreateTablePayload) =>
    axiosInstance.post<Table>("/tables", payload),

  update: (id: string, payload: UpdateTablePayload) =>
    axiosInstance.put<Table>(`/tables/${id}`, payload),

  delete: (id: string) => axiosInstance.delete(`/tables/${id}`),
};
