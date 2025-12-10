CREATE TABLE "worlds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_private" boolean DEFAULT false,
	"access_code" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "stickers" ADD COLUMN "world_id" integer DEFAULT 1 NOT NULL;