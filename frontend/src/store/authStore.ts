import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      // sessionStorage: token is wiped when the tab/browser closes and is
      // not shared across tabs. Reduces the XSS exfiltration window vs.
      // localStorage. The proper long-term fix is an HttpOnly cookie issued
      // by the backend with the access token kept in memory only.
      name: "auth",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
