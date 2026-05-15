import Floor from '../models/Floor';
import Table from '../models/Table';
import { createError } from '../utils/AppError';

export async function listFloors(tenantId: string) {
  return Floor.find({ tenantId }).sort({ order: 1, createdAt: 1 });
}

export async function createFloor(tenantId: string, name: string) {
  const count = await Floor.countDocuments({ tenantId });
  return Floor.create({ name: name.trim(), tenantId, order: count });
}

export async function updateFloor(tenantId: string, floorId: string, name: string) {
  const floor = await Floor.findOneAndUpdate(
    { _id: floorId, tenantId },
    { name: name.trim() },
    { new: true }
  );
  if (!floor) throw createError('Floor not found', 404);
  return floor;
}

export async function deleteFloor(tenantId: string, floorId: string) {
  const tableCount = await Table.countDocuments({ tenantId, floorId });
  if (tableCount > 0) {
    throw createError(
      `Cannot delete floor: ${tableCount} table(s) are still assigned to it. Reassign or delete them first.`,
      400
    );
  }
  const floor = await Floor.findOneAndDelete({ _id: floorId, tenantId });
  if (!floor) throw createError('Floor not found', 404);
}
