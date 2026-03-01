// src/lib/useSyncEngine.ts
import { db } from "@/src/db";
import { foodLogs } from "@/src/db/schema";
import { isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { fetchAndSyncFromServer, syncPendingLogs } from "./sync";

export function useSyncEngine() {
  const appState = useRef(AppState.currentState);

  const { data: unsyncedLogs = [] } = useLiveQuery(
    db.select().from(foodLogs).where(isNull(foodLogs.syncedAt)),
  );

  // fires immediately when a new unsynced log appears
  useEffect(() => {
    if (unsyncedLogs.length === 0) return;
    console.log(
      `[SyncEngine] ${unsyncedLogs.length} unsynced log(s) detected, syncing`,
    );
    syncPendingLogs();
  }, [unsyncedLogs]);

  // on mount — push pending + pull from server
  useEffect(() => {
    console.log("[SyncEngine] mounted, initial sync");
    syncPendingLogs();
    fetchAndSyncFromServer();

    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      console.log(`[SyncEngine] app state: ${appState.current} → ${next}`);
      if (appState.current.match(/inactive|background/) && next === "active") {
        console.log("[SyncEngine] foregrounded, syncing");
        syncPendingLogs();
        fetchAndSyncFromServer();
      }
      appState.current = next;
    });

    return () => {
      console.log("[SyncEngine] unmounted, removing listener");
      sub.remove();
    };
  }, []);
}
