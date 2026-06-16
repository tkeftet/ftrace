import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { isProduction } from './config/env';
import { tenantRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import menuRoutes from './routes/menu.routes';
import menuImportRoutes from './routes/menuImport.routes';
import tableRoutes from './routes/table.routes';
import orderRoutes from './routes/order.routes';
import notificationRoutes from './routes/notification.routes';
import tenantRoutes from './routes/tenant.routes';
import staffRoutes from './routes/staff.routes';
import superAdminRoutes from './routes/superAdmin.routes';
import publicRoutes from './routes/public.routes';
import sectionRoutes from './routes/section.routes';
import floorRoutes from './routes/floor.routes';

const app = express();

/* ── Reverse proxy ── */
// Render (and most PaaS) put the app behind a single proxy hop that sets
// X-Forwarded-For/Proto. Trust that one hop so req.ip reflects the real
// client IP — required for the IP-keyed rate limiters and to stop
// express-rate-limit from throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
if (isProduction) {
  app.set('trust proxy', 1);
}

/* ── Global middleware ── */
app.use(cors(corsOptions));
app.use(express.json());
app.use(tenantRateLimiter);

/* ── Health check ── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── Public routes (no auth) ── */
app.use('/api/public', publicRoutes);

/* ── Auth ── */
app.use('/api/auth', authRoutes);

/* ── Tenant-scoped API ── */
app.use('/api/menu', menuRoutes);
app.use('/api/menu/import', menuImportRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/staff', staffRoutes);

/* ── Super Admin ── */
app.use('/api/super-admin', superAdminRoutes);

/* ── Error handler (must be last) ── */
app.use(errorHandler);

export default app;
