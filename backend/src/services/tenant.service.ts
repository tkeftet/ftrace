import Tenant, { ITenant } from '../models/Tenant';
import User from '../models/User';
import { createError } from '../utils/AppError';

export async function createTenant(data: {
  name: string;
  slug: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerName: string;
  plan: string;
  currency?: string;
  timezone?: string;
}): Promise<ITenant> {
  const existing = await Tenant.findOne({ slug: data.slug });
  if (existing) throw createError('Slug already taken', 409);

  // Create tenant
  const tenant = await Tenant.create({
    name: data.name,
    slug: data.slug,
    plan: data.plan,
    ...(data.currency && { currency: data.currency }),
    ...(data.timezone && { timezone: data.timezone }),
  });

  // Create admin user for the tenant
  const admin = await User.create({
    tenantId: tenant._id,
    email: data.ownerEmail,
    password: data.ownerPassword,
    name: data.ownerName,
    role: 'admin',
  });

  tenant.owner = admin._id;
  await tenant.save();

  return tenant;
}

export async function listTenants(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [tenants, total] = await Promise.all([
    Tenant.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('owner', 'name email'),
    Tenant.countDocuments(),
  ]);
  return { tenants, total, page, pages: Math.ceil(total / limit) };
}

export async function getTenantBySlug(slug: string) {
  const tenant = await Tenant.findOne({ slug, isActive: true });
  if (!tenant) throw createError('Tenant not found', 404);
  return tenant;
}

export async function getTenantById(tenantId: string) {
  const tenant = await Tenant.findById(tenantId).populate('owner', 'name email');
  if (!tenant) throw createError('Tenant not found', 404);
  return tenant;
}

export async function toggleTenantActive(tenantId: string, isActive: boolean) {
  const tenant = await Tenant.findByIdAndUpdate(tenantId, { isActive }, { new: true });
  if (!tenant) throw createError('Tenant not found', 404);
  return tenant;
}

export async function updateTenant(
  tenantId: string,
  data: {
    name: string;
    slug: string;
    plan: string;
    currency: string;
    timezone: string;
    ownerName: string;
    ownerEmail: string;
    ownerPassword?: string;
  }
) {
  if (data.slug) {
    const existing = await Tenant.findOne({ slug: data.slug, _id: { $ne: tenantId } });
    if (existing) throw createError('Slug already taken', 409);
  }
  const tenant = await Tenant.findByIdAndUpdate(
    tenantId,
    {
      name: data.name,
      slug: data.slug,
      plan: data.plan,
      currency: data.currency,
      timezone: data.timezone,
    },
    { new: true, runValidators: true }
  );
  if (!tenant) throw createError('Tenant not found', 404);

  // Update owner user (use .save() to trigger bcrypt pre-save hook if password changes)
  const user = await User.findById(tenant.owner);
  if (user) {
    user.name = data.ownerName;
    user.email = data.ownerEmail.toLowerCase();
    if (data.ownerPassword) user.password = data.ownerPassword;
    await user.save();
  }

  return Tenant.findById(tenantId).populate('owner', 'name email');
}

export async function deleteTenant(tenantId: string) {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw createError('Tenant not found', 404);
  // Delete all users belonging to this tenant, then delete the tenant
  await User.deleteMany({ tenantId });
  await tenant.deleteOne();
}

export async function getTenantUsers(tenantId: string) {
  return User.find({ tenantId }).select('-password');
}
