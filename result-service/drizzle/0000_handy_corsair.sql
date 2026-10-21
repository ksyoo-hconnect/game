CREATE TABLE `results` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`champion` text NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`submitted_at` text NOT NULL,
	`matches` text NOT NULL,
	`payload_hash` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`requester_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`claimed_by` text
);
--> statement-breakpoint
CREATE INDEX `tickets_requester_created` ON `tickets` (`requester_hash`,`created_at`);