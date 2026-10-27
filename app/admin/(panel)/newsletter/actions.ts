"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { requireActionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { mailchimpConfig, testMailchimp, unsubscribeFromMailchimp } from "@/lib/mailchimp";
import { parseEmails, saveSubscriber, syncPending, syncSubscriber } from "@/lib/newsletter";
import { isUuid, s, type FormState } from "@/lib/validate";

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

/** Ajoute des adresses à la main ou par collage (une par ligne, ou séparées par des virgules). */
export async function importSubscribersAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("newsletter.manage");
  const { valid, invalid, truncated } = parseEmails(s(fd, "emails"));
  if (valid.length === 0 && invalid.length === 0) return { error: "Collez au moins une adresse e-mail." };
  if (valid.length === 0) return { error: `Aucune adresse valide (${invalid.slice(0, 3).join(", ")}…).` };

  const source = valid.length === 1 ? "admin" : "import";
  let added = 0;
  for (const email of valid) {
    const { created } = await saveSubscriber(email, source);
    if (created) added++;
  }
  await logAudit(user, "import", "newsletter", null, `${added} ajoutée(s) sur ${valid.length}`);
  revalidatePath("/admin/newsletter");

  const parts = [`${plural(added, "adresse ajoutée", "adresses ajoutées")}`];
  if (valid.length > added) parts.push(`${valid.length - added} déjà présente${valid.length - added > 1 ? "s" : ""}`);
  if (invalid.length) parts.push(`${plural(invalid.length, "invalide ignorée", "invalides ignorées")}`);
  if (truncated) parts.push("liste limitée à 2 000 adresses");
  return { ok: `${parts.join(" · ")}.` };
}

/** Vérifie la clé API et l'audience Mailchimp, sans rien modifier. */
export async function testConnectionAction(): Promise<FormState> {
  await requireActionUser("newsletter.manage");
  const res = await testMailchimp();
  if (!res.ok) return { error: res.error };
  return { ok: `Connecté : audience « ${res.name} », ${res.members} contact${res.members > 1 ? "s" : ""}.` };
}

/** Envoie à Mailchimp les abonnés jamais envoyés ou en échec (par paquets de 50). */
export async function syncAllAction(): Promise<FormState> {
  const user = await requireActionUser("newsletter.manage");
  if (!mailchimpConfig()) return { error: "Mailchimp n'est pas configuré (voir le bloc « Connexion Mailchimp »)." };
  const r = await syncPending(50);
  await logAudit(user, "synchronisation", "newsletter", null, `${r.done} envoyé(s), ${r.failed} échec(s)`);
  revalidatePath("/admin/newsletter");
  if (r.done === 0 && r.failed === 0) return { ok: "Tout est déjà synchronisé." };
  if (r.failed > 0 && r.done === 0) return { error: `Échec de l'envoi : ${r.firstError}` };
  const rest = r.remaining > 0 ? ` Il en reste ${r.remaining} : relancez la synchronisation.` : "";
  const fail = r.failed > 0 ? ` (${r.failed} en échec : ${r.firstError})` : "";
  return { ok: `${plural(r.done, "abonné envoyé", "abonnés envoyés")} à Mailchimp${fail}.${rest}` };
}

export async function syncOneAction(fd: FormData) {
  const user = await requireActionUser("newsletter.manage");
  const id = s(fd, "id");
  if (!isUuid(id)) redirect("/admin/newsletter?ok=notfound");
  const r = await syncSubscriber(id);
  await logAudit(user, "synchronisation", "newsletter", id, r.ok ? r.status : r.error);
  redirect(`/admin/newsletter?ok=${r.ok ? "nl-synced" : "nl-failed"}`);
}

/** Bascule abonné ↔ désabonné. Désabonner prévient aussi Mailchimp pour qu'il cesse d'écrire à cette personne. */
export async function toggleStatusAction(fd: FormData) {
  const user = await requireActionUser("newsletter.manage");
  const id = s(fd, "id");
  if (!isUuid(id)) redirect("/admin/newsletter?ok=notfound");
  const db = await getDb();
  const t = schema.subscribers;
  const [row] = await db.select().from(t).where(eq(t.id, id)).limit(1);
  if (!row) redirect("/admin/newsletter?ok=notfound");

  if (row.status === "subscribed") {
    await db.update(t).set({ status: "unsubscribed", updatedAt: new Date() }).where(eq(t.id, id));
    if (mailchimpConfig() && row.mailchimpSyncedAt) {
      const r = await unsubscribeFromMailchimp(row.email);
      await db
        .update(t)
        .set(r.ok ? { mailchimpStatus: r.status, mailchimpError: null } : { mailchimpError: r.error })
        .where(eq(t.id, id));
    }
    await logAudit(user, "désabonnement", "newsletter", id, row.email);
    redirect("/admin/newsletter?ok=nl-unsub");
  }
  await db.update(t).set({ status: "subscribed", updatedAt: new Date() }).where(eq(t.id, id));
  await syncSubscriber(id);
  await logAudit(user, "réabonnement", "newsletter", id, row.email);
  redirect("/admin/newsletter?ok=nl-resub");
}

/** Supprime l'adresse de la sauvegarde locale (droit à l'effacement). Le contact Mailchimp n'est pas touché. */
export async function deleteSubscriberAction(fd: FormData) {
  const user = await requireActionUser("newsletter.manage");
  const id = s(fd, "id");
  if (!isUuid(id)) redirect("/admin/newsletter?ok=notfound");
  const db = await getDb();
  const [row] = await db.delete(schema.subscribers).where(eq(schema.subscribers.id, id)).returning({ email: schema.subscribers.email });
  if (row) await logAudit(user, "suppression", "newsletter", id, row.email);
  redirect("/admin/newsletter?ok=deleted");
}
