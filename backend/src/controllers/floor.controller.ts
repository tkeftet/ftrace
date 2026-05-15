import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as floorService from '../services/floor.service';

export const getFloors = asyncHandler(async (req: AuthRequest, res: Response) => {
  const floors = await floorService.listFloors(req.user!.tenantId);
  res.json(floors);
});

export const createFloor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const floor = await floorService.createFloor(req.user!.tenantId, req.body.name);
  res.status(201).json(floor);
});

export const updateFloor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const floor = await floorService.updateFloor(req.user!.tenantId, req.params.id, req.body.name);
  res.json(floor);
});

export const deleteFloor = asyncHandler(async (req: AuthRequest, res: Response) => {
  await floorService.deleteFloor(req.user!.tenantId, req.params.id);
  res.status(204).send();
});
