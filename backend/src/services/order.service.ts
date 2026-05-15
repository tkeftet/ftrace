import { Types } from 'mongoose';
import Order from '../models/Order';
import MenuItem from '../models/MenuItem';
import Table from '../models/Table';
import Notification from '../models/Notification';
import { emitToTenant, emitToRole } from './socket.service';
import { SocketEvents, OrderStatus } from '../types';
import { createError } from '../utils/AppError';

const STATUS_PRIORITY: Record<OrderStatus, number> = {
  pending: 0, confirmed: 1, preparing: 2, ready: 3, served: 4, paid: 5, cancelled: 99,
};

function minStatus(rounds: { status: OrderStatus }[]): OrderStatus {
  if (rounds.length === 0) return 'pending';
  return rounds.reduce((min, r) =>
    STATUS_PRIORITY[r.status] < STATUS_PRIORITY[min] ? r.status : min,
    rounds[0].status
  );
}

/* ── Shared populate projection ─────────────────────────────────── */
const ORDER_POPULATE = [
  { path: 'table', select: 'number label' },
  { path: 'createdBy', select: 'name role' },
  { path: 'statusHistory.changedBy', select: 'name role' },
] as const;

/* ── Create ─────────────────────────────────────────────────────── */
export interface CreateOrderInput {
  tenantId: string;
  tableId: string;
  items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
  customerName?: string;
  createdBy?: string;
  sessionId?: string; // present for customer QR-flow orders
  nonce?: string; // client-generated idempotency key
}

export interface CreateOrderResult {
  order: Awaited<ReturnType<typeof Order.prototype.save>> extends never
    ? never
    : InstanceType<typeof Order>;
  merged: boolean;
}

/**
 * Statuses into which new items can be merged.
 * Once an order is "ready", "served", "paid", or "cancelled" it is considered
 * closed and a fresh order is created instead.
 */
const MERGEABLE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'served'];

export async function createOrder(input: CreateOrderInput) {
  const { tenantId, tableId, items, customerName, createdBy, sessionId, nonce } = input;

  // Idempotency: reject if a (sessionId, nonce) pair was already used
  if (sessionId && nonce) {
    const duplicate = await Order.findOne({ sessionId, nonce });
    if (duplicate) throw createError('Duplicate order — this nonce has already been used', 409);
  }

  // Fetch all required menu items in one query (no N+1)
  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, tenantId });

  const orderItems = items.map((i) => {
    const mi = menuItems.find((m) => m._id.toString() === i.menuItemId);
    if (!mi) throw createError(`Menu item ${i.menuItemId} not found`, 400);
    return {
      menuItem: mi._id,
      name: mi.name,
      quantity: i.quantity,
      price: mi.price,
      target: mi.target as 'bar' | 'kitchen',
      notes: i.notes,
      isReady: false,
      roundNumber: 1, // will be overridden on merge
    };
  });

  const addedAmount = orderItems.reduce((sum, oi) => sum + oi.price * oi.quantity, 0);

  /* ── Try to merge into an existing open order ──────────────────
   *
   * Merge strategy:
   *  • If a sessionId is present (customer QR flow): find any open order
   *    for that session and append items to it.
   *  • If no sessionId (staff order): find any open order for the same
   *    tenantId + tableId and append. Staff can override by passing
   *    forceNew=true in the future if needed.
   *
   * "Open" = status is pending, confirmed, or preparing.
   * ─────────────────────────────────────────────────────────────── */
  // Always merge by table — customer QR orders must also merge into staff-created orders
  const mergeQuery = { tenantId, table: tableId, status: { $in: MERGEABLE_STATUSES } };

  const existingOrder = await Order.findOne(mergeQuery).sort({ createdAt: -1 });

  if (existingOrder) {
    // Determine the next round number
    const maxRound = existingOrder.items.reduce((max, i) => Math.max(max, i.roundNumber ?? 1), 1);
    const nextRound = maxRound + 1;
    const roundedItems = orderItems.map((i) => ({ ...i, roundNumber: nextRound }));

    // Append items and recalculate total
    existingOrder.items.push(...(roundedItems as typeof existingOrder.items));
    existingOrder.totalAmount += addedAmount;

    // Add a new round entry with pending status
    if (!existingOrder.rounds) existingOrder.rounds = [];
    existingOrder.rounds.push({ roundNumber: nextRound, status: 'pending', createdAt: new Date() });

    // Recompute overall order status (lowest round status wins)
    existingOrder.status = minStatus(existingOrder.rounds);

    // Record a history entry so staff can see items were added
    existingOrder.statusHistory.push({
      status: existingOrder.status,
      changedBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
      changedAt: new Date(),
    });

    await existingOrder.save();
    await existingOrder.populate(ORDER_POPULATE[0]);
    await existingOrder.populate(ORDER_POPULATE[1]);
    await existingOrder.populate(ORDER_POPULATE[2]);

    // Broadcast the updated order to staff
    emitToTenant(tenantId, SocketEvents.ORDER_UPDATED, existingOrder);

    // Notify relevant stations about the newly added items only
    await fireStationNotifications(tenantId, existingOrder._id.toString(), roundedItems, 'added to');

    return { order: existingOrder, merged: true };
  }

  /* ── No mergeable order found — create a new one ─────────────── */
  const order = await Order.create({
    tenantId,
    table: tableId,
    sessionId: sessionId ?? undefined,
    nonce: nonce ?? undefined,
    items: orderItems,
    totalAmount: addedAmount,
    customerName,
    createdBy: createdBy ?? null,
    rounds: [{ roundNumber: 1, status: 'pending', createdAt: new Date() }],
    statusHistory: [
      {
        status: 'pending' as OrderStatus,
        changedBy: createdBy ? new Types.ObjectId(createdBy) : null,
        changedAt: new Date(),
      },
    ],
  });

  // Mark table as occupied
  await Table.findByIdAndUpdate(tableId, { isOccupied: true });

  // Real-time broadcast to all tenant staff
  emitToTenant(tenantId, SocketEvents.ORDER_CREATED, order);

  await fireStationNotifications(tenantId, order._id.toString(), orderItems, 'in');

  return { order, merged: false };
}

/* ── Internal helper: notify bar / kitchen about items ──────────── */
async function fireStationNotifications(
  tenantId: string,
  orderId: string,
  orderItems: Array<{ target: 'bar' | 'kitchen' }>,
  preposition: string
) {
  const hasBarItems = orderItems.some((i) => i.target === 'bar');
  const hasKitchenItems = orderItems.some((i) => i.target === 'kitchen');

  const notificationPromises: Promise<unknown>[] = [];

  if (hasBarItems) {
    notificationPromises.push(
      Notification.create({
        tenantId,
        targetRole: 'barman',
        message: `New bar items ${preposition} order #${orderId}`,
        orderId,
      })
    );
    emitToRole(tenantId, 'barman', SocketEvents.NOTIFICATION, {
      message: `New bar items ${preposition} order`,
      orderId,
    });
  }

  if (hasKitchenItems) {
    notificationPromises.push(
      Notification.create({
        tenantId,
        targetRole: 'kitchen',
        message: `New kitchen items ${preposition} order #${orderId}`,
        orderId,
      })
    );
    emitToRole(tenantId, 'kitchen', SocketEvents.NOTIFICATION, {
      message: `New kitchen items ${preposition} order`,
      orderId,
    });
  }

  // Notify waiter + managers about any new items
  const waiterMsg = `New items ${preposition} order`;
  notificationPromises.push(
    Notification.create({ tenantId, targetRole: 'waiter', message: waiterMsg, orderId })
  );
  emitToRole(tenantId, 'waiter', SocketEvents.NOTIFICATION, { message: waiterMsg, orderId });
  emitToRole(tenantId, 'admin', SocketEvents.NOTIFICATION, { message: waiterMsg, orderId });
  emitToRole(tenantId, 'manager', SocketEvents.NOTIFICATION, { message: waiterMsg, orderId });

  await Promise.all(notificationPromises);
}

/* ── List ────────────────────────────────────────────────────────── */
export interface ListOrdersFilter {
  tenantId: string;
  status?: string;
  table?: string;
}

export async function listOrders(filter: ListOrdersFilter) {
  const query: Record<string, unknown> = { tenantId: filter.tenantId };
  if (filter.status) query.status = filter.status;
  if (filter.table) query.table = filter.table;

  return Order.find(query)
    .sort({ createdAt: -1 })
    .populate(ORDER_POPULATE[0])
    .populate(ORDER_POPULATE[1])
    .populate(ORDER_POPULATE[2])
    .limit(100);
}

/* ── Get by id ──────────────────────────────────────────────────── */
export async function getOrderById(tenantId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, tenantId })
    .populate(ORDER_POPULATE[0])
    .populate(ORDER_POPULATE[1])
    .populate(ORDER_POPULATE[2]);
  if (!order) throw createError('Order not found', 404);
  return order;
}

/* ── Update status ──────────────────────────────────────────────── */
export async function updateOrderStatus(
  tenantId: string,
  orderId: string,
  status: OrderStatus,
  changedById: string
) {
  const order = await Order.findOne({ _id: orderId, tenantId });
  if (!order) throw createError('Order not found', 404);

  order.status = status;
  order.statusHistory.push({
    status,
    changedBy: new Types.ObjectId(changedById),
    changedAt: new Date(),
  });
  await order.save();

  await order.populate(ORDER_POPULATE[0]);
  await order.populate(ORDER_POPULATE[1]);
  await order.populate(ORDER_POPULATE[2]);

  // Free the table when no active orders remain
  if (status === 'paid' || status === 'cancelled') {
    const activeCount = await Order.countDocuments({
      tenantId,
      table: order.table,
      status: { $nin: ['paid', 'cancelled'] },
    });
    if (activeCount === 0) {
      await Table.findByIdAndUpdate(order.table, { isOccupied: false });
    }
  }

  emitToTenant(tenantId, SocketEvents.ORDER_UPDATED, order);
  return order;
}

/* ── Update round status ────────────────────────────────────────── */
export async function updateRoundStatus(
  tenantId: string,
  orderId: string,
  roundNumber: number,
  status: OrderStatus,
  changedById: string
) {
  const order = await Order.findOne({ _id: orderId, tenantId });
  if (!order) throw createError('Order not found', 404);

  // Back-fill rounds for orders created before this feature was introduced
  if (!order.rounds || order.rounds.length === 0) {
    const existingRoundNumbers = [...new Set(order.items.map((i) => (i.roundNumber ?? 1)))].sort();
    order.rounds = existingRoundNumbers.map((rn) => ({
      roundNumber: rn,
      status: 'pending' as OrderStatus,
      createdAt: new Date(),
    }));
  }

  const round = order.rounds.find((r) => r.roundNumber === roundNumber);
  if (!round) throw createError('Round not found', 404);

  round.status = status;

  // Overall order status = minimum status across all rounds
  order.status = minStatus(order.rounds);

  order.statusHistory.push({
    status: order.status,
    changedBy: new Types.ObjectId(changedById),
    changedAt: new Date(),
  });

  await order.save();
  await order.populate(ORDER_POPULATE[0]);
  await order.populate(ORDER_POPULATE[1]);
  await order.populate(ORDER_POPULATE[2]);

  // Free the table when all rounds are paid/cancelled
  if (order.status === 'paid' || order.status === 'cancelled') {
    const activeCount = await Order.countDocuments({
      tenantId,
      table: order.table,
      status: { $nin: ['paid', 'cancelled'] },
    });
    if (activeCount === 0) {
      await Table.findByIdAndUpdate(order.table, { isOccupied: false });
    }
  }

  emitToTenant(tenantId, SocketEvents.ORDER_UPDATED, order);
  return order;
}

/* ── Mark item ready ────────────────────────────────────────────── */
export async function markItemReady(tenantId: string, orderId: string, itemId: string) {
  const order = await Order.findOne({ _id: orderId, tenantId });
  if (!order) throw createError('Order not found', 404);

  const item = order.items.find((i) => i._id?.toString() === itemId);
  if (!item) throw createError('Item not found in order', 404);

  item.isReady = true;
  const allReady = order.items.every((i) => i.isReady);
  if (allReady) order.status = 'ready';

  await order.save();

  emitToTenant(tenantId, SocketEvents.ORDER_ITEM_READY, { orderId: order._id, itemId, allReady });
  emitToRole(tenantId, 'waiter', SocketEvents.NOTIFICATION, {
    message: allReady ? `Order #${order._id} fully ready` : `Item ready in order #${order._id}`,
    orderId: order._id,
  });

  return order;
}
