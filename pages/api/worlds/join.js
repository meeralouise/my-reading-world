import { db } from "../../../lib/db";
import { worlds } from "../../../lib/schema";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      // Accept multiple possible field names from the frontend
      const { access_code, code, accessCode } = req.body || {};

      let rawCode = access_code || code || accessCode;

      if (!rawCode) {
        return res.status(400).json({ error: "Access code is required" });
      }

      const normalizedCode = String(rawCode).trim().toUpperCase();
      console.log("🔍 /api/worlds/join – incoming code:", normalizedCode);

      const found = await db
        .select()
        .from(worlds)
        .where(eq(worlds.access_code, normalizedCode))
        .limit(1);

      console.log("🔍 /api/worlds/join – query result:", found);

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
