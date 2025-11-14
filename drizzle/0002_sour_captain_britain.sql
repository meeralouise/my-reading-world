ALTER TABLE "stickers" ALTER COLUMN "scale" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "stickers" ALTER COLUMN "scale" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "stickers" ALTER COLUMN "scale" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stickers" ALTER COLUMN "locked" DROP NOT NULL;