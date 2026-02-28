CREATE TABLE `food_log_items` (
	`id` text PRIMARY KEY NOT NULL,
	`log_id` text NOT NULL,
	`food_name` text NOT NULL,
	`quantity_description` text NOT NULL,
	`quantity_total` real NOT NULL,
	`unit` text NOT NULL,
	`calories_per_100` real NOT NULL,
	`carbs_per_100` real NOT NULL,
	`protein_per_100` real NOT NULL,
	`fat_per_100` real NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`log_id`) REFERENCES `food_logs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `food_items_log_idx` ON `food_log_items` (`log_id`);--> statement-breakpoint
CREATE TABLE `food_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`raw_text` text NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`version` integer DEFAULT 1 NOT NULL,
	`synced_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `food_logs_created_idx` ON `food_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`height_cm` integer NOT NULL,
	`weight_kg` real NOT NULL,
	`age` integer NOT NULL,
	`sex` text NOT NULL,
	`activity_level` text NOT NULL,
	`water_tracking_enabled` integer DEFAULT false NOT NULL,
	`sleep_tracking_enabled` integer DEFAULT false NOT NULL,
	`synced_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weight_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`weight_kg` real NOT NULL,
	`synced_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `weight_logs_created_idx` ON `weight_logs` (`created_at`);