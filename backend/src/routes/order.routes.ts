import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import { optionalSession, requireSessionOrAuth } from '../middleware/sessionAuth';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../utils/schemas';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateRoundStatus,
  markItemReady,
} from '../controllers/order.controller';

const router = Router();

// Create order:
//   - Customer (QR): sends x-session-token header → optionalSession sets req.tableSession
//   - Staff:         sends Authorization: Bearer  → optionalAuthenticate sets req.user
//   - requireSessionOrAuth rejects if neither is present
router.post(
  '/',
  optionalAuthenticate,
  optionalSession,
  requireSessionOrAuth,
  validate(createOrderSchema),
  createOrder
);

// Authenticated routes
router.use(authenticate, tenantIsolation);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch(
  '/:id/status',
  authorize('admin', 'manager', 'waiter', 'barman', 'kitchen', 'cashier'),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);
router.patch(
  '/:id/rounds/:roundNumber/status',
  authorize('admin', 'manager', 'waiter', 'barman', 'kitchen', 'cashier'),
  updateRoundStatus
);
router.patch('/:id/items/:itemId/ready', authorize('barman', 'kitchen'), markItemReady);

export default router;
