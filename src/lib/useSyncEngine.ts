// src/lib/useSyncEngine.ts
import { db } from "@/src/db";
import { foodLogs } from "@/src/db/schema";
import { isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { syncPendingLogs } from "./sync";

export function useSyncEngine() {
  const appState = useRef(AppState.currentState);

  // watches SQLite for any rows where syncedAt = null
  // fires immediately whenever a new unsynced log is inserted
  const { data: unsyncedLogs = [] } = useLiveQuery(
    db.select().from(foodLogs).where(isNull(foodLogs.syncedAt)),
  );

  // whenever unsyncedLogs changes (new log added), trigger sync
  useEffect(() => {
    if (unsyncedLogs.length === 0) return;
    console.log(
      `[SyncEngine] ${unsyncedLogs.length} unsynced log(s) detected, syncing`,
    );
    syncPendingLogs();
  }, [unsyncedLogs]);

  // still keep AppState listener for coming back from background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      console.log(`[SyncEngine] app state: ${appState.current} → ${next}`);
      if (appState.current.match(/inactive|background/) && next === "active") {
        console.log("[SyncEngine] foregrounded, syncing");
        syncPendingLogs();
      }
      appState.current = next;
    });

    return () => {
      console.log("[SyncEngine] unmounted, removing listener");
      sub.remove();
    };
  }, []);
}
