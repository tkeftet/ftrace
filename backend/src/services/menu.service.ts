import MenuCategory from '../models/MenuCategory';
import MenuItem from '../models/MenuItem';
import { createError } from '../utils/AppError';

/* ── Categories ─────────────────────────────────────────────── */
export async function listCategories(tenantId: string) {
  return MenuCategory.find({ tenantId, isActive: true }).sort({ displayOrder: 1 });
}

export async function createCategory(tenantId: string, data: Record<string, unknown>) {
  return MenuCategory.create({ ...data, tenantId });
}

export async function updateCategory(
  tenantId: string,
  categoryId: string,
  data: Record<string, unknown>
) {
  const category = await MenuCategory.findOneAndUpdate({ _id: categoryId, tenantId }, data, {
    new: true,
  });
  if (!category) throw createError('Category not found', 404);
  return category;
}

export async function deleteCategory(tenantId: string, categoryId: string) {
  const category = await MenuCategory.findOneAndDelete({ _id: categoryId, tenantId });
  if (!category) throw createError('Category not found', 404);
  await MenuItem.deleteMany({ tenantId, category: category._id });
}

/* ── Items ───────────────────────────────────────────────────── */
export async function listItems(tenantId: string, category?: string) {
  const filter: Record<string, unknown> = { tenantId, isAvailable: true };
  if (category) filter.category = category;
  return MenuItem.find(filter).populate('category', 'name');
}

export async function createItem(tenantId: string, data: Record<string, unknown>) {
  return MenuItem.create({ ...data, tenantId });
}

export async function updateItem(tenantId: string, itemId: string, data: Record<string, unknown>) {
  const item = await MenuItem.findOneAndUpdate({ _id: itemId, tenantId }, data, { new: true });
  if (!item) throw createError('Item not found', 404);
  return item;
}

export async function deleteItem(tenantId: string, itemId: string) {
  const item = await MenuItem.findOneAndDelete({ _id: itemId, tenantId });
  if (!item) throw createError('Item not found', 404);
}
