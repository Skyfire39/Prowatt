import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

export type DocItem = { productId: string | null; description: string; unitPrice: number; qty: number };

/**
 * Lit les lignes d'un devis ou d'une facture envoyées par le formulaire (JSON) et les valide.
 * Les totaux ne sont jamais lus : ils sont recalculés côté serveur.
 */
export function parseItems(json: string): { items: DocItem[] } | { error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(json || "[]");
  } catch {
    return { error: "Les lignes du document sont illisibles." };
  }
  if (!Array.isArray(raw)) return { error: "Les lignes du document sont illisibles." };
  if (raw.length > 100) return { error: "100 lignes maximum par document." };
  const items: DocItem[] = [];
  for (const r of raw as Record<string, unknown>[]) {
    const description = String(r?.description ?? "").trim().slice(0, 300);
    const unitPrice = Math.round(Number(r?.unitPrice));
    const qty = Math.round(Number(r?.qty));
    if (!description && !unitPrice) continue; // ligne vide ignorée
    if (!description) return { error: "Chaque ligne doit avoir une désignation." };
    if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 2_000_000_000) return { error: `Prix invalide pour « ${description} ».` };
    if (!Number.isFinite(qty) || qty < 1 || qty > 1_000_000) return { error: `Quantité invalide pour « ${description} ».` };
    const pid = typeof r?.productId === "string" && r.productId ? r.productId.slice(0, 80) : null;
    items.push({ productId: pid, description, unitPrice, qty });
  }
  return { items };
}

/** Prochain numéro de séquence d'un type de document pour une année (atomique : jamais deux fois le même). */
export async function nextSequence(kind: "quote" | "invoice", year: string): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .insert(schema.counters)
    .values({ key: `${kind}-${year}`, value: 1 })
    .onConflictDoUpdate({ target: schema.counters.key, set: { value: sql`${schema.counters.value} + 1` } })
    .returning({ value: schema.counters.value });
  return row.value;
}

export const formatNumber = (prefix: string, year: string, n: number) => `${prefix}-${year}-${String(n).padStart(4, "0")}`;

/** Numéro provisoire d'un brouillon de facture : le numéro légal n'est attribué qu'à l'émission, sans trou. */
export const provisionalNumber = () => `BROUILLON-${randomBytes(3).toString("hex").toUpperCase()}`;
