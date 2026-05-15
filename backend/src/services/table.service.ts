import Table from '../models/Table';
import { createError } from '../utils/AppError';

export async function listTables(tenantId: string) {
  return Table.find({ tenantId }).sort({ number: 1 }).populate('assignedTo', 'name');
}

export async function createTable(tenantId: string, data: Record<string, unknown>) {
  return Table.create({ ...data, tenantId });
}

export async function updateTable(
  tenantId: string,
  tableId: string,
  data: Record<string, unknown>
) {
  const table = await Table.findOneAndUpdate({ _id: tableId, tenantId }, data, { new: true });
  if (!table) throw createError('Table not found', 404);
  return table;
}

export async function assignTable(tenantId: string, tableId: string, serveurId: string | null) {
  const table = await Table.findOneAndUpdate(
    { _id: tableId, tenantId },
    { assignedTo: serveurId },
    { new: true }
  ).populate('assignedTo', 'name');
  if (!table) throw createError('Table not found', 404);
  return table;
}

export async function deleteTable(tenantId: string, tableId: string) {
  await Table.findOneAndDelete({ _id: tableId, tenantId });
}
