// src/components/AppServices.tsx
import { useSyncEngine } from "@/src/lib/useSyncEngine";
import { useWebSocket } from "@/src/lib/useWebSocket";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useSQLiteContext } from "expo-sqlite";

export function AppServices() {
  const expoDb = useSQLiteContext();
  useDrizzleStudio(expoDb);
  useSyncEngine();
  useWebSocket();
  return null;
}
