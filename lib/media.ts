import { getDb, schema } from "./db";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);
export const MAX_UPLOAD = 2 * 1024 * 1024; // 2 Mo

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

  const db = await getDb();
  const [row] = await db
    .insert(schema.media)
    .values({ filename: file.name.slice(0, 120), mime: file.type, size: file.size, data: buf })
    .returning({ id: schema.media.id });
  return { url: `/api/media/${row.id}` };
}
