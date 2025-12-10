import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp
} from "drizzle-orm/pg-core";

// NEW: WORLDS TABLE
export const worlds = pgTable("worlds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  is_private: boolean("is_private").default(false),
  access_code: text("access_code"),
  created_at: timestamp("created_at").defaultNow(),
});

// UPDATED: STICKERS TABLE WITH world_id (ONLY addition)
export const stickers = pgTable("stickers", {
  id: serial("id").primaryKey(),

  // NEW — connect sticker → world
  world_id: integer("world_id").notNull().default(1),

  x_position: integer("x_position").notNull(),
  y_position: integer("y_position").notNull(),

  // KEEPING THIS AS TEXT (SAFE)
  scale: text("scale").notNull(),

  image_url: text("image_url").notNull(),
  locked: boolean("locked").default(false),

  created_at: timestamp("created_at").defaultNow(),

  // book data
  title: text("title"),
  author: text("author"),
  reader_name: text("reader_name"),
  date_read: text("date_read"),
});
