import { Response } from 'express';
import { AuthRequest, TableSessionRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as tableSessionService from '../services/tableSession.service';

/**
 * POST /api/public/:slug/scan
 *
 * Customer scans the table QR code.  Returns a session token that must be
 * sent as `x-session-token` on every subsequent order request.
 *
 * - First scan  → creates a new session, returns { sessionToken, session: { isNew: true } }
 * - Later scans → joins the existing active session, returns the same token info
 */
export const scanQr = asyncHandler(async (req: TableSessionRequest, res: Response) => {
  const { tableId } = req.body;
  const result = await tableSessionService.scanQr(req.params.slug, tableId);
  res.json(result);
});

/**
 * POST /api/tables/:tableId/close-session
 *
 * Staff closes the active session for a table (e.g. after the bill is paid).
 * Any existing session tokens for that table immediately become invalid.
 */
export const closeSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await tableSessionService.closeSession(
    req.user!.tenantId,
    req.params.tableId,
    req.user!.userId
  );
  res.json(session);
});

/**
 * GET /api/tables/:tableId/session
 *
 * Staff reads the current active session for a table.
 */
export const getActiveSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await tableSessionService.getActiveSession(
    req.user!.tenantId,
    req.params.tableId
  );
  res.json(session);
});
