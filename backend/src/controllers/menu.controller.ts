import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as menuService from '../services/menu.service';

/* ── Categories ─────────────────────────────────────────────────── */

export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await menuService.listCategories(req.user!.tenantId);
  res.json(categories);
});

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await menuService.createCategory(req.user!.tenantId, req.body);
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await menuService.updateCategory(req.user!.tenantId, req.params.id, req.body);
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  await menuService.deleteCategory(req.user!.tenantId, req.params.id);
  res.status(204).send();
});

/* ── Items ───────────────────────────────────────────────────────── */

export const getMenuItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await menuService.listItems(
    req.user!.tenantId,
    req.query.category as string | undefined
  );
  res.json(items);
});

export const createMenuItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await menuService.createItem(req.user!.tenantId, req.body);
  res.status(201).json(item);
});

export const updateMenuItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await menuService.updateItem(req.user!.tenantId, req.params.id, req.body);
  res.json(item);
});

export const deleteMenuItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  await menuService.deleteItem(req.user!.tenantId, req.params.id);
  res.status(204).send();
});
