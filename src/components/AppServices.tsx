// src/components/AppServices.tsx
import { useSyncEngine } from "@/src/lib/useSyncEngine";
import { useWebSocket } from "@/src/lib/useWebSocket";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { db } from "../db";
import { userPreferences } from "../db/schema";
import { authClient } from "../lib/auth-client";
import { clearLocalDb } from "../lib/helper";
import { syncPendingLogs } from "../lib/sync";

export function AppServices() {
  const expoDb = useSQLiteContext();
  const { data: session } = authClient.useSession();

  useDrizzleStudio(expoDb);
  useSyncEngine();
  useWebSocket();

  useEffect(() => {
    if (!session?.user?.id) return;

    const checkUser = async () => {
      const pref = await db.select().from(userPreferences).limit(1);
      if (!pref[0]) return; // fresh install, nothing to do

      if (pref[0].userId === session.user.id) {
        // same user — sync stuck logs then clear for fresh state
        await syncPendingLogs();
        await clearLocalDb();
        return;
      }

      // different user — unsynced logs are unrecoverable, just clear
      console.log("[AppServices] different user detected");
      await clearLocalDb();
    };

    checkUser();
  }, [session?.user?.id]);

  return null;
}
