/**
 * Lightweight session store for the customer QR-order flow.
 * Persisted in sessionStorage so it survives page refreshes but not new tabs.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface TableSessionInfo {
  sessionToken: string;
  sessionId: string;
  tenantId: string;
  tableId: string;
  tableNumber: number;
  tableLabel?: string;
  expiresAt: string; // ISO string
}

interface SessionState {
  session: TableSessionInfo | null;
  setSession: (info: TableSessionInfo) => void;
  clearSession: () => void;
  isExpired: () => boolean;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      session: null,

      setSession: (info) => {
        sessionStorage.setItem("table_session_token", info.sessionToken);
        set({ session: info });
      },

      clearSession: () => {
        sessionStorage.removeItem("table_session_token");
        set({ session: null });
      },

      isExpired: () => {
        const s = get().session;
        if (!s) return true;
        return new Date(s.expiresAt) <= new Date();
      },
    }),
    {
      name: "ftrace_table_session",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
