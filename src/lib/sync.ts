import { db } from "@/src/db";
import { foodLogItems, foodLogs, userPreferences } from "@/src/db/schema";
import { eq, isNull, lte } from "drizzle-orm";
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
        if (log.version === 1) {
          console.log(
            `[Sync] POST log ${log.id} v${log.version} — "${log.rawText}"`,
          );
          await apiClient.post("/api/log", {
            id: log.id,
            rawText: log.rawText,
            createdAt:
              log.createdAt instanceof Date
                ? log.createdAt.getTime()
                : log.createdAt,
            updatedAt:
              log.updatedAt instanceof Date
                ? log.updatedAt.getTime()
                : log.updatedAt,
            version: log.version,
          });
        } else {
          console.log(
            `[Sync] PATCH log ${log.id} v${log.version} — "${log.rawText}"`,
          );
          await apiClient.patch(`/api/log/${log.id}`, {
            rawText: log.rawText,
            version: log.version,
            updatedAt:
              log.updatedAt instanceof Date
                ? log.updatedAt.getTime()
                : log.updatedAt,
          });
        }

        await db
          .update(foodLogs)
          .set({ syncedAt: new Date() })
          .where(eq(foodLogs.id, log.id));

        console.log(`[Sync] ✓ log ${log.id} v${log.version} synced`);
      } catch (err) {
        console.warn(`[Sync] ✗ failed to sync log ${log.id}:`, err);
      }
    }

    console.log("[Sync] sync complete");
  } finally {
    isSyncing = false;
  }
}

type ServerFoodLogItem = Omit<typeof foodLogItems.$inferSelect, "syncedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type ServerFoodLog = Omit<typeof foodLogs.$inferSelect, "syncedAt"> & {
  createdAt: string;
  updatedAt: string;
  items: ServerFoodLogItem[];
};

type ServerPreferences = Omit<
  typeof userPreferences.$inferSelect,
  "syncedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export async function fetchAndSyncFromServer() {
  console.log("[Sync] fetching latest logs from server");
  try {
    const res = await apiClient.get<ServerFoodLog[]>("/api/logs");
    const serverLogs = res.data;

    console.log(`[Sync] received ${serverLogs.length} logs from server`);

    await db.transaction(async (tx) => {
      for (const log of serverLogs) {
        await tx
          .insert(foodLogs)
          .values({
            id: log.id,
            userId: log.userId,
            rawText: log.rawText,
            explanation: log.explanation,
            state: log.state,
            errorMessage: log.errorMessage,
            version: log.version,
            totalCalories: log.totalCalories,
            totalProtein: log.totalProtein,
            totalCarbs: log.totalCarbs,
            totalFat: log.totalFat,
            syncedAt: new Date(),
            createdAt: new Date(log.createdAt),
            updatedAt: new Date(log.updatedAt),
          })
          .onConflictDoUpdate({
            target: foodLogs.id,
            set: {
              rawText: log.rawText,
              explanation: log.explanation,
              state: log.state,
              errorMessage: log.errorMessage,
              version: log.version,
              totalCalories: log.totalCalories,
              totalProtein: log.totalProtein,
              totalCarbs: log.totalCarbs,
              totalFat: log.totalFat,
              syncedAt: new Date(),
              updatedAt: new Date(log.updatedAt),
            },
            setWhere: lte(foodLogs.version, log.version),
          });

        for (const item of log.items ?? []) {
          await tx
            .insert(foodLogItems)
            .values({
              id: item.id,
              logId: item.logId,
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
            })
            .onConflictDoNothing();
        }
      }
    });

    console.log("[Sync] server sync complete");
  } catch (err) {
    console.warn("[Sync] failed to fetch from server:", err);
  }
}

export async function fetchAndSyncPreferences() {
  try {
    const res = await apiClient.get<ServerPreferences | null>(
      "/api/preferences",
    );
    const serverPref = res.data;

    if (!serverPref) return;

    await db
      .insert(userPreferences)
      .values({
        userId: serverPref.userId,
        heightCm: serverPref.heightCm,
        weightKg: serverPref.weightKg,
        age: serverPref.age,
        gender: serverPref.gender,
        activityLevel: serverPref.activityLevel,
        waterTrackingEnabled: serverPref.waterTrackingEnabled,
        sleepTrackingEnabled: serverPref.sleepTrackingEnabled,
        createdAt: new Date(serverPref.createdAt),
        updatedAt: new Date(serverPref.updatedAt),
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          heightCm: serverPref.heightCm,
          weightKg: serverPref.weightKg,
          age: serverPref.age,
          gender: serverPref.gender,
          activityLevel: serverPref.activityLevel,
          waterTrackingEnabled: serverPref.waterTrackingEnabled,
          sleepTrackingEnabled: serverPref.sleepTrackingEnabled,
          updatedAt: new Date(serverPref.updatedAt),
        },
      });

    console.log("[Sync] ✓ preferences fetched from server");
  } catch (err) {
    console.warn("[Sync] failed to fetch preferences:", err);
  }
}
