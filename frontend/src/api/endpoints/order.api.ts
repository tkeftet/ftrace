import axiosInstance from "../axiosInstance";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "paid"
  | "cancelled";

export interface OrderUser {
  _id: string;
  name: string;
  role: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedBy?: OrderUser | null;
  changedAt: string;
}

export interface OrderItem {
  _id: string;
  menuItem: string;
  name: string;
  quantity: number;
  price: number;
  target: "bar" | "kitchen";
  isReady: boolean;
  notes?: string;
  roundNumber: number;
}

export interface OrderRound {
  roundNumber: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Order {
  _id: string;
  table: { _id: string; number: number; label?: string } | string;
  items: OrderItem[];
  rounds: OrderRound[];
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  totalAmount: number;
  customerName?: string;
  createdBy?: OrderUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  tableId: string;
  customerName?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface CreateOrderResponse {
  order: Order;
  merged: boolean;
}

export const orderApi = {
  getAll: (status?: OrderStatus) =>
    axiosInstance.get<Order[]>("/orders", {
      params: status ? { status } : undefined,
    }),

  create: (payload: CreateOrderPayload) =>
    axiosInstance.post<CreateOrderResponse>("/orders", payload),

  updateStatus: (id: string, status: OrderStatus) =>
    axiosInstance.patch<Order>(`/orders/${id}/status`, { status }),

  updateRoundStatus: (id: string, roundNumber: number, status: OrderStatus) =>
    axiosInstance.patch<Order>(`/orders/${id}/rounds/${roundNumber}/status`, { status }),
};
