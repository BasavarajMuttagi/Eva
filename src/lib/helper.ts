import { db } from "@/src/db";
import {
  foodLogItems,
  foodLogs,
  userPreferences,
  weightLogs,
} from "../db/schema";

export async function clearLocalDb() {
  await db.delete(foodLogs);
  await db.delete(foodLogItems);
  await db.delete(weightLogs);
  await db.delete(userPreferences);
  console.log("clearing local DB");
}
