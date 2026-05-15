// Type guards used at controller boundaries to reject malformed input before
// it reaches Mongoose. These specifically defend against the JSON-body NoSQL
// injection pattern: e.g. {"email": {"$gt": ""}} would otherwise become a
// matches-anything Mongo selector.

export const isString = (v: unknown): v is string => typeof v === 'string';

export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (v: unknown): v is string =>
  isNonEmptyString(v) && EMAIL_RE.test(v);

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/** For account creation / password change. Rejects too-short or too-long. */
export const isAcceptablePassword = (v: unknown): v is string =>
  typeof v === 'string' && v.length >= PASSWORD_MIN && v.length <= PASSWORD_MAX;

/** For login/compare. We accept any non-empty string and let bcrypt decide. */
export const isLoginPassword = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0 && v.length <= PASSWORD_MAX;

export const isOneOf =
  <T extends string>(allowed: readonly T[]) =>
  (v: unknown): v is T =>
    typeof v === 'string' && (allowed as readonly string[]).includes(v);
