ALTER TABLE "Game" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "Game" ALTER COLUMN "createdAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Game" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "createdAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "Vote" ALTER COLUMN "createdAt" SET DATA TYPE timestamp (6) with time zone;--> statement-breakpoint
ALTER TABLE "Vote" ALTER COLUMN "createdAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Vote" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp (6) with time zone;