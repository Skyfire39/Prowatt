import { eq } from "drizzle-orm";
import sharp from "sharp";
import { getDb, schema } from "@/lib/db";
import { isUuid } from "@/lib/validate";

const MAX_WIDTH = 2400;
const STATIC = /^\/images\/[\w./-]+\.(?:png|jpe?g|webp|avif)$/i;
const MEDIA = /^\/api\/media\/([0-9a-f-]{36})$/i;

const fail = (status: number) => new Response(status === 404 ? "Not found" : "Bad request", { status, headers: { "Cache-Control": "no-store" } });

/**
 * Redimensionne une image du site pour la taille d'écran demandée et la convertit en WebP, à la place de l'optimiseur
 * de Vercel (quota mensuel limité). Appelée par lib/image-loader.ts : /api/img?src=/images/…&w=640&q=75.
 * Seules les images du site (/images/…) et celles envoyées depuis l'admin (/api/media/<id>) sont acceptées, jamais une
 * adresse extérieure. Chaque version est gardée par le CDN : le calcul n'a lieu qu'une fois.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const src = url.searchParams.get("src") ?? "";
  const w = Math.round(Number(url.searchParams.get("w")));
  const q = Math.min(Math.max(Math.round(Number(url.searchParams.get("q")) || 75), 30), 95);
  if (!Number.isFinite(w) || w <= 0 || src.includes("..")) return fail(400);

  let input: Buffer | null = null;
  const media = src.match(MEDIA);
  if (media && isUuid(media[1])) {
    const db = await getDb();
    const [row] = await db.select({ data: schema.media.data }).from(schema.media).where(eq(schema.media.id, media[1])).limit(1);
    input = row ? Buffer.from(row.data) : null;
  } else if (STATIC.test(src)) {
    // Les fichiers de /public sont servis par le CDN, pas par cette fonction : on les lit par leur adresse sur le site.
    const res = await fetch(new URL(src, url.origin), { cache: "force-cache" });
    input = res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  } else {
    return fail(400);
  }
  if (!input) return fail(404);

  try {
    const data = await sharp(input, { failOn: "none" }).rotate().resize({ width: Math.min(w, MAX_WIDTH), withoutEnlargement: true }).webp({ quality: q }).toBuffer();
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=2592000, s-maxage=31536000, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return fail(400);
  }
}
