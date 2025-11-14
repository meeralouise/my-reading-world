import { db } from "../../../lib/db";
import { stickers } from "../../../lib/schema";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      const { x_position, y_position, scale, locked } = req.body;

      const [updated] = await db
        .update(stickers)
        .set({
          ...(x_position !== undefined && { x_position }),
          ...(y_position !== undefined && { y_position }),
          ...(scale !== undefined && { scale }),
          ...(locked !== undefined && { locked }),
        })
        .where(eq(stickers.id, Number(id)))
        .returning();

      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Error updating sticker:", err);
    return res.status(500).json({ error: err.message });
  }
}
