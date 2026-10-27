import { saveUpload } from "@/lib/media";
import { parseOptions, type ProductOption } from "@/lib/options";

/**
 * Options envoyées par l'éditeur (JSON) : enregistre les photos choisies pour certains choix et les rattache.
 * Chaque choix porte un `uid` temporaire, le fichier correspondant est dans le champ « optimg-<uid> ».
 */
export async function readOptions(fd: FormData): Promise<{ options: ProductOption[] } | { error: string }> {
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("options") ?? "[]"));
  } catch {
    return { error: "Les options sont illisibles. Rechargez la page." };
  }
  if (Array.isArray(raw)) {
    for (const o of raw) {
      for (const v of Array.isArray(o?.values) ? o.values : []) {
        const uid = typeof v?.uid === "string" ? v.uid.replace(/[^\w-]/g, "") : "";
        if (!uid) continue;
        const up = await saveUpload(fd.get(`optimg-${uid}`));
        if (up && "error" in up) return { error: `Option « ${o.name ?? ""} » : ${up.error}` };
        if (up && "url" in up) v.image = up.url;
      }
    }
  }
  return { options: parseOptions(raw) };
}
