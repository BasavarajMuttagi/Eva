// src/lib/useWebSocket.ts
import { db } from "@/src/db";
import { foodLogItems, foodLogs } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { useEffect, useRef } from "react";
import { API_BASE } from "./apiClient";
import { authClient } from "./auth-client";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close(1000, "unmount");
    };
  }, []);

  function connect() {
    const cookie = authClient.getCookie();
    const wsBase = API_BASE.replace("https", "wss").replace("http", "ws");
    const url = `${wsBase}/api/ws?cookie=${encodeURIComponent(cookie ?? "")}`;

    console.log("[WS] connecting to", wsBase);

    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      console.log("[WS] connected");
    };

    socket.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("[WS] received:", payload);
        await handleMessage(payload);
      } catch (err) {
        console.error("[WS] failed to handle message:", err);
      }
    };

    socket.onclose = (event) => {
      console.log("[WS] disconnected:", event.code);
      if (event.code !== 1000) {
        setTimeout(connect, 3000);
      }
    };

    socket.onerror = (err) => {
      console.error("[WS] error:", err);
    };
  }

  async function handleMessage(payload: {
    type: string;
    logId: string;
    state: string;
    explanation?: string;
    errorMessage?: string;
    items?: Array<{
      id: string;
      foodName: string;
      quantityDescription: string;
      quantityTotal: number;
      unit: "g" | "ml";
      caloriesPer100: number;
      carbsPer100: number;
      proteinPer100: number;
      fatPer100: number;
      createdAt: string;
      updatedAt: string;
    }>;
  }) {
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
          id: item.id, // ← server id, same as in DB
          logId: payload.logId,
          foodName: item.foodName,
          quantityDescription: item.quantityDescription,
          quantityTotal: item.quantityTotal,
          unit: item.unit,
          caloriesPer100: item.caloriesPer100,
          carbsPer100: item.carbsPer100,
          proteinPer100: item.proteinPer100,
          fatPer100: item.fatPer100,
          createdAt: new Date(item.createdAt), // ← server timestamp
          updatedAt: new Date(item.updatedAt), // ← server timestamp
        });
      }

      console.log(`[WS] ✓ log ${payload.logId} updated to done`);
    }
  }
}
