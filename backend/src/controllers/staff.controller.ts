import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as staffService from '../services/staff.service';

export const listStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await staffService.listStaff(req.user!.tenantId, req.user!.userId);
  res.json(users);
});

export const createStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, name, role } = req.body;
  const user = await staffService.createStaff({
    tenantId: req.user!.tenantId,
    email,
    password,
    name,
    role,
  });
  res.status(201).json(user);
});

export const updateStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, role, password } = req.body;
  const user = await staffService.updateStaff(req.user!.tenantId, req.params.id, req.user!.userId, {
    name,
    email,
    role,
    password,
  });
  res.json(user);
});

export const deactivateStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await staffService.deactivateStaff(
    req.user!.tenantId,
    req.params.id,
    req.user!.userId
  );
  res.json(user);
});

export const reactivateStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await staffService.reactivateStaff(req.user!.tenantId, req.params.id);
  res.json(user);
});
