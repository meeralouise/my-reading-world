ALTER TABLE "stickers" ALTER COLUMN "scale" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "stickers" ALTER COLUMN "scale" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "stickers" ALTER COLUMN "scale" SET NOT NULL;