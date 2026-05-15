import { Request } from 'express';
import { Types } from 'mongoose';

/* ───────────────────── JWT Payload ───────────────────── */
export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
}

/* ─────────────── Authenticated Request ─────────────── */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/* ─────────────── Table Session ─────────────── */
export interface TableSessionPayload {
  sessionId: string;
  tenantId: string;
  tableId: string;
}

/**
 * Used by routes that support both customer session tokens and staff JWTs.
 * Includes both `user` (from authenticate/optionalAuthenticate) and
 * `tableSession` (from sessionAuth middleware).
 */
export interface TableSessionRequest extends Request {
  user?: JwtPayload;
  tableSession?: TableSessionPayload;
}

/* ──────────────────── Enums / Unions ──────────────────── */
export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'waiter'
  | 'barman'
  | 'kitchen'
  | 'cashier';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'paid'
  | 'cancelled';

export type OrderItemTarget = 'bar' | 'kitchen';

export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise';

/* ──────────────────── Socket Events ──────────────────── */
export enum SocketEvents {
  ORDER_CREATED = 'order:created',
  ORDER_UPDATED = 'order:updated',
  ORDER_ITEM_READY = 'order:item-ready',
  NOTIFICATION = 'notification',
  WAITER_CALL = 'waiter:call',
}

/* ──────────────────── Helper Types ──────────────────── */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface TenantDocument {
  _id: Types.ObjectId;
  slug: string;
  name: string;
}
