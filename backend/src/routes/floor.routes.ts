import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { tenantIsolation } from '../middleware/tenantIsolation';
import { validate } from '../middleware/validate';
import { namedEntitySchema } from '../utils/schemas';
import { getFloors, createFloor, updateFloor, deleteFloor } from '../controllers/floor.controller';

const router = Router();

router.use(authenticate, tenantIsolation);

router.get('/', getFloors);
router.post('/', authorize('admin', 'manager'), validate(namedEntitySchema), createFloor);
router.put('/:id', authorize('admin', 'manager'), validate(namedEntitySchema), updateFloor);
router.delete('/:id', authorize('admin', 'manager'), deleteFloor);

export default router;
