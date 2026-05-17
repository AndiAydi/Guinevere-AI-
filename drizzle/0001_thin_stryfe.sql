CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`mode` enum('normal','deep','close') NOT NULL DEFAULT 'normal',
	`emotionalState` varchar(50) DEFAULT 'neutral',
	`containsButterflyMention` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userRelationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`relationshipLevel` int NOT NULL DEFAULT 0,
	`currentMode` enum('normal','deep','close') NOT NULL DEFAULT 'normal',
	`totalInteractions` int NOT NULL DEFAULT 0,
	`lastInteractionAt` timestamp,
	`hasBeenHurt` int DEFAULT 0,
	`happinessLevel` int NOT NULL DEFAULT 50,
	`lastButterflyMentionAt` timestamp,
	`personalityNotes` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userRelationships_id` PRIMARY KEY(`id`),
	CONSTRAINT `userRelationships_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userRelationships` ADD CONSTRAINT `userRelationships_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;