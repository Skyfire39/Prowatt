import sharp from "sharp";
import { getDb, schema } from "./db";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);
export const MAX_UPLOAD = 2 * 1024 * 1024; // 2 Mo

/** Côté le plus long d'une image enregistrée : assez pour un affichage plein écran, bien moins qu'une photo d'appareil. */
const MAX_SIDE = 2000;

/**
 * Allège une image avant de l'enregistrer : orientation EXIF appliquée, réduite à 2 000 px au plus, convertie en WebP
 * (la transparence est conservée). Une photo de 2 Mo tombe à quelques dizaines de Ko. Si le résultat n'est pas plus
 * léger (petite icône déjà optimisée) ou si le fichier est illisible, l'original est gardé tel quel.
 */
export async function compressImage(buf: Buffer): Promise<{ data: Buffer; mime: string; webp: boolean } | null> {
  try {
    const data = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    return data.length < buf.length ? { data, mime: "image/webp", webp: true } : null;
  } catch {
    return null;
  }
}

export type UploadResult = { url: string } | { error: string } | null;

/**
 * Enregistre une image envoyée depuis un formulaire et renvoie son adresse publique (/api/media/<id>).
 * `null` : aucun fichier choisi. Le SVG est refusé (il peut contenir des scripts).
 */
export async function saveUpload(file: FormDataEntryValue | null): Promise<UploadResult> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!ALLOWED.has(file.type)) return { error: "Format d'image non pris en charge (PNG, JPEG ou WebP)." };
  if (file.size > MAX_UPLOAD) return { error: "Image trop lourde (2 Mo maximum)." };
  const buf = Buffer.from(await file.arrayBuffer());
  // On vérifie la signature du fichier plutôt que de croire le type annoncé par le navigateur.
  const isPng = buf.subarray(0, 4).toString("hex") === "89504e47";
  const isJpg = buf.subarray(0, 3).toString("hex") === "ffd8ff";
  const isWebp = buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";
  if (!isPng && !isJpg && !isWebp) return { error: "Le fichier n'est pas une image valide." };

  const packed = await compressImage(buf);
  const data = packed?.data ?? buf;
  const mime = packed?.mime ?? file.type;
  const filename = packed?.webp ? file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp" : file.name;

  const db = await getDb();
  const [row] = await db
    .insert(schema.media)
    .values({ filename: filename.slice(0, 120), mime, size: data.length, data })
    .returning({ id: schema.media.id });
  return { url: `/api/media/${row.id}` };
}
