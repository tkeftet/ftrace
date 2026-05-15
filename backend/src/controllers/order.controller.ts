import { Response } from 'express';
import { TableSessionRequest, OrderStatus } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import * as orderService from '../services/order.service';

/**
 * POST /api/orders
 *
 * Accepts orders from two principals:
 *  - Customers (QR self-order): req.tableSession is set by optionalSession middleware.
 *  - Staff:                     req.user is set by optionalAuthenticate middleware.
 *
 * requireSessionOrAuth (in the route) ensures at least one is present.
 */
export const createOrder = asyncHandler(async (req: TableSessionRequest, res: Response) => {
  // Prefer session tenantId (customer) over user tenantId (staff) over body fallback
  const tenantId = req.tableSession?.tenantId ?? req.user?.tenantId ?? req.body.tenantId;
  const { tableId, items, customerName, nonce } = req.body;

  const { order, merged } = await orderService.createOrder({
    tenantId,
    tableId,
    items,
    customerName,
    createdBy: req.user?.userId,
    sessionId: req.tableSession?.sessionId,
    nonce,
  });

  // 200 = items merged into existing order, 201 = new order created
  res.status(merged ? 200 : 201).json({ order, merged });
});

/**
 * GET /api/orders
 */
export const getOrders = asyncHandler(async (req: TableSessionRequest, res: Response) => {
  const orders = await orderService.listOrders({
    tenantId: req.user!.tenantId,
    status: req.query.status as string | undefined,
    table: req.query.table as string | undefined,
  });
  res.json(orders);
});

/**
 * GET /api/orders/:id
 */
export const getOrderById = asyncHandler(async (req: TableSessionRequest, res: Response) => {
  const order = await orderService.getOrderById(req.user!.tenantId, req.params.id);
  res.json(order);
});

/**
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(async (req: TableSessionRequest, res: Response) => {
  const order = await orderService.updateOrderStatus(
    req.user!.tenantId,
    req.params.id,
    req.body.status as OrderStatus,
    req.user!.userId
  );
  res.json(order);
});

/**
 * PATCH /api/orders/:id/rounds/:roundNumber/status
 */
export const updateRoundStatus = asyncHandler(async (req: TableSessionRequest, res: Response) => {
  const order = await orderService.updateRoundStatus(
    req.user!.tenantId,
    req.params.id,
    parseInt(req.params.roundNumber, 10),
    req.body.status as OrderStatus,
    req.user!.userId
  );
  res.json(order);
});

/**
 * PATCH /api/orders/:id/items/:itemId/ready
 */
export const markItemReady = asyncHandler(async (req: TableSessionRequest, res: Response) => {
  const order = await orderService.markItemReady(
    req.user!.tenantId,
    req.params.id,
    req.params.itemId
  );
  res.json(order);
});
