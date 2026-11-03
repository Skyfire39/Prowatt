/**
 * Envoi d'e-mails via Resend (https://resend.com), par leur API HTTP : aucune dépendance à installer.
 * Variables d'environnement :
 *   RESEND_API_KEY  clé API Resend (re_…)
 *   MAIL_FROM       expéditeur, sur un domaine vérifié chez Resend, ex. « Prowatt Madagascar <devis@prowattmadagascar.com> »
 * Sans elles, rien n'est envoyé : les demandes restent sauvegardées dans l'administration.
 */
export const mailConfig = () => {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim();
  return key && from ? { key, from } : null;
};

export type SendResult = { ok: true; id: string } | { ok: false; error: string; notConfigured?: boolean };

export async function sendMail(m: { to: string[]; subject: string; text: string; html: string; replyTo?: string }): Promise<SendResult> {
  const cfg = mailConfig();
  if (!cfg) return { ok: false, error: "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY et MAIL_FROM).", notConfigured: true };
  if (m.to.length === 0) return { ok: false, error: "Aucun destinataire." };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: cfg.from, to: m.to, subject: m.subject, text: m.text, html: m.html, ...(m.replyTo ? { reply_to: m.replyTo } : {}) }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => null)) as { id?: string; message?: string; name?: string } | null;
    if (!res.ok) return { ok: false, error: `Resend : ${body?.message ?? body?.name ?? res.status}` };
    return { ok: true, id: body?.id ?? "" };
  } catch (e) {
    return { ok: false, error: `Resend injoignable : ${e instanceof Error ? e.message : "erreur réseau"}` };
  }
}
