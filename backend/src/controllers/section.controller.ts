import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as sectionService from '../services/section.service';

export const getSections = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sections = await sectionService.listSections(req.user!.tenantId);
  res.json(sections);
});

export const createSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const section = await sectionService.createSection(req.user!.tenantId, req.body.name);
  res.status(201).json(section);
});

export const updateSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const section = await sectionService.updateSection(
    req.user!.tenantId,
    req.params.id,
    req.body.name
  );
  res.json(section);
});

export const deleteSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  await sectionService.deleteSection(req.user!.tenantId, req.params.id);
  res.status(204).send();
});
