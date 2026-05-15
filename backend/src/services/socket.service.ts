import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { corsOptions } from '../config/cors';
import { JwtPayload, SocketEvents } from '../types';
import { createError } from '../utils/AppError';

let io: Server;

/**
 * Initialise Socket.io with per-tenant namespaces.
 * Each tenant connects to `/tenant-{tenantId}`.
 * Within a namespace, users join rooms by role: `role:serveur`, `role:barman`, etc.
 */
export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Dynamic namespace: /tenant-<tenantId>
  const tenantNsp = io.of(/^\/tenant-.+$/);

  tenantNsp.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      const nspTenantId = socket.nsp.name.replace('/tenant-', '');

      if (payload.tenantId !== nspTenantId && payload.role !== 'super_admin') {
        return next(new Error('Tenant mismatch'));
      }

      (socket as Socket & { user?: JwtPayload }).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  tenantNsp.on('connection', (socket: Socket & { user?: JwtPayload }) => {
    const user = socket.user!;
    console.log(`[Socket] ${user.role} connected to ${socket.nsp.name}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] ${user.role} disconnected from ${socket.nsp.name}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw createError('Socket.io not initialised', 500);
  return io;
}

/**
 * Emit an event to a specific tenant namespace.
 */
export function emitToTenant(tenantId: string, event: SocketEvents, data: unknown): void {
  getIO().of(`/tenant-${tenantId}`).emit(event, data);
}

/**
 * Emit an event to a specific role within a tenant namespace.
 */
export function emitToRole(
  tenantId: string,
  role: string,
  event: SocketEvents,
  data: unknown
): void {
  getIO().of(`/tenant-${tenantId}`).to(`role:${role}`).emit(event, data);
}
