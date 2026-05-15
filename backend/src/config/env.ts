import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET_MIN_LENGTH = 32;

function readRequired(key: string, minLength = 1): string {
  const value = process.env[key];
  if (!value || value.length < minLength) {
    throw new Error(
      `[env] ${key} is missing or shorter than ${minLength} chars — refusing to start. ` +
        `Set it in .env (or your secrets manager).`
    );
  }
  return value;
}

function readInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    throw new Error(`[env] ${key} must be an integer, got "${raw}"`);
  }
  return n;
}

// Validated and frozen at boot. Any module that reads env should import from
// here instead of touching process.env directly — this is the single place
// that decides what's required vs. optional, and what counts as "valid".
export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: readInt('PORT', 5000),

  // Auth
  JWT_SECRET: readRequired('JWT_SECRET', JWT_SECRET_MIN_LENGTH),

  // Database
  MONGO_URI: readRequired('MONGO_URI'),
  MONGO_URI_FALLBACK: process.env.MONGO_URI_FALLBACK,

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: readInt('RATE_LIMIT_WINDOW_MS', 60_000),
  RATE_LIMIT_MAX: readInt('RATE_LIMIT_MAX', 100),

  // Table sessions
  SESSION_TTL_HOURS: readInt('SESSION_TTL_HOURS', 2),

  // Optional
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
});

export const isProduction = env.NODE_ENV === 'production';
