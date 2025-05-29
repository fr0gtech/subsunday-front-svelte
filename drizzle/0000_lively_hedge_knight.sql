-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "User" (
	"id" integer NOT NULL,
	"name" text NOT NULL,
	"sub" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Vote" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromId" integer NOT NULL,
	"gameName" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Game" (
	"name" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"picture" text DEFAULT '' NOT NULL,
	"link" text DEFAULT '' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
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
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_gameName_fkey" FOREIGN KEY ("gameName") REFERENCES "public"."Game"("name") ON DELETE restrict ON UPDATE cascade;
*/