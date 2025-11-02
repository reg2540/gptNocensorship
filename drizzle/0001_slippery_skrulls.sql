CREATE TABLE `followSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`snapshotType` enum('following','followers') NOT NULL,
	`instagramUserId` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`profilePic` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `followSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unfollowRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`unfollowedInstagramUserId` varchar(255) NOT NULL,
	`unfollowedUsername` varchar(255) NOT NULL,
	`unfollowedProfilePic` text,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`isViewed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `unfollowRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `instagramUsername` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `instagramUserId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `instagramProfilePic` text;