ALTER TABLE `conversations` MODIFY COLUMN `mode` enum('normal','deep','close','casual') NOT NULL DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE `userRelationships` MODIFY COLUMN `currentMode` enum('normal','deep','close','casual') NOT NULL DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE `userPreferences` ADD `deepLearningEnabled` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `userPreferences` ADD `eleganceDisabled` int DEFAULT 0 NOT NULL;