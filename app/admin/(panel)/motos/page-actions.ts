"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { LIMITS, SHARED_ID, pageKey, parseEcooterPage, safeHref } from "@/lib/ecooter-page";
import { saveUpload } from "@/lib/media";
import { s, type FormState } from "@/lib/validate";

/** « commun » ou l'identifiant d'une moto qui existe : on n'écrit jamais un réglage pour un modèle inconnu. */
async function checkScope(scope: string) {
  if (scope === SHARED_ID) return { ok: true as const, label: "contenu commun" };
  const db = await getDb();
  const [m] = await db.select({ name: schema.ecooters.name }).from(schema.ecooters).where(eq(schema.ecooters.id, scope)).limit(1);
  return m ? { ok: true as const, label: m.name } : { ok: false as const, label: "" };
}

export async function saveEcooterPageAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("motos.write");
  const scope = s(fd, "scope");
  const target = await checkScope(scope);
  if (!target.ok) return { error: "Modèle introuvable. Rechargez la page." };

  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("data") ?? ""));
  } catch {
    return { error: "Les données du formulaire sont illisibles. Rechargez la page." };
  }
  const input = (raw ?? {}) as { blocks?: { title?: { fr?: string }; buttons?: { label?: { fr?: string }; href?: string }[] }[] };
  for (const [i, b] of (input.blocks ?? []).entries()) {
    if (!String(b.title?.fr ?? "").trim()) return { error: `Le bloc ${i + 1} n'a pas de titre en français.` };
    for (const t of b.buttons ?? []) {
      if (String(t.label?.fr ?? "").trim() && !safeHref(String(t.href ?? "").trim())) {
        return { error: `Bloc ${i + 1} : l'adresse du bouton « ${t.label?.fr} » est invalide (utilisez /chemin, https://… ou mailto:).` };
      }
    }
  }
  const value = parseEcooterPage(raw);

  // Photos de détail choisies dans le formulaire : un fichier par bloc (champ « image-<id du bloc> »).
  for (const [i, block] of value.blocks.entries()) {
    const up = await saveUpload(fd.get(`image-${block.id}`));
    if (up && "error" in up) return { error: `Bloc ${i + 1} : ${up.error}` };
    if (up && "url" in up) block.image = up.url;
  }

  // Nouvelles photos de détail (galerie de la moto) : plusieurs fichiers dans le champ « gallery ».
  const gallery = value.gallery ?? [];
  const files = fd.getAll("gallery").filter((f): f is File => f instanceof File && f.size > 0);
  if (gallery.length + files.length > LIMITS.gallery) return { error: `La galerie accepte ${LIMITS.gallery} photos au maximum.` };
  for (const file of files) {
    const up = await saveUpload(file);
    if (up && "error" in up) return { error: `Galerie : ${up.error}` };
    if (up && "url" in up) gallery.push(up.url);
  }
  value.gallery = scope === SHARED_ID ? [] : gallery;

  const db = await getDb();
  const key = pageKey(scope);
  await db
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
  await logAudit(user, "modification", "fiche modèle Ecooter", key, target.label);
  updateTag("ecooter-page");
  // Retour sur la page : elle se recharge avec ce qui vient d'être enregistré et affiche le bandeau de confirmation.
  redirect(scope === SHARED_ID ? "/admin/motos/commun?ok=saved" : `/admin/motos/${scope}?onglet=page&ok=saved`);
}

/** Moto : revient au contenu commun. Contenu commun : revient au contenu d'origine du site. */
export async function resetEcooterPageAction(fd: FormData) {
  const user = await requireActionUser("motos.write");
  const scope = s(fd, "scope");
  const target = await checkScope(scope);
  if (!target.ok) redirect("/admin/motos?ok=notfound");
  const db = await getDb();
  const key = pageKey(scope);
  await db.delete(schema.settings).where(eq(schema.settings.key, key));
  await logAudit(user, "réinitialisation", "fiche modèle Ecooter", key, target.label);
  updateTag("ecooter-page");
  redirect(scope === SHARED_ID ? "/admin/motos/commun?ok=reset" : `/admin/motos/${scope}?onglet=page&ok=reset`);
}
