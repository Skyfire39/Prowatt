import { and, eq, isNull, or, sql } from "drizzle-orm";
import { getDb, schema } from "./db";
import { mailchimpConfig, subscribeToMailchimp } from "./mailchimp";
import { isEmail } from "./validate";

const MAX_EMAIL = 254;
const MAX_IMPORT = 2000;

/** Extrait des adresses d'un texte libre (une par ligne, ou séparées par virgules, points-virgules, espaces). */
export function parseEmails(raw: string) {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const part of raw.split(/[\s,;]+/)) {
    const email = part.trim().replace(/^<|>$/g, "").toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    if (email.length <= MAX_EMAIL && isEmail(email)) valid.push(email);
    else invalid.push(part.trim().slice(0, 60));
  }
  return { valid: valid.slice(0, MAX_IMPORT), invalid, truncated: valid.length > MAX_IMPORT };
}

/**
 * Sauvegarde une adresse (insère ou confirme). Une personne qui s'inscrit elle-même depuis le site
 * redonne son accord : elle redevient « abonnée » même si elle avait été désabonnée dans l'administration.
 */
export async function saveSubscriber(email: string, source: "site" | "admin" | "import") {
  const db = await getDb();
  const t = schema.subscribers;
  const now = new Date();
  const [prev] = await db.select({ status: t.status }).from(t).where(eq(t.email, email)).limit(1);
  const [row] = await db
    .insert(t)
    .values({ email, source })
    .onConflictDoUpdate({
      target: t.email,
      set: { updatedAt: now, ...(source === "site" ? { status: "subscribed", consentAt: now } : {}) },
    })
    .returning({ id: t.id, created: sql<boolean>`(xmax = 0)` });
  // `alreadySubscribed` : l'adresse était déjà abonnée avant cet appel (un ancien désabonné qui revient ne compte pas).
  return { ...row, alreadySubscribed: prev?.status === "subscribed" };
}

export type SyncOutcome = { ok: true; status: string } | { ok: false; error: string; skipped?: boolean; notConfigured?: boolean };

/** Envoie un abonné à Mailchimp et mémorise la réponse (statut ou message d'erreur). */
export async function syncSubscriber(id: string): Promise<SyncOutcome> {
  const db = await getDb();
  const t = schema.subscribers;
  const [row] = await db.select().from(t).where(eq(t.id, id)).limit(1);
  if (!row) return { ok: false, error: "Abonné introuvable." };
  if (row.status !== "subscribed") return { ok: false, error: "Abonné désinscrit : non envoyé.", skipped: true };
  if (!mailchimpConfig()) return { ok: false, error: "Mailchimp n'est pas configuré.", notConfigured: true };

  const res = await subscribeToMailchimp(row.email);
  const now = new Date();
  await db
    .update(t)
    .set(
      res.ok
        ? { mailchimpStatus: res.status, mailchimpSyncedAt: now, mailchimpError: null, updatedAt: now }
        : { mailchimpError: res.error, updatedAt: now },
    )
    .where(eq(t.id, id));
  return res.ok ? { ok: true, status: res.status } : { ok: false, error: res.error };
}

/** Abonnés actifs qui n'ont jamais été envoyés à Mailchimp, ou dont le dernier envoi a échoué. */
export const pendingSync = () => {
  const t = schema.subscribers;
  return and(eq(t.status, "subscribed"), or(isNull(t.mailchimpSyncedAt), sql`${t.mailchimpError} is not null`));
};

/** Synchronise jusqu'à `limit` abonnés en attente, 5 appels à la fois. */
export async function syncPending(limit = 50) {
  const db = await getDb();
  const t = schema.subscribers;
  const rows = await db.select({ id: t.id }).from(t).where(pendingSync()).orderBy(t.createdAt).limit(limit);
  let done = 0;
  let failed = 0;
  let firstError = "";
  for (let i = 0; i < rows.length; i += 5) {
    const results = await Promise.all(rows.slice(i, i + 5).map((r) => syncSubscriber(r.id)));
    for (const r of results) {
      if (r.ok) done++;
      else {
        failed++;
        firstError ||= r.error;
      }
    }
    if (results.some((r) => !r.ok && r.notConfigured)) break;
  }
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(t).where(pendingSync());
  return { done, failed, remaining: n, firstError };
}
