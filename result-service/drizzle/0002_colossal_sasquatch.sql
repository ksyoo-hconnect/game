CREATE TABLE `archived_results` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`champion` text NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`submitted_at` text NOT NULL,
	`matches` text NOT NULL,
	`payload_hash` text NOT NULL,
	`archived_at` text NOT NULL
);

--> statement-breakpoint
CREATE TRIGGER results_full_catalog_only BEFORE INSERT ON results
WHEN json_array_length(NEW.matches) != 36
BEGIN
 SELECT RAISE(ABORT, 'Only 37-game tournament results are accepted');
END;
