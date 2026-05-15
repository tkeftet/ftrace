import User from '../models/User';
import { UserRole } from '../types';
import { createError } from '../utils/AppError';

export async function listStaff(tenantId: string, excludeUserId: string) {
  return User.find({ tenantId, _id: { $ne: excludeUserId } })
    .select('-password')
    .sort({ createdAt: -1 });
}

export interface CreateStaffInput {
  tenantId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export async function createStaff(input: CreateStaffInput) {
  const existing = await User.findOne({ tenantId: input.tenantId, email: input.email });
  if (existing) throw createError('A user with this email already exists in this tenant', 409);

  const user = await User.create(input);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export interface UpdateStaffInput {
  name?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}

export async function updateStaff(
  tenantId: string,
  staffId: string,
  requestingUserId: string,
  input: UpdateStaffInput
) {
  const user = await User.findOne({ _id: staffId, tenantId }).select('+password');
  if (!user) throw createError('Staff member not found', 404);

  if (user._id.toString() === requestingUserId && input.role && input.role !== 'admin') {
    throw createError('You cannot change your own role', 400);
  }

  if (input.role !== undefined) user.role = input.role;
  if (input.name !== undefined) user.name = input.name.trim();
  if (input.email !== undefined) user.email = input.email;
  if (input.password !== undefined) user.password = input.password; // pre-save hook hashes

  await user.save();
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function deactivateStaff(tenantId: string, staffId: string, requestingUserId: string) {
  if (staffId === requestingUserId)
    throw createError('You cannot deactivate your own account', 400);

  const user = await User.findOneAndUpdate(
    { _id: staffId, tenantId },
    { isActive: false },
    { new: true }
  ).select('-password');
  if (!user) throw createError('Staff member not found', 404);
  return user;
}

export async function reactivateStaff(tenantId: string, staffId: string) {
  const user = await User.findOneAndUpdate(
    { _id: staffId, tenantId },
    { isActive: true },
    { new: true }
  ).select('-password');
  if (!user) throw createError('Staff member not found', 404);
  return user;
}
