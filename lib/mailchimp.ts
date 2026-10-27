import { createHash } from "node:crypto";

/**
 * Liaison Mailchimp (API Marketing v3). Rien n'est lu dans la base : tout vient de l'environnement.
 *
 *   MAILCHIMP_API_KEY       clé API (Account > Extras > API keys), de la forme « xxxxxxxx-us21 »
 *   MAILCHIMP_AUDIENCE_ID   identifiant de l'audience (Audience > Settings > Audience name and defaults)
 *   MAILCHIMP_DOUBLE_OPT_IN « true » : Mailchimp envoie un e-mail de confirmation avant d'inscrire (recommandé en Europe)
 *   MAILCHIMP_API_URL       surcharge facultative de l'adresse de l'API (tests)
 */

export type MailchimpConfig = { apiKey: string; audienceId: string; baseUrl: string; doubleOptIn: boolean };

export function mailchimpConfig(): MailchimpConfig | null {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID?.trim();
  if (!apiKey || !audienceId) return null;
  const dc = apiKey.split("-")[1];
  const baseUrl = process.env.MAILCHIMP_API_URL?.trim().replace(/\/$/, "") || (dc ? `https://${dc}.api.mailchimp.com/3.0` : "");
  if (!baseUrl) return null;
  return { apiKey, audienceId, baseUrl, doubleOptIn: /^(1|true|yes)$/i.test(process.env.MAILCHIMP_DOUBLE_OPT_IN ?? "") };
}

export type MailchimpResult =
  | { ok: true; status: string }
  | { ok: false; error: string; notConfigured?: boolean };

const TIMEOUT_MS = 8000;

async function call(cfg: MailchimpConfig, method: "GET" | "PUT" | "PATCH", path: string, body?: object) {
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`prowatt:${cfg.apiKey}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { res, data };
}

/** Message lisible pour une réponse d'erreur Mailchimp (jamais la clé, jamais le corps brut). */
function describe(res: Response, data: Record<string, unknown>) {
  const title = typeof data.title === "string" ? data.title : "";
  const detail = typeof data.detail === "string" ? data.detail : "";
  if (res.status === 401 || res.status === 403) return "Clé API Mailchimp refusée.";
  if (res.status === 404) return "Audience Mailchimp introuvable (vérifiez MAILCHIMP_AUDIENCE_ID).";
  return [title, detail].filter(Boolean).join(" — ").slice(0, 240) || `Erreur Mailchimp (${res.status}).`;
}

const failure = (e: unknown): MailchimpResult => ({
  ok: false,
  error: e instanceof Error && e.name === "TimeoutError" ? "Mailchimp ne répond pas (délai dépassé)." : "Mailchimp injoignable.",
});

/**
 * Ajoute (ou met à jour) un contact dans l'audience. Un contact déjà désabonné chez Mailchimp le reste :
 * on n'inscrit jamais quelqu'un de force. Renvoie le statut que Mailchimp attribue au contact.
 */
export async function subscribeToMailchimp(email: string): Promise<MailchimpResult> {
  const cfg = mailchimpConfig();
  if (!cfg) return { ok: false, error: "Mailchimp n'est pas configuré.", notConfigured: true };
  const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
  try {
    const { res, data } = await call(cfg, "PUT", `/lists/${encodeURIComponent(cfg.audienceId)}/members/${hash}`, {
      email_address: email,
      status_if_new: cfg.doubleOptIn ? "pending" : "subscribed",
      tags: ["Site web"],
    });
    if (!res.ok) return { ok: false, error: describe(res, data) };
    let status = typeof data.status === "string" ? data.status : "subscribed";
    // Sans confirmation par e-mail, un contact resté « en attente » (inscrit plus tôt avec la confirmation active)
    // est validé : la personne a donné son accord en remplissant le formulaire du site.
    if (!cfg.doubleOptIn && status === "pending") {
      const up = await call(cfg, "PATCH", `/lists/${encodeURIComponent(cfg.audienceId)}/members/${hash}`, { status: "subscribed" });
      if (up.res.ok) status = typeof up.data.status === "string" ? up.data.status : "subscribed";
    }
    return { ok: true, status };
  } catch (e) {
    return failure(e);
  }
}

/** Marque le contact comme désabonné chez Mailchimp. Un contact absent de l'audience n'est pas une erreur. */
export async function unsubscribeFromMailchimp(email: string): Promise<MailchimpResult> {
  const cfg = mailchimpConfig();
  if (!cfg) return { ok: false, error: "Mailchimp n'est pas configuré.", notConfigured: true };
  const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
  try {
    const { res, data } = await call(cfg, "PATCH", `/lists/${encodeURIComponent(cfg.audienceId)}/members/${hash}`, { status: "unsubscribed" });
    if (res.status === 404) return { ok: true, status: "unsubscribed" };
    if (!res.ok) return { ok: false, error: describe(res, data) };
    return { ok: true, status: typeof data.status === "string" ? data.status : "unsubscribed" };
  } catch (e) {
    return failure(e);
  }
}

export type MailchimpInfo = { name: string; members: number };

/** Vérifie la clé et l'audience : renvoie le nom de l'audience et son nombre d'abonnés. */
export async function testMailchimp(): Promise<({ ok: true } & MailchimpInfo) | { ok: false; error: string; notConfigured?: boolean }> {
  const cfg = mailchimpConfig();
  if (!cfg) return { ok: false, error: "Mailchimp n'est pas configuré.", notConfigured: true };
  try {
    const { res, data } = await call(cfg, "GET", `/lists/${encodeURIComponent(cfg.audienceId)}?fields=name,stats.member_count`);
    if (!res.ok) return { ok: false, error: describe(res, data) };
    const stats = (data.stats ?? {}) as Record<string, unknown>;
    return { ok: true, name: String(data.name ?? "Audience"), members: Number(stats.member_count ?? 0) };
  } catch (e) {
    const f = failure(e);
    return { ok: false, error: f.ok ? "Erreur inconnue." : f.error };
  }
}
