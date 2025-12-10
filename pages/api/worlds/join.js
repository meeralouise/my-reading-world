import { db } from "../../../lib/db";
import { worlds } from "../../../lib/schema";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { access_code } = req.body;

      if (!access_code) {
        return res.status(400).json({ error: "Access code is required" });
      }

      const found = await db
        .select()
        .from(worlds)
        .where(eq(worlds.access_code, access_code))
        .limit(1);

      if (!found.length) {
        return res.status(404).json({ error: "World not found" });
      }

      return res.status(200).json(found[0]);
    }

    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (err) {
    console.error("❌ /api/worlds/join error:", err);
    return res.status(500).json({ error: err.message });
  }
}
