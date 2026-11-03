import { eq } from "drizzle-orm";
import { getSettings } from "./content";
import { getDb, schema } from "./db";
import { sendMail } from "./mail";
import { renderMail, type RequestForMail } from "./mail-templates";
import { isEmail } from "./validate";

export type MailTarget = "sales" | "customer" | "both";

/**
 * Envoie les e-mails d'une demande de devis : l'alerte aux commerciaux et la confirmation au demandeur, selon les réglages
 * de l'administration. Le résultat de chaque envoi est gardé sur la demande (visible dans l'administration, avec le motif
 * d'un éventuel échec) ; cette fonction ne lève jamais d'erreur : une panne d'e-mail ne doit pas perdre la demande.
 */
export async function sendRequestMails(id: string, target: MailTarget = "both") {
  try {
    const db = await getDb();
    const [row] = await db.select().from(schema.quoteRequests).where(eq(schema.quoteRequests.id, id)).limit(1);
    if (!row) return;
    const s = await getSettings();
    const r: RequestForMail = row;
    const m = s.mail;
    const errors: string[] = [];
    const result: { mailSales?: string; mailCustomer?: string } = {};

    if (target !== "customer") {
      const to = m.salesEmails.filter(isEmail);
      if (!m.notifySales || to.length === 0) result.mailSales = "skipped";
      else {
        const mail = renderMail({ subject: m.salesSubject, body: m.salesBody }, r, s);
        const res = await sendMail({ to, ...mail, replyTo: r.email && isEmail(r.email) ? r.email : undefined });
        result.mailSales = res.ok ? "sent" : "failed";
        if (!res.ok) errors.push(`Commerciaux : ${res.error}`);
      }
    }
    if (target !== "sales") {
      if (!m.confirmCustomer || !r.email || !isEmail(r.email)) result.mailCustomer = "skipped";
      else {
        const mail = renderMail({ subject: m.customerSubject, body: m.customerBody }, r, s);
        const res = await sendMail({ to: [r.email], ...mail, replyTo: isEmail(m.replyTo) ? m.replyTo : s.company.email });
        result.mailCustomer = res.ok ? "sent" : "failed";
        if (!res.ok) errors.push(`Client : ${res.error}`);
      }
    }

    await db
      .update(schema.quoteRequests)
      .set({ ...result, mailError: errors.join(" · ") || null, mailedAt: new Date() })
      .where(eq(schema.quoteRequests.id, id));
  } catch (e) {
    console.error("[devis] échec d'envoi des e-mails", e instanceof Error ? e.message : e);
  }
}
