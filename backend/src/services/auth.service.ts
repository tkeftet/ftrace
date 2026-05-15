import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User, { IUser } from '../models/User';
import { JwtPayload, UserRole } from '../types';
import { createError } from '../utils/AppError';

function signToken(user: IUser): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    tenantId: user.tenantId?.toString() ?? '',
    role: user.role as UserRole,
  };
  const expiresInSec = 60 * 60 * 24 * 7; // 7 days in seconds
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresInSec });
}

export async function loginUser(email: string, password: string, tenantId: string) {
  const user = await User.findOne({ email, tenantId, isActive: true }).select('+password');
  if (!user) throw createError('Invalid credentials', 401);

  const valid = await user.comparePassword(password);
  if (!valid) throw createError('Invalid credentials', 401);

  return { token: signToken(user), user: { id: user._id, name: user.name, role: user.role } };
}

export async function loginSuperAdmin(email: string, password: string) {
  const user = await User.findOne({ email, role: 'super_admin' }).select('+password');
  if (!user) throw createError('Invalid credentials', 401);

  const valid = await user.comparePassword(password);
  if (!valid) throw createError('Invalid credentials', 401);

  return { token: signToken(user), user: { id: user._id, name: user.name, role: user.role } };
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw createError('User not found', 404);
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

export async function updateProfile(userId: string, data: { name: string; email: string }) {
  const user = await User.findByIdAndUpdate(
    userId,
    { name: data.name, email: data.email },
    { new: true, runValidators: true }
  );
  if (!user) throw createError('User not found', 404);
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw createError('User not found', 404);

  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw createError('Current password is incorrect', 400);

  user.password = newPassword;
  await user.save();
}
