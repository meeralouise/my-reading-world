import { db } from "../../../lib/db";
import { stickers } from "../../../lib/schema";

export default async function handler(req, res) {
  console.log("🔥 HIT /api/stickers");

  try {
    if (req.method === "POST") {
      console.log("📩 POST REQUEST RECEIVED");
      console.log("📩 RAW POST BODY RECEIVED BY SERVER:", req.body);

      const {
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

      console.log("🧪 Extracted body:", {
        title,
        author,
        reader_name,
        date_read,
      });

      const [newSticker] = await db
        .insert(stickers)
        .values({
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

      console.log("💾 Saved sticker:", newSticker);

      return res.status(200).json(newSticker);
    }

    if (req.method === "GET") {
      const all = await db.select().from(stickers);
      return res.status(200).json(all);
    }

    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("❌ sticker post error:", err);
    res.status(500).json({ error: err.message });
  }
}

// IMPORTANT — this MUST be at the bottom
export const config = {
  api: {
    bodyParser: true,
  },
};
