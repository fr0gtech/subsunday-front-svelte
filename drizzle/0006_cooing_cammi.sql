CREATE TABLE "SubSundayMoment" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamId" integer NOT NULL,
	"startTime" integer NOT NULL,
	"endTime" integer NOT NULL,
	"gameId" integer NOT NULL,
	"createdAt" timestamp (6) with time zone NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SubSundayStream" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamId" text NOT NULL,
	"title" text NOT NULL,
	"createdAt" timestamp (6) with time zone NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL
);
