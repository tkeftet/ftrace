import Notification from '../models/Notification';
import { UserRole } from '../types';

export async function listNotifications(tenantId: string, role: UserRole) {
  return Notification.find({ tenantId, targetRole: role }).sort({ createdAt: -1 }).limit(50);
}

export async function markNotificationRead(tenantId: string, notificationId: string) {
  await Notification.findOneAndUpdate({ _id: notificationId, tenantId }, { isRead: true });
}

export async function markAllNotificationsRead(tenantId: string, role: UserRole) {
  await Notification.updateMany({ tenantId, targetRole: role, isRead: false }, { isRead: true });
}
