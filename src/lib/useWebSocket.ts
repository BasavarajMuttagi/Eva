import { db } from "@/src/db";
import { foodLogItems, foodLogs } from "@/src/db/schema";
import NetInfo from "@react-native-community/netinfo";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useRef } from "react";
import { authClient } from "./auth-client";
import { API_BASE_URL } from "./constants";

type WsItem = Omit<typeof foodLogItems.$inferSelect, "syncedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type WsPayload =
  | { type: "log:updated"; logId: string; state: "processing" }
  | { type: "log:updated"; logId: string; state: "error"; errorMessage: string }
  | {
      type: "log:updated";
      logId: string;
      state: "done";
      explanation: string;
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      items: WsItem[];
    };

const BASE_DELAY = 3_000;
const MAX_DELAY = 60_000;
const MAX_ATTEMPTS = 8;

function getBackoffDelay(attempt: number) {
  const delay = Math.min(BASE_DELAY * 2 ** attempt, MAX_DELAY);
  return delay * (0.8 + Math.random() * 0.4); // ±20% jitter
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const pingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempts = useRef(0);
  const mounted = useRef(true);

  const stopPing = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
  };

  const stopReconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
  };

  const scheduleReconnect = useCallback((connectFn: () => void) => {
    if (!mounted.current) return;
    if (attempts.current >= MAX_ATTEMPTS) {
      console.warn("[WS] max reconnect attempts reached, giving up");
      return;
    }

    NetInfo.fetch().then((state) => {
      if (!mounted.current) return;
      if (!state.isConnected || !state.isInternetReachable) {
        console.log("[WS] offline — will reconnect when internet restores");
        return;
      }
      const delay = getBackoffDelay(attempts.current);
      attempts.current += 1;
      console.log(
        `[WS] reconnecting in ${Math.round(delay / 1000)}s (attempt ${attempts.current})`,
      );
      reconnectTimeout.current = setTimeout(connectFn, delay);
    });
  }, []);

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
          errorMessage: payload.errorMessage,
          updatedAt: now,
        })
        .where(eq(foodLogs.id, payload.logId));
      return;
    }

    if (payload.state === "done") {
      await db
        .delete(foodLogItems)
        .where(eq(foodLogItems.logId, payload.logId));
      await db
        .update(foodLogs)
        .set({
          state: "done",
          explanation: payload.explanation,
          totalCalories: payload.totalCalories,
          totalProtein: payload.totalProtein,
          totalCarbs: payload.totalCarbs,
          totalFat: payload.totalFat,
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
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        });
      }

      console.log(`[WS] ✓ log ${payload.logId} updated to done`);
    }
  }, []);

  const connect = useCallback(() => {
    if (!mounted.current) return;

    const cookie = authClient.getCookie();
    const wsBase = API_BASE_URL.replace("https", "wss").replace("http", "ws");
    const url = `${wsBase}/api/ws?cookie=${encodeURIComponent(cookie ?? "")}`;

    console.log(`[WS] connecting (attempt ${attempts.current + 1})`);
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      console.log("[WS] connected");
      attempts.current = 0;
      pingInterval.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) socket.send("ping");
      }, 30_000);
    };

    socket.onmessage = async (event) => {
      if (event.data === "pong") return;
      try {
        const payload: WsPayload = JSON.parse(event.data);
        console.log("[WS] received:", JSON.stringify(payload).slice(0, 200));
        await handleMessage(payload);
      } catch (err) {
        console.error("[WS] failed to handle message:", err);
      }
    };

    socket.onerror = () => console.warn("[WS] connection error");

    socket.onclose = (event) => {
      console.log(`[WS] disconnected: code=${event.code}`);
      stopPing();
      if (event.code !== 1000) scheduleReconnect(connect);
    };
  }, [handleMessage, scheduleReconnect]);

  // Reconnect immediately when internet restores
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable;
      const isClosed =
        !ws.current || ws.current.readyState === WebSocket.CLOSED;
      if (isOnline && isClosed && mounted.current) {
        console.log("[WS] internet restored, reconnecting");
        stopReconnect();
        attempts.current = 0;
        connect();
      }
    });
    return () => unsub();
  }, [connect]);

  useEffect(() => {
    mounted.current = true;
    connect();
    return () => {
      mounted.current = false;
      stopPing();
      stopReconnect();
      ws.current?.close(1000, "unmount");
    };
  }, [connect]);
}
