DROP INDEX "name_search_index";--> statement-breakpoint
CREATE INDEX "name_search_index" ON "Game" USING gin (to_tsvector('english', Game.name));