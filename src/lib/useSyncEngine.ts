import { db } from "@/src/db";
import { foodLogs } from "@/src/db/schema";
import { useNetInfo } from "@react-native-community/netinfo";
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
  const wasOffline = useRef(false);
  const netInfo = useNetInfo();

  const { data: unsyncedLogs = [] } = useLiveQuery(
    db.select().from(foodLogs).where(isNull(foodLogs.syncedAt)),
  );

  // Sync unsynced logs whenever they appear
  useEffect(() => {
    if (unsyncedLogs.length === 0) return;
    console.log(
      `[SyncEngine] ${unsyncedLogs.length} unsynced log(s) detected, syncing`,
    );
    syncPendingLogs();
  }, [unsyncedLogs]);

  // Sync when internet comes back while app is in foreground
  useEffect(() => {
    const isOnline =
      netInfo.isConnected === true && netInfo.isInternetReachable === true;

    if (wasOffline.current && isOnline) {
      console.log("[SyncEngine] internet restored, syncing");
      syncPendingLogs();
      fetchAndSyncFromServer();
      fetchAndSyncPreferences();
    }

    wasOffline.current = !isOnline;
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  // Initial sync + foreground sync
  useEffect(() => {
    console.log("[SyncEngine] mounted, initial sync");
    syncPendingLogs();
    fetchAndSyncFromServer();
    fetchAndSyncPreferences();

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
