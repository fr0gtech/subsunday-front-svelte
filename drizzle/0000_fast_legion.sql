CREATE TABLE "Game" (
	"name" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"picture" text DEFAULT '' NOT NULL,
	"link" text DEFAULT '' NOT NULL,
	"createdAt" timestamp (6) with time zone NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"categories" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"dev" text[] DEFAULT '{"RAY[''::tex"}',
	"price" jsonb DEFAULT '{"final":"n/a"}'::jsonb NOT NULL,
	"steamId" integer DEFAULT 0 NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"detailedDescription" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"movies" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recommendations" integer DEFAULT 0 NOT NULL,
	"screenshots" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sub" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (6) with time zone NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Vote" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromId" integer NOT NULL,
	"forId" integer NOT NULL,
	"voteText" text NOT NULL,
	"createdAt" timestamp (6) with time zone NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_forId_fkey" FOREIGN KEY ("forId") REFERENCES "public"."Game"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "name_search_index" ON "Game" USING gin (to_tsvector('english', [object Object]));