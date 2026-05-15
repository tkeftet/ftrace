import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as tenantService from '../services/tenant.service';

export const onboardTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, slug, ownerEmail, ownerPassword, ownerName, plan, currency, timezone } = req.body;
  const tenant = await tenantService.createTenant({
    name,
    slug,
    ownerEmail,
    ownerPassword,
    ownerName,
    plan,
    currency,
    timezone,
  });
  res.status(201).json(tenant);
});

export const listTenants = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await tenantService.listTenants(page, limit);
  res.json(result);
});

export const getTenantById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenant = await tenantService.getTenantById(req.params.id);
  res.json(tenant);
});

export const toggleTenantActive = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  const tenant = await tenantService.toggleTenantActive(req.params.id, isActive);
  res.json(tenant);
});

export const updateTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, slug, plan, currency, timezone, ownerName, ownerEmail, ownerPassword } = req.body;
  const tenant = await tenantService.updateTenant(req.params.id, {
    name,
    slug,
    plan,
    currency,
    timezone,
    ownerName,
    ownerEmail,
    ownerPassword,
  });
  res.json(tenant);
});

export const getTenantUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await tenantService.getTenantUsers(req.params.id);
  res.json(users);
});

export const deleteTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  await tenantService.deleteTenant(req.params.id);
  res.status(204).send();
});
