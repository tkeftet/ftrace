/**
 * Public (unauthenticated) endpoints used by the customer QR-order flow.
 * These do NOT use the shared axiosInstance (which attaches staff Bearer tokens).
 * Instead they use a plain axios instance so the backend treats them as public.
 */
import axios from "axios";

const publicHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Attach session token to every public request when one is stored
publicHttp.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("table_session_token");
  if (token) config.headers["x-session-token"] = token;
  return config;
});

/* ── Types ─────────────────────────────────────────── */

export interface ScanResponse {
  sessionToken: string;
  session: {
    sessionId: string;
    tenantId: string;
    tableId: string;
    tableNumber: number;
    tableLabel?: string;
    expiresAt: string;
    isNew: boolean;
  };
}

export interface PublicMenuCategory {
  _id: string;
  name: string;
  displayOrder: number;
}

export interface PublicMenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  target: "bar" | "kitchen";
  isAvailable: boolean;
  preparationTime?: number;
  category: string | { _id: string; name: string };
}

export interface PublicMenuResponse {
  tenant: { name: string; logo?: string; currency: string };
  categories: PublicMenuCategory[];
  items: PublicMenuItem[];
}

export interface PublicOrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  target: "bar" | "kitchen";
  isReady: boolean;
  notes?: string;
  roundNumber: number;
}

export interface PublicOrderRound {
  roundNumber: number;
  status: string;
  createdAt: string;
}

export interface PublicOrder {
  _id: string;
  status: string;
  rounds: PublicOrderRound[];
  items: PublicOrderItem[];
  totalAmount: number;
  customerName?: string;
  createdAt: string;
}

export interface PlaceOrderPayload {
  tenantId?: string;
  tableId: string;
  customerName?: string;
  nonce: string;
  items: { menuItemId: string; quantity: number; notes?: string }[];
}

/* ── API calls ──────────────────────────────────────── */

export const publicApi = {
  /** Step 1: exchange QR params for a session token */
  scanQr: (slug: string, tableId: string) =>
    publicHttp.post<ScanResponse>(`/public/${slug}/scan`, { tableId }),

  /** Fetch the public menu (no auth needed) */
  getMenu: (slug: string) =>
    publicHttp.get<PublicMenuResponse>(`/public/${slug}/menu`),

  /** Place an order using the session token */
  placeOrder: (payload: PlaceOrderPayload) =>
    publicHttp.post<{ order: unknown; merged: boolean }>(`/orders`, payload),

  /** Get the active order for the current table session */
  getMyOrder: (slug: string) =>
    publicHttp.get<PublicOrder | null>(`/public/${slug}/my-order`),

  /** Notify the waiter to come to this table */
  callWaiter: (slug: string) =>
    publicHttp.post<{ ok: boolean }>(`/public/${slug}/call-waiter`),
};
