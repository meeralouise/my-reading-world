import { db } from "@/lib/db";
import { stickers } from "@/lib/schema";
import { eq } from "drizzle-orm";

// 🟡 PUT /api/stickers/[id]
export async function PUT(req, { params }) {
  try {
    const id = Number(params.id);
    const { x_position, y_position, scale } = await req.json();

    await db
      .update(stickers)
      .set({
        ...(x_position !== undefined && { x_position }),
        ...(y_position !== undefined && { y_position }),
        ...(scale !== undefined && { scale }),
      })
      .where(eq(stickers.id, id));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Error updating sticker:", err);
    return new Response(
      JSON.stringify({ error: "Failed to update sticker" }),
      { status: 500 }
    );
  }
}

// optional: GET a single sticker (if needed)
export async function GET(_, { params }) {
  try {
    const id = Number(params.id);
    const [sticker] = await db
      .select()
      .from(stickers)
      .where(eq(stickers.id, id));

    if (!sticker)
      return new Response(JSON.stringify({ error: "Sticker not found" }), {
        status: 404,
      });

    return new Response(JSON.stringify(sticker), { status: 200 });
  } catch (err) {
    console.error("Error fetching sticker:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch sticker" }),
      { status: 500 }
    );
  }
}

// optional: DELETE a sticker
export async function DELETE(_, { params }) {
  try {
    const id = Number(params.id);
    await db.delete(stickers).where(eq(stickers.id, id));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Error deleting sticker:", err);
    return new Response(
      JSON.stringify({ error: "Failed to delete sticker" }),
      { status: 500 }
    );
  }
}
