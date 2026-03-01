import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const GENDER_VALUES = ["male", "female", "other"] as const;
export const ACTIVITY_VALUES = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;
export const LOG_STATE_VALUES = [
  "pending",
  "processing",
  "done",
  "error",
] as const;
export const UNIT_VALUES = ["g", "ml"] as const;

export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  heightCm: integer("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  age: integer("age").notNull(),
  gender: text("gender", { enum: GENDER_VALUES }).notNull(),
  activityLevel: text("activity_level", { enum: ACTIVITY_VALUES }).notNull(),
  waterTrackingEnabled: integer("water_tracking_enabled", { mode: "boolean" })
    .default(false)
    .notNull(),
  sleepTrackingEnabled: integer("sleep_tracking_enabled", { mode: "boolean" })
    .default(false)
    .notNull(),
  syncedAt: integer("synced_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export const weightLogs = sqliteTable(
  "weight_logs",
  {
    id: text("id").primaryKey(),
    weightKg: real("weight_kg").notNull(),
    syncedAt: integer("synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("weight_logs_created_idx").on(table.createdAt)],
);

export const foodLogs = sqliteTable(
  "food_logs",
  {
    id: text("id").primaryKey(),
    rawText: text("raw_text").notNull(),
    explanation: text("explanation"),
    state: text("state", { enum: LOG_STATE_VALUES })
      .default("pending")
      .notNull(),
    errorMessage: text("error_message"),
    version: integer("version").default(1).notNull(),
    syncedAt: integer("synced_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("food_logs_created_idx").on(table.createdAt)],
);

export const foodLogItems = sqliteTable(
  "food_log_items",
  {
    id: text("id").primaryKey(),
    logId: text("log_id")
      .notNull()
      .references(() => foodLogs.id, { onDelete: "cascade" }),
    foodName: text("food_name").notNull(),
    quantityDescription: text("quantity_description").notNull(),
    quantityTotal: real("quantity_total").notNull(),
    unit: text("unit", { enum: UNIT_VALUES }).notNull(),
    caloriesPer100: real("calories_per_100").notNull(),
    carbsPer100: real("carbs_per_100").notNull(),
    proteinPer100: real("protein_per_100").notNull(),
    fatPer100: real("fat_per_100").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("food_items_log_idx").on(table.logId)],
);

// ---- Relations ----

export const foodLogsRelations = relations(foodLogs, ({ many }) => ({
  items: many(foodLogItems),
}));

export const foodLogItemsRelations = relations(foodLogItems, ({ one }) => ({
  log: one(foodLogs, {
    fields: [foodLogItems.logId],
    references: [foodLogs.id],
  }),
}));
