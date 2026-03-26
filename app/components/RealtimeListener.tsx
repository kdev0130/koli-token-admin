"use client";

import { useEffect, useRef } from "react";

export function RealtimeListener() {
  const reloadTimer = useRef<number | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_REALTIME_WS_URL;
    if (!wsUrl) {
      return;
    }

    let socket: WebSocket | null = null;
    let isClosed = false;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        if (!event?.data) return;

        let payload: { event?: string } | null = null;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }

        if (!payload || payload.event === "connected") {
          return;
        }

        if (reloadTimer.current) {
          return;
        }

        reloadTimer.current = window.setTimeout(() => {
          reloadTimer.current = null;
          window.location.reload();
        }, 400);
      };

      socket.onclose = () => {
        if (isClosed) return;
        window.setTimeout(connect, 1500);
      };
    };

    connect();

    return () => {
      isClosed = true;
      if (reloadTimer.current) {
        window.clearTimeout(reloadTimer.current);
        reloadTimer.current = null;
      }
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return null;
}
