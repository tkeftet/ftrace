import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export function useStaffSocket(onEvent: (event: string, data: unknown) => void) {
  const { token } = useAuthStore();
  const onEventRef = useRef(onEvent);
  useEffect(() => { onEventRef.current = onEvent; });

  useEffect(() => {
    if (!token) return;

    let tenantId: string;
    try {
      tenantId = JSON.parse(atob(token.split('.')[1])).tenantId as string;
    } catch {
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL as string;
    const socket = io(`${socketUrl}/tenant-${tenantId}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const handler = (event: string, ...args: unknown[]) => {
      onEventRef.current(event, args[0]);
    };
    socket.onAny(handler);

    return () => {
      socket.offAny(handler);
      socket.disconnect();
    };
  }, [token]);
}
