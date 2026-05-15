import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import {
  getTables,
  createTable,
  updateTable,
  assignTable,
  deleteTable,
} from '../controllers/table.controller';
import { closeSession, getActiveSession } from '../controllers/tableSession.controller';

const router = Router();

router.use(authenticate, tenantIsolation);

router.get('/', getTables);
router.post('/', authorize('admin'), createTable);
router.put('/:id', authorize('admin', 'waiter'), updateTable);
router.patch('/:id/assign', authorize('admin', 'waiter'), assignTable);
router.delete('/:id', authorize('admin'), deleteTable);

// Table session management
router.get(
  '/:tableId/session',
  authorize('admin', 'manager', 'waiter', 'cashier'),
  getActiveSession
);
router.post('/:tableId/close-session', authorize('admin', 'manager', 'cashier'), closeSession);

export default router;
