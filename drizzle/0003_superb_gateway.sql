ALTER TABLE "User" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "Vote" ADD COLUMN "voteText" text NOT NULL;--> statement-breakpoint
CREATE INDEX "name_search_index" ON "Game" USING gin (plainto_tsquery('english', "name"));