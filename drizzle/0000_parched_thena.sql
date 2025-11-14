CREATE TABLE "stickers" (
	"id" serial PRIMARY KEY NOT NULL,
	"x_position" integer NOT NULL,
	"y_position" integer NOT NULL,
	"scale" real DEFAULT 1 NOT NULL,
	"image_url" text NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
