import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isUuid } from "@/lib/validate";

/** Sert une image envoyée depuis l'administration. L'identifiant change à chaque envoi : cache longue durée. */
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  const db = await getDb();
  const [row] = await db.select().from(schema.media).where(eq(schema.media.id, id)).limit(1);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(row.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
