import { foodLogItems, foodLogs } from "@/src/db/schema";

export type FoodLogItem = typeof foodLogItems.$inferSelect;

export type FoodLog = typeof foodLogs.$inferSelect & {
  items: FoodLogItem[];
};
