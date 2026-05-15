import { z } from 'zod';
import { PASSWORD_MIN, PASSWORD_MAX } from '../utils/validators';

/* ── Auth ─────────────────────────────────────────────────────── */
export const tenantLoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required').max(PASSWORD_MAX),
  slug: z.string().min(1, 'Tenant slug required').trim(),
});

export const superAdminLoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required').max(PASSWORD_MAX),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name required').trim(),
  email: z.string().email('Valid email required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required').max(PASSWORD_MAX),
  newPassword: z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
    .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`),
});

/* ── Staff ────────────────────────────────────────────────────── */
const STAFF_ROLES = ['admin', 'manager', 'waiter', 'barman', 'kitchen', 'cashier'] as const;

export const createStaffSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
    .max(PASSWORD_MAX),
  name: z.string().min(1, 'Name required').trim(),
  role: z.enum(STAFF_ROLES, { error: `Role must be one of: ${STAFF_ROLES.join(', ')}` }),
});

export const updateStaffSchema = z
  .object({
    email: z.string().email('Valid email required').optional(),
    password: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX).optional(),
    name: z.string().min(1).trim().optional(),
    role: z.enum(STAFF_ROLES).optional(),
  })
  .partial();

/* ── Order ────────────────────────────────────────────────────── */
export const createOrderSchema = z.object({
  tenantId: z.string().optional(), // filled from session or JWT if authenticated
  tableId: z.string().min(1, 'tableId required'),
  customerName: z.string().trim().optional(),
  nonce: z.string().min(1).max(128).optional(), // client-generated idempotency key
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, 'menuItemId required'),
        quantity: z.number().int().min(1, 'quantity must be at least 1'),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one item required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'] as const,
    {
      error: 'Invalid order status',
    }
  ),
});

/* ── SuperAdmin / Tenant ──────────────────────────────────────── */
export const onboardTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name required').trim(),
  slug: z
    .string()
    .min(1, 'Slug required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only')
    .trim(),
  ownerEmail: z.string().email('Valid owner email required'),
  ownerPassword: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX),
  ownerName: z.string().min(1, 'Owner name required').trim(),
  plan: z.enum(['free', 'starter', 'pro', 'enterprise']),
  currency: z.string().length(3).toUpperCase().optional(),
  timezone: z.string().optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().min(1, 'Name required').trim(),
  slug: z
    .string()
    .min(1, 'Slug required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only')
    .trim(),
  plan: z.enum(['free', 'starter', 'pro', 'enterprise']),
  ownerName: z.string().min(1, 'Owner name required').trim(),
  ownerEmail: z.string().email('Valid owner email required'),
  ownerPassword: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  timezone: z.string().optional(),
});

/* ── Floor / Section ─────────────────────────────────────────── */
export const namedEntitySchema = z.object({
  name: z.string().min(1, 'Name required').trim(),
});

/* ── Table Session ───────────────────────────────────────────── */
export const scanQrSchema = z.object({
  tableId: z.string().min(1, 'tableId required'),
});

export const closeSessionSchema = z.object({
  tableId: z.string().min(1, 'tableId required'),
});
