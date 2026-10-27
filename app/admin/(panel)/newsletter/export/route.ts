import { and, desc, eq, ilike } from "drizzle-orm";
import { logAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";

const statuses = { subscribed: "abonné", unsubscribed: "désabonné" } as const;
const sources = { site: "site", admin: "admin", import: "import" } as const;
const mcLabels: Record<string, string> = {
  subscribed: "inscrit",
  pending: "en attente de confirmation",
  unsubscribed: "désabonné",
  cleaned: "adresse invalide",
  transactional: "transactionnel",
  archived: "archivé",
};

/** Neutralise l'injection de formules (Excel, Sheets) et protège les séparateurs, guillemets et retours à la ligne. */
const cell = (v: string, sep: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return safe.includes(sep) || /["\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/**
 * Export CSV des abonnés (mêmes filtres que la page). `sep=;` produit le format attendu par Excel en français ;
 * la virgule convient à Mailchimp et Google Sheets. Le fichier commence par un BOM pour que les accents s'affichent bien.
 */
export async function GET(request: Request) {
  const user = await requireUser("newsletter.manage");
  const p = new URL(request.url).searchParams;
  const sep = p.get("sep") === ";" ? ";" : ",";
  const q = (p.get("q") ?? "").trim();
  const status = p.get("status");
  const t = schema.subscribers;
  const db = await getDb();

  const rows = await db
    .select()
    .from(t)
    .where(
      and(
        q ? ilike(t.email, `%${q}%`) : undefined,
        status === "subscribed" || status === "unsubscribed" ? eq(t.status, status) : undefined,
        p.get("source") === "site" || p.get("source") === "admin" || p.get("source") === "import" ? eq(t.source, p.get("source") as string) : undefined,
      ),
    )
    .orderBy(desc(t.createdAt));

  const head = ["Email", "Statut", "Origine", "Statut Mailchimp", "Inscrit le", "Dernier envoi Mailchimp", "Erreur Mailchimp"];
  const lines = [head, ...rows.map((r) => [
    r.email,
    statuses[r.status as keyof typeof statuses] ?? r.status,
    sources[r.source as keyof typeof sources] ?? r.source,
    r.mailchimpStatus ? (mcLabels[r.mailchimpStatus] ?? r.mailchimpStatus) : "non envoyé",
    r.createdAt.toISOString().slice(0, 10),
    r.mailchimpSyncedAt ? r.mailchimpSyncedAt.toISOString().slice(0, 10) : "",
    r.mailchimpError ?? "",
  ])].map((l) => l.map((v) => cell(v, sep)).join(sep));

  await logAudit(user, "export", "newsletter", null, `${rows.length} adresse(s)`);
  const day = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="abonnes-newsletter-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
