ALTER TABLE "SubSundayMoment" RENAME COLUMN "startTime" TO "durationMilliseconds";--> statement-breakpoint
ALTER TABLE "SubSundayMoment" RENAME COLUMN "endTime" TO "positionMilliseconds";--> statement-breakpoint
ALTER TABLE "SubSundayMoment" ALTER COLUMN "streamId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "SubSundayMoment" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "SubSundayStream" ADD COLUMN "publishedAt" timestamp (6) with time zone NOT NULL;