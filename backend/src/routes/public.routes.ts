import { Router } from 'express';
import MenuItem from '../models/MenuItem';
import MenuCategory from '../models/MenuCategory';
import Table from '../models/Table';
import Tenant from '../models/Tenant';
import Order from '../models/Order';
import Notification from '../models/Notification';
import { validate } from '../middleware/validate';
import { scanQrSchema } from '../utils/schemas';
import { scanQr } from '../controllers/tableSession.controller';
import { optionalSession } from '../middleware/sessionAuth';
import { TableSessionRequest } from '../types';
import { emitToRole } from '../services/socket.service';
import { SocketEvents } from '../types';

const router = Router();

/**
 * QR scan — customer opens the QR URL and exchanges {slug, tableId} for a session token.
 * POST /api/public/:slug/scan
 */
router.post('/:slug/scan', validate(scanQrSchema), scanQr);

/**
 * Public menu endpoint for client self-ordering flow.
 * No auth required — accessed after QR scan.
 * GET /api/public/:slug/menu?table=3
 */
router.get('/:slug/menu', async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug, isActive: true });
    if (!tenant) {
      res.status(404).json({ error: 'Café not found' });
      return;
    }

    const [categories, items] = await Promise.all([
      MenuCategory.find({ tenantId: tenant._id, isActive: true }).sort({ displayOrder: 1 }),
      MenuItem.find({ tenantId: tenant._id, isAvailable: true }).populate('category', 'name'),
    ]);

    res.json({
      tenant: { name: tenant.name, logo: tenant.logo, currency: tenant.currency },
      categories,
      items,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Public table info — validates the table exists.
 */
router.get('/:slug/tables/:tableNumber', async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug, isActive: true });
    if (!tenant) {
      res.status(404).json({ error: 'Café not found' });
      return;
    }

    const table = await Table.findOne({
      tenantId: tenant._id,
      number: parseInt(req.params.tableNumber),
    });
    if (!table) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    res.json({ tableId: table._id, number: table.number, label: table.label });
  } catch (err) {
    next(err);
  }
});

/**
 * Customer: fetch the active order for their table session.
 * GET /api/public/:slug/my-order
 * Requires x-session-token header.
 */
router.get('/:slug/my-order', optionalSession, async (req: TableSessionRequest, res, next) => {
  try {
    const session = req.tableSession;
    if (!session) {
      res.status(401).json({ error: 'No session' });
      return;
    }
    const order = await Order.findOne({
      tenantId: session.tenantId,
      table: session.tableId,
      status: { $nin: ['paid', 'cancelled'] },
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role');
    res.json(order ?? null);
  } catch (err) {
    next(err);
  }
});

/**
 * Lightweight tenant slug existence check.
 * GET /api/public/:slug/verify
 */
router.get('/:slug/verify', async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne(
      { slug: req.params.slug, isActive: true },
      { _id: 1, name: 1, slug: 1 }
    );
    if (!tenant) {
      res.status(404).json({ exists: false });
      return;
    }
    res.json({ exists: true, name: tenant.name, slug: tenant.slug });
  } catch (err) {
    next(err);
  }
});

/**
 * Customer calls the waiter to their table.
 * POST /api/public/:slug/call-waiter
 * Requires x-session-token header.
 */
router.post('/:slug/call-waiter', optionalSession, async (req: TableSessionRequest, res, next) => {
  try {
    const session = req.tableSession;
    if (!session) {
      res.status(401).json({ error: 'No session' });
      return;
    }
    const table = await Table.findById(session.tableId);
    const tableName = table ? `Table ${table.number}${table.label ? ` · ${table.label}` : ''}` : 'A table';
    const callMsg = `${tableName} is calling for the waiter`;
    const payload = { tableId: session.tableId, tableNumber: table?.number, tableLabel: table?.label };

    // Persist in DB for all relevant roles
    await Promise.all([
      Notification.create({ tenantId: session.tenantId, targetRole: 'waiter', message: callMsg }),
      Notification.create({ tenantId: session.tenantId, targetRole: 'admin', message: callMsg }),
      Notification.create({ tenantId: session.tenantId, targetRole: 'manager', message: callMsg }),
    ]);

    // Real-time socket push
    emitToRole(session.tenantId, 'waiter', SocketEvents.WAITER_CALL, payload);
    emitToRole(session.tenantId, 'admin', SocketEvents.WAITER_CALL, payload);
    emitToRole(session.tenantId, 'manager', SocketEvents.WAITER_CALL, payload);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
