import { db } from "@/src/db";
import { foodLogs } from "@/src/db/schema";
import { isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  fetchAndSyncFromServer,
  fetchAndSyncPreferences,
  syncPendingLogs,
} from "./sync";

export function useSyncEngine() {
  const appState = useRef(AppState.currentState);

  const { data: unsyncedLogs = [] } = useLiveQuery(
    db.select().from(foodLogs).where(isNull(foodLogs.syncedAt)),
  );

  useEffect(() => {
    if (unsyncedLogs.length === 0) return;
    console.log(
      `[SyncEngine] ${unsyncedLogs.length} unsynced log(s) detected, syncing`,
    );
    syncPendingLogs();
  }, [unsyncedLogs]);

  useEffect(() => {
    console.log("[SyncEngine] mounted, initial sync");
    syncPendingLogs();
    fetchAndSyncFromServer();
    fetchAndSyncPreferences(); // hydrate local DB once on mount

    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      console.log(`[SyncEngine] app state: ${appState.current} → ${next}`);
      if (appState.current.match(/inactive|background/) && next === "active") {
        console.log("[SyncEngine] foregrounded, syncing");
        syncPendingLogs();
        fetchAndSyncFromServer();
        fetchAndSyncPreferences();
      }
      appState.current = next;
    });

    return () => {
      console.log("[SyncEngine] unmounted, removing listener");
      sub.remove();
    };
  }, []);
}
