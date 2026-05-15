import Section from '../models/Section';
import Table from '../models/Table';
import { createError } from '../utils/AppError';

export async function listSections(tenantId: string) {
  return Section.find({ tenantId }).sort({ order: 1, createdAt: 1 });
}

export async function createSection(tenantId: string, name: string) {
  const count = await Section.countDocuments({ tenantId });
  return Section.create({ name: name.trim(), tenantId, order: count });
}

export async function updateSection(tenantId: string, sectionId: string, name: string) {
  const section = await Section.findOneAndUpdate(
    { _id: sectionId, tenantId },
    { name: name.trim() },
    { new: true }
  );
  if (!section) throw createError('Section not found', 404);
  return section;
}

export async function deleteSection(tenantId: string, sectionId: string) {
  const section = await Section.findOneAndDelete({ _id: sectionId, tenantId });
  if (!section) throw createError('Section not found', 404);
  // Unassign tables so they become "unassigned"
  await Table.updateMany({ tenantId, sectionId }, { $unset: { sectionId: 1 } });
}
