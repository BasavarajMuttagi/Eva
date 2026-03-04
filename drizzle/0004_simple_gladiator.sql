ALTER TABLE `food_logs` ADD `total_calories` real;--> statement-breakpoint
ALTER TABLE `food_logs` ADD `total_protein` real;--> statement-breakpoint
ALTER TABLE `food_logs` ADD `total_carbs` real;--> statement-breakpoint
ALTER TABLE `food_logs` ADD `total_fat` real;--> statement-breakpoint
ALTER TABLE `user_preferences` DROP COLUMN `synced_at`;