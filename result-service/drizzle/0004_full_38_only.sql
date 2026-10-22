DROP TRIGGER results_full_catalog_only;
--> statement-breakpoint
CREATE TRIGGER results_full_catalog_only BEFORE INSERT ON results
WHEN json_array_length(NEW.matches) != 37
BEGIN
 SELECT RAISE(ABORT, 'Only 38-game tournament results are accepted');
END;
