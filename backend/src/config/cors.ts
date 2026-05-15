import { CorsOptions } from 'cors';
import { env } from './env';

// Support comma-separated list e.g. "https://app.example.com,https://admin.example.com"
const ALLOWED_ORIGINS = env.CORS_ORIGIN.split(',').map((o) => o.trim());
const ALLOWED_HOSTS = ALLOWED_ORIGINS.map((o) => new URL(o).host);

// Always permitted in development (vite dev server ports)
const DEV_HOSTS = ['localhost:5173', 'localhost:5174'];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    try {
      const { host } = new URL(origin);
      const allowed =
        DEV_HOSTS.includes(host) || ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
      callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
    } catch {
      callback(new Error('Invalid origin'), false);
    }
  },
  credentials: true,
};
