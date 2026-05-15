import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import TableSession from '../models/TableSession';
import Table from '../models/Table';
import Tenant from '../models/Tenant';
import { TableSessionPayload } from '../types';
import { createError } from '../utils/AppError';

/** JWT audience claim used to distinguish session tokens from user auth tokens. */
const SESSION_AUDIENCE = 'table-session';

/* ── Scan QR ─────────────────────────────────────────────────── */

export interface ScanResult {
  sessionToken: string;
  session: {
    sessionId: string;
    tenantId: string;
    tableId: string;
    tableNumber: number;
    tableLabel?: string;
    expiresAt: Date;
    isNew: boolean;
  };
}

/**
 * Called when a customer scans the permanent QR code for a table.
 *
 * - If there is already an active, non-expired session for this table, the
 *   customer joins it (returns the same session token so all co-diners share
 *   one session).
 * - Otherwise a new session is created and a signed JWT is returned.
 *
 * Tenant isolation is enforced: the table must belong to the resolved tenant.
 */
export async function scanQr(tenantSlug: string, tableId: string): Promise<ScanResult> {
  const tenant = await Tenant.findOne({ slug: tenantSlug, isActive: true });
  if (!tenant) throw createError('Café not found', 404);

  const table = await Table.findOne({ _id: tableId, tenantId: tenant._id });
  if (!table) throw createError('Table not found', 404);

  const tenantId = (tenant._id as { toString(): string }).toString();

  // Re-use an existing active session so co-diners share the same sessionId
  const existing = await TableSession.findOne({
    tenantId: tenant._id,
    tableId: table._id,
    status: 'active',
    expiresAt: { $gt: new Date() },
  });

  if (existing) {
    const sessionToken = signSessionToken(
      { sessionId: existing.sessionId, tenantId, tableId },
      existing.expiresAt
    );
    return {
      sessionToken,
      session: {
        sessionId: existing.sessionId,
        tenantId,
        tableId,
        tableNumber: table.number,
        tableLabel: table.label,
        expiresAt: existing.expiresAt,
        isNew: false,
      },
    };
  }

  // No active session — create one
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);

  await TableSession.create({
    tenantId: tenant._id,
    tableId: table._id,
    sessionId,
    status: 'active',
    expiresAt,
  });

  const sessionToken = signSessionToken({ sessionId, tenantId, tableId }, expiresAt);

  return {
    sessionToken,
    session: { sessionId, tenantId, tableId, tableNumber: table.number, tableLabel: table.label, expiresAt, isNew: true },
  };
}

/* ── Verify session token ────────────────────────────────────── */

/**
 * Verifies the JWT signature, checks the DB record is still active, and
 * enforces tenant isolation.  Throws an AppError (401) on any failure so
 * the caller can pass it straight to `next(err)`.
 */
export async function verifySessionToken(token: string): Promise<TableSessionPayload> {
  let payload: TableSessionPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET, {
      audience: SESSION_AUDIENCE,
    }) as TableSessionPayload;
  } catch {
    throw createError('Invalid or expired session token', 401);
  }

  const session = await TableSession.findOne({ sessionId: payload.sessionId });
  if (!session) throw createError('Session not found', 401);

  // If the JWT has not expired but the DB record has been closed/expired by staff
  if (session.status !== 'active') {
    const msg =
      session.status === 'closed' ? 'Session has been closed by staff' : 'Session has expired';
    throw createError(msg, 401);
  }

  // Belt-and-suspenders: also check DB-side expiry in case of clock skew
  if (session.expiresAt <= new Date()) {
    await TableSession.updateOne({ sessionId: payload.sessionId }, { status: 'expired' });
    throw createError('Session has expired', 401);
  }

  // Tenant isolation: token payload must match the DB record
  if (session.tenantId.toString() !== payload.tenantId) {
    throw createError('Session tenant mismatch', 401);
  }

  return {
    sessionId: payload.sessionId,
    tenantId: payload.tenantId,
    tableId: payload.tableId,
  };
}

/* ── Close session (staff) ───────────────────────────────────── */

/**
 * Staff closes the session after the bill is paid.
 * All subsequent order attempts with the old session token will be rejected.
 */
export async function closeSession(tenantId: string, tableId: string, closedBy: string) {
  const session = await TableSession.findOneAndUpdate(
    { tenantId, tableId, status: 'active' },
    { status: 'closed', closedBy, closedAt: new Date() },
    { new: true }
  );
  if (!session) throw createError('No active session found for this table', 404);
  return session;
}

/* ── Get active session (staff visibility) ───────────────────── */

export async function getActiveSession(tenantId: string, tableId: string) {
  const session = await TableSession.findOne({
    tenantId,
    tableId,
    status: 'active',
    expiresAt: { $gt: new Date() },
  }).populate('closedBy', 'name role');

  if (!session) throw createError('No active session for this table', 404);
  return session;
}

/* ── Internal helpers ────────────────────────────────────────── */

function signSessionToken(payload: TableSessionPayload, expiresAt: Date): string {
  const expiresIn = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  return jwt.sign(payload, env.JWT_SECRET, {
    audience: SESSION_AUDIENCE,
    expiresIn,
  });
}
