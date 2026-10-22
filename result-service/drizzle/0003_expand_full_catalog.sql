-- Retain in-progress 37-game brackets and accept the expanded 38-game catalog.
DROP TRIGGER results_full_catalog_only;
--> statement-breakpoint
CREATE TRIGGER results_full_catalog_only BEFORE INSERT ON results
WHEN json_array_length(NEW.matches) NOT IN (36,37)
BEGIN
 SELECT RAISE(ABORT, 'Only full-catalog tournament results are accepted');
END;
