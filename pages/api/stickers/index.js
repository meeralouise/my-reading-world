export const runtime = "nodejs";

import { db } from "../../../lib/db";
import { stickers } from "../../../lib/schema";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  console.log("HIT /api/stickers");

  try {
    // -------------------------------
    // POST — Save sticker
    // -------------------------------
    if (req.method === "POST") {
      console.log("POST REQUEST RECEIVED");
      console.log("RAW POST BODY RECEIVED BY SERVER:", req.body);

      const {
        world_id,          // NEW
        x_position,
        y_position,
        scale,
        image_url,
        locked,
        title,
        author,
        reader_name,
        date_read,
      } = req.body;

      console.log("Extracted body:", {
        world_id,
        title,
        author,
        reader_name,
        date_read,
      });

      const [newSticker] = await db
        .insert(stickers)
        .values({
          world_id: world_id || 1,   // DEFAULT TO SHARED WORLD
          x_position,
          y_position,
          scale,
          image_url,
          locked,
          title,
          author,
          reader_name,
          date_read,
        })
        .returning();

      console.log("Saved sticker:", newSticker);
      return res.status(200).json(newSticker);
    }

    // -------------------------------
    // GET — Load stickers for a world
    // -------------------------------
    if (req.method === "GET") {
      const worldId = Number(req.query.world_id) || 1; // DEFAULT TO SHARED WORLD

      console.log("Loading stickers for world:", worldId);

      const all = await db
        .select()
        .from(stickers)
        .where(eq(stickers.world_id, worldId));

      return res.status(200).json(all);
    }

    // -------------------------------
    // Method Not Allowed
    // -------------------------------
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (err) {
    console.error("sticker API error:", err);
    res.status(500).json({ error: err.message });
  }
}

// IMPORTANT — this MUST be at the bottom
export const config = {
  api: {
    bodyParser: true,
  },
};
