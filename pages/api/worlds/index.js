export const runtime = "nodejs";

import { db } from "../../../lib/db";
import { worlds } from "../../../lib/schema";
import { desc } from "drizzle-orm";

// simple access code generator (A-Z + 0-9)
function generateAccessCode(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default async function handler(req, res) {
  try {
    // GET /api/worlds  → list all worlds
    if (req.method === "GET") {
      const allWorlds = await db
        .select()
        .from(worlds)
        .orderBy(desc(worlds.created_at));

      return res.status(200).json(allWorlds);
    }

    // POST /api/worlds → create a new world
    if (req.method === "POST") {
      const { name, is_private } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: "World name is required" });
      }

      const access_code = is_private ? generateAccessCode(10) : null;

      const [newWorld] = await db
        .insert(worlds)
        .values({
          name,
          is_private: !!is_private,
          access_code,
        })
        .returning();

      return res.status(200).json(newWorld);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("❌ /api/worlds error:", err);
    return res
      .status(500)
      .json({ error: "Failed to handle worlds", details: err.message });
  }
}
