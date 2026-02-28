// src/lib/sync.ts
import { db } from "@/src/db";
import { foodLogs } from "@/src/db/schema";
import { eq, isNull } from "drizzle-orm";
import { apiClient } from "./apiClient";

let isSyncing = false;

export async function syncPendingLogs() {
  if (isSyncing) {
    console.log("[Sync] already syncing, skipping");
    return;
  }
  isSyncing = true;
  console.log("[Sync] starting sync");

  try {
    const unsynced = await db
      .select()
      .from(foodLogs)
      .where(isNull(foodLogs.syncedAt));

    console.log(`[Sync] found ${unsynced.length} unsynced logs`);

    if (unsynced.length === 0) {
      console.log("[Sync] nothing to sync");
      return;
    }

    for (const log of unsynced) {
      try {
        console.log(`[Sync] pushing log ${log.id} — "${log.rawText}"`);

        await apiClient.post("/api/log", {
          id: log.id,
          rawText: log.rawText,
          createdAt: new Date(log.createdAt),
          updatedAt: new Date(log.updatedAt),
          version: log.version,
        });

        await db
          .update(foodLogs)
          .set({ syncedAt: new Date() })
          .where(eq(foodLogs.id, log.id));

        console.log(`[Sync] ✓ log ${log.id} synced`);
      } catch (err) {
        console.warn(`[Sync] ✗ failed to sync log ${log.id}:`, err);
      }
    }

    console.log("[Sync] sync complete");
  } finally {
    isSyncing = false;
  }
}
