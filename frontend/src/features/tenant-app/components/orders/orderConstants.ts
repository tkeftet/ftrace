import type { OrderStatus } from "@/api/endpoints/order.api";

// Cart item used in the new-order flow
export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  target: "bar" | "kitchen";
  quantity: number;
  notes: string;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready!",
  served: "Served",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const STATUS_BORDER: Record<OrderStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  ready: "#10b981",
  served: "#64748b",
  paid: "#059669",
  cancelled: "#ef4444",
};

export const STATUS_BG: Record<OrderStatus, string> = {
  pending: "rgba(245,158,11,0.12)",
  confirmed: "rgba(59,130,246,0.12)",
  preparing: "rgba(139,92,246,0.12)",
  ready: "rgba(16,185,129,0.12)",
  served: "rgba(100,116,139,0.12)",
  paid: "rgba(5,150,105,0.12)",
  cancelled: "rgba(239,68,68,0.12)",
};

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "served",
  served: "paid",
};

export const STATUS_FILTER_LIST: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "paid",
];
