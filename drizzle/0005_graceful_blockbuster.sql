PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_food_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`raw_text` text NOT NULL,
	`explanation` text,
	`state` text DEFAULT 'pending' NOT NULL,
	`total_calories` real DEFAULT 0 NOT NULL,
	`total_protein` real DEFAULT 0 NOT NULL,
	`total_carbs` real DEFAULT 0 NOT NULL,
	`total_fat` real DEFAULT 0 NOT NULL,
	`error_message` text,
	`version` integer DEFAULT 1 NOT NULL,
	`synced_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_food_logs`("id", "user_id", "raw_text", "explanation", "state", "total_calories", "total_protein", "total_carbs", "total_fat", "error_message", "version", "synced_at", "created_at", "updated_at") SELECT "id", "user_id", "raw_text", "explanation", "state", "total_calories", "total_protein", "total_carbs", "total_fat", "error_message", "version", "synced_at", "created_at", "updated_at" FROM `food_logs`;--> statement-breakpoint
DROP TABLE `food_logs`;--> statement-breakpoint
ALTER TABLE `__new_food_logs` RENAME TO `food_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `food_logs_created_idx` ON `food_logs` (`created_at`);--> statement-breakpoint
ALTER TABLE `food_log_items` ADD `calories` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `food_log_items` ADD `protein` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `food_log_items` ADD `carbs` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `food_log_items` ADD `fat` real DEFAULT 0 NOT NULL;