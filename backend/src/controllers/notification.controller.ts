import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as notificationService from '../services/notification.service';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await notificationService.listNotifications(
    req.user!.tenantId,
    req.user!.role
  );
  res.json(notifications);
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationService.markNotificationRead(req.user!.tenantId, req.params.id);
  res.status(204).send();
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await notificationService.markAllNotificationsRead(req.user!.tenantId, req.user!.role);
  res.status(204).send();
});
