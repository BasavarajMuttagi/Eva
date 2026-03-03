PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_food_log_items` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`user_id` text NOT NULL,
	`food_name` text NOT NULL,
	`quantity_description` text NOT NULL,
	`quantity_total` real NOT NULL,
	`unit` text NOT NULL,
	`calories_per_100` real NOT NULL,
	`carbs_per_100` real NOT NULL,
	`protein_per_100` real NOT NULL,
	`fat_per_100` real NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_food_log_items`("id", "log_id", "user_id", "food_name", "quantity_description", "quantity_total", "unit", "calories_per_100", "carbs_per_100", "protein_per_100", "fat_per_100", "created_at", "updated_at") SELECT "id", "log_id", "user_id", "food_name", "quantity_description", "quantity_total", "unit", "calories_per_100", "carbs_per_100", "protein_per_100", "fat_per_100", "created_at", "updated_at" FROM `food_log_items`;--> statement-breakpoint
DROP TABLE `food_log_items`;--> statement-breakpoint
ALTER TABLE `__new_food_log_items` RENAME TO `food_log_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `food_items_log_idx` ON `food_log_items` (`log_id`);--> statement-breakpoint
CREATE INDEX `food_items_user_idx` ON `food_log_items` (`user_id`);--> statement-breakpoint
ALTER TABLE `food_logs` ADD `user_id` text NOT NULL;--> statement-breakpoint
CREATE TABLE `__new_user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`height_cm` integer NOT NULL,
	`weight_kg` real NOT NULL,
	`age` integer NOT NULL,
	`gender` text NOT NULL,
	`activity_level` text NOT NULL,
	`water_tracking_enabled` integer DEFAULT false NOT NULL,
	`sleep_tracking_enabled` integer DEFAULT false NOT NULL,
	`synced_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_preferences`("user_id", "height_cm", "weight_kg", "age", "gender", "activity_level", "water_tracking_enabled", "sleep_tracking_enabled", "synced_at", "created_at", "updated_at") SELECT "user_id", "height_cm", "weight_kg", "age", "gender", "activity_level", "water_tracking_enabled", "sleep_tracking_enabled", "synced_at", "created_at", "updated_at" FROM `user_preferences`;--> statement-breakpoint
DROP TABLE `user_preferences`;--> statement-breakpoint
ALTER TABLE `__new_user_preferences` RENAME TO `user_preferences`;--> statement-breakpoint
ALTER TABLE `weight_logs` ADD `user_id` text NOT NULL;