export const runtime = "nodejs";

import { db } from "../../../lib/db";
import { worlds } from "../../../lib/schema";
import { eq } from "drizzle-orm";

// GET /api/worlds/:id → return world info
export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "World ID missing" });
    }

    // Fetch world from DB
    const [world] = await db
      .select()
      .from(worlds)
      .where(eq(worlds.id, Number(id)));

    if (!world) {
      return res.status(404).json({ error: "World not found" });
    }

    return res.status(200).json(world);
  } catch (err) {
    console.error("❌ Error fetching world:", err);
    return res.status(500).json({ error: "Failed to fetch world" });
  }
}
