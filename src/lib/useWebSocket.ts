// src/lib/useWebSocket.ts
import { db } from "@/src/db";
import { foodLogItems, foodLogs } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useRef } from "react";
import { authClient } from "./auth-client";
import { API_BASE_URL } from "./constants";

type WsItem = Omit<typeof foodLogItems.$inferSelect, "syncedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type WsPayload = {
  type: string;
  logId: string;
  state: string;
  explanation?: string;
  errorMessage?: string;
  items?: WsItem[];
};

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const pingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleMessage = useCallback(async (payload: WsPayload) => {
    if (payload.type !== "log:updated") return;

    const now = new Date();

    if (payload.state === "processing") {
      await db
        .update(foodLogs)
        .set({ state: "processing", updatedAt: now })
        .where(eq(foodLogs.id, payload.logId));
      return;
    }

    if (payload.state === "error") {
      await db
        .update(foodLogs)
        .set({
          state: "error",
          errorMessage: payload.errorMessage ?? "Error",
          updatedAt: now,
        })
        .where(eq(foodLogs.id, payload.logId));
      return;
    }

    if (payload.state === "done" && payload.items) {
      await db
        .delete(foodLogItems)
        .where(eq(foodLogItems.logId, payload.logId));

      await db
        .update(foodLogs)
        .set({
          state: "done",
          explanation: payload.explanation ?? null,
          updatedAt: now,
        })
        .where(eq(foodLogs.id, payload.logId));

      for (const item of payload.items) {
        await db.insert(foodLogItems).values({
          id: item.id,
          logId: payload.logId,
          userId: item.userId,
          foodName: item.foodName,
          quantityDescription: item.quantityDescription,
          quantityTotal: item.quantityTotal,
          unit: item.unit,
          caloriesPer100: item.caloriesPer100,
          carbsPer100: item.carbsPer100,
          proteinPer100: item.proteinPer100,
          fatPer100: item.fatPer100,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        });
      }

      console.log(`[WS] ✓ log ${payload.logId} updated to done`);
    }
  }, []);

  const connect = useCallback(() => {
    const cookie = authClient.getCookie();
    const wsBase = API_BASE_URL.replace("https", "wss").replace("http", "ws");
    const url = `${wsBase}/api/ws?cookie=${encodeURIComponent(cookie ?? "")}`;

    console.log("[WS] connecting to", wsBase);

    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      console.log("[WS] connected");
      pingInterval.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping");
        }
      }, 30_000);
    };

    socket.onmessage = async (event) => {
      if (event.data === "pong") return;
      try {
        const payload: WsPayload = JSON.parse(event.data);
        console.log("[WS] received:", payload);
        await handleMessage(payload);
      } catch (err) {
        console.error("[WS] failed to handle message:", err);
      }
    };

    socket.onclose = (event) => {
      console.log("[WS] disconnected:", event.code);
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
        pingInterval.current = null;
      }
      if (event.code !== 1000) {
        setTimeout(connect, 3000);
      }
    };

    socket.onerror = (err) => {
      console.error("[WS] error:", err);
    };
  }, [handleMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current);
      ws.current?.close(1000, "unmount");
    };
  }, [connect]);
}
