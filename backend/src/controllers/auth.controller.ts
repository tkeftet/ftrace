import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/auth.service';
import * as tenantService from '../services/tenant.service';

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, slug } = req.body;
  const tenant = await tenantService.getTenantBySlug(slug);
  const result = await authService.loginUser(email, password, tenant._id.toString());
  res.json(result);
});

export const superAdminLogin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginSuperAdmin(email, password);
  res.json(result);
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await authService.getProfile(req.user!.userId);
  res.json({ user: profile });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;
  const user = await authService.updateProfile(req.user!.userId, { name: name.trim(), email });
  res.json({ user });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user!.userId, currentPassword, newPassword);
  res.json({ message: 'Password updated successfully' });
});
