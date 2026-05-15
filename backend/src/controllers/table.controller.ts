import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as tableService from '../services/table.service';

export const getTables = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tables = await tableService.listTables(req.user!.tenantId);
  res.json(tables);
});

export const createTable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const table = await tableService.createTable(req.user!.tenantId, req.body);
  res.status(201).json(table);
});

export const updateTable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const table = await tableService.updateTable(req.user!.tenantId, req.params.id, req.body);
  res.json(table);
});

export const assignTable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const table = await tableService.assignTable(
    req.user!.tenantId,
    req.params.id,
    req.body.serveurId ?? null
  );
  res.json(table);
});

export const deleteTable = asyncHandler(async (req: AuthRequest, res: Response) => {
  await tableService.deleteTable(req.user!.tenantId, req.params.id);
  res.status(204).send();
});
