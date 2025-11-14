import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const stickers = pgTable("stickers", {
  id: serial("id").primaryKey(),
  x_position: integer("x_position").notNull(),
  y_position: integer("y_position").notNull(),
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
