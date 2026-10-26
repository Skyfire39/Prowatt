"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getDb, schema } from "@/lib/db";
import { parseEcooterPage, safeHref } from "@/lib/ecooter-page";
import type { FormState } from "@/lib/validate";

export async function saveEcooterPageAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("motos.write");
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
  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key: "ecooterPage", value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
  await logAudit(user, "modification", "fiche modèle Ecooter", "ecooterPage");
  updateTag("ecooter-page");
  return { ok: "La fiche des modèles est mise à jour sur le site." };
}

/** Revient au contenu d'origine du site. */
export async function resetEcooterPageAction() {
  const user = await requireActionUser("motos.write");
  const db = await getDb();
  await db.delete(schema.settings).where(eq(schema.settings.key, "ecooterPage"));
  await logAudit(user, "réinitialisation", "fiche modèle Ecooter", "ecooterPage");
  updateTag("ecooter-page");
  redirect("/admin/fiche-modele?ok=reset");
}
