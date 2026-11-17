import { asc, eq } from "drizzle-orm";
import { orderPayLabel } from "./admin/status";
import { logAudit } from "./audit";
import { getSettings } from "./content";
import { getDb, schema } from "./db";
import { sendMail, type SendResult } from "./mail";
import { renderOrderMail, type OrderForMail } from "./mail-templates";
import { isEmail } from "./validate";

/** Charge une commande et ses articles, au format attendu par le modèle d'e-mail. */
export async function loadOrderForMail(id: string): Promise<OrderForMail | null> {
  const db = await getDb();
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!o) return null;
  const items = await db
    .select({ name: schema.orderItems.name, unitPrice: schema.orderItems.unitPrice, qty: schema.orderItems.qty })
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id))
    .orderBy(asc(schema.orderItems.name));
  return { ...o, paymentLabel: orderPayLabel(o.paymentMethod), items };
}

/**
 * Envoie la nouvelle commande aux commerciaux (les mêmes adresses que pour les demandes de devis), selon les réglages
 * de l'administration. « Répondre » écrit directement au client s'il a donné son e-mail. Le résultat est inscrit dans
 * le journal d'activité ; la fonction ne lève jamais d'erreur : une panne d'e-mail ne doit pas perdre la commande.
 */
export async function sendOrderMail(id: string): Promise<SendResult | { ok: false; error: string; skipped: true }> {
  try {
    const o = await loadOrderForMail(id);
    if (!o) return { ok: false, error: "Commande introuvable.", skipped: true };
    const s = await getSettings();
    const m = s.mail;
    const to = m.salesEmails.filter(isEmail);
    const skip = async (error: string) => {
      console.info(`[commandes] ${o.ref} : e-mail aux commerciaux non envoyé (${error})`);
      await logAudit(null, "e-mail aux commerciaux non envoyé", "commande", id, `${o.ref} · ${error}`);
      return { ok: false as const, error, skipped: true as const };
    };
    if (!m.notifyOrders) return skip("L'alerte des commandes est désactivée dans Paramètres → E-mails.");
    if (to.length === 0) return skip("Aucune adresse de commercial dans Paramètres → E-mails.");

    const mail = renderOrderMail({ subject: m.orderSubject, body: m.orderBody }, o, s);
    const res = await sendMail({ to, ...mail, replyTo: o.customerEmail && isEmail(o.customerEmail) ? o.customerEmail : undefined });
    console.info(`[commandes] ${o.ref} : e-mail aux commerciaux ${res.ok ? `envoyé à ${to.length} adresse(s)` : `en échec (${res.error})`}`);
    await logAudit(null, res.ok ? "e-mail aux commerciaux envoyé" : "échec de l'e-mail aux commerciaux", "commande", id, res.ok ? `${o.ref} → ${to.join(", ")}` : `${o.ref} · ${res.error}`);
    return res;
  } catch (e) {
    const error = e instanceof Error ? e.message : "erreur inconnue";
    console.error("[commandes] échec d'envoi de l'e-mail", error);
    return { ok: false, error };
  }
}
