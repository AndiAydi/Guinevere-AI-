CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`theme` enum('light','dark','auto') NOT NULL DEFAULT 'light',
	`language` enum('id','en','ja') NOT NULL DEFAULT 'id',
	`personalityIntensity` enum('subtle','normal','intense') NOT NULL DEFAULT 'normal',
	`autoSaveConversations` int NOT NULL DEFAULT 1,
	`notificationsEnabled` int NOT NULL DEFAULT 1,
	`responseStreamingEnabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `userPreferences` ADD CONSTRAINT `userPreferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;