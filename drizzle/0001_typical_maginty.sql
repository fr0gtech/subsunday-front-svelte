ALTER TABLE "Vote" DROP CONSTRAINT "Vote_gameName_fkey";
--> statement-breakpoint
ALTER TABLE "Vote" ADD COLUMN "forId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_forId_fkey" FOREIGN KEY ("forId") REFERENCES "public"."Game"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Vote" DROP COLUMN "gameName";