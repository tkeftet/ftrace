import axiosInstance from "../axiosInstance";

export interface AppNotification {
  _id: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
  targetRole: string;
}

export const notificationApi = {
  list: () => axiosInstance.get<AppNotification[]>("/notifications"),
  markRead: (id: string) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosInstance.patch("/notifications/read-all"),
};
