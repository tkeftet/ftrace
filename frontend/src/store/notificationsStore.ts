import { create } from "zustand";
import {
  notificationApi,
  type AppNotification,
} from "@/api/endpoints/notification.api";

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  fetch: () => Promise<void>;
  prepend: (n: AppNotification) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const { data } = await notificationApi.list();
      set({ items: data, unreadCount: data.filter((n) => !n.isRead).length });
    } finally {
      set({ loading: false });
    }
  },

  prepend: (n) =>
    set((s) => ({
      items: [n, ...s.items].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    })),

  markRead: async (id) => {
    await notificationApi.markRead(id);
    set((s) => ({
      items: s.items.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await notificationApi.markAllRead();
    set((s) => ({
      items: s.items.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
