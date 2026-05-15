/**
 * QR Code service – generates QR payloads & URLs for tables.
 * The actual QR image generation is done client-side (or via a library like `qrcode`).
 */

const BASE_URL = process.env.CORS_ORIGIN || 'http://localhost:5173';

/**
 * Generates the permanent URL embedded in the table's QR code.
 *
 * Format (works on plain localhost AND on subdomains):
 *   {BASE_URL}/order?tenant={slug}&tableId={tableId}
 *
 * When scanned the frontend:
 *   1. Reads ?tenant= for slug, ?tableId= for the table.
 *   2. Calls  POST /api/public/:slug/scan  { tableId }
 *   3. Receives a session token and stores it for subsequent order requests.
 *
 * Examples:
 *   http://localhost:5173/order?tenant=pixelandplay&tableId=6642f1a2b3c4d5e6f7a8b9c0
 *   https://pixelandplay.mycafe.com/order?tableId=6642f1a2b3c4d5e6f7a8b9c0  (subdomain)
 */
export function generateTableQrPayload(tenantSlug: string, tableId: string): string {
  return `${BASE_URL}/order?tenant=${tenantSlug}&tableId=${tableId}`;
}

/**
 * Batch-generate QR payloads for multiple tables.
 */
export function generateBulkQrPayloads(
  tenantSlug: string,
  tables: { _id: string; number: number }[]
): { tableNumber: number; tableId: string; url: string }[] {
  return tables.map((t) => ({
    tableNumber: t.number,
    tableId: t._id,
    url: generateTableQrPayload(tenantSlug, t._id),
  }));
}
