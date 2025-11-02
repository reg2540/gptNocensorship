CREATE TABLE `chat_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`provider` enum('naver','google') NOT NULL,
	`displayName` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastLoginAt` timestamp,
	CONSTRAINT `chat_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `chat_accounts_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
DROP TABLE `followSnapshots`;--> statement-breakpoint
DROP TABLE `unfollowRecords`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `instagramUsername`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `instagramUserId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `instagramProfilePic`;