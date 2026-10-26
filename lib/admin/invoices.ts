import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { atomic, getDb, schema } from "@/lib/db";
import { computeTotals, today } from "@/lib/format";
import { formatNumber, nextSequence, provisionalNumber, type DocItem } from "./documents";
import { getSettings } from "@/lib/content";

type Input = {
  customerId: string | null;
  quoteId?: string | null;
  orderId?: string | null;
  title?: string | null;
  items: DocItem[];
  discount: number;
  vatRate: number;
  vatIncluded?: boolean;
  issuedAt: string;
  dueAt: string | null;
  notes?: string | null;
  userId: string;
  /** Émettre tout de suite (numéro légal attribué) ou garder en brouillon. */
  issueNow?: boolean;
};

export async function createInvoiceRecord(input: Input): Promise<string> {
  const id = randomUUID();
  const t = computeTotals(input.items, input.discount, input.vatRate, input.vatIncluded);
  const year = input.issuedAt.slice(0, 4);
  const settings = await getSettings();
  const number = input.issueNow ? formatNumber(settings.billing.invoicePrefix, year, await nextSequence("invoice", year)) : provisionalNumber();

  await atomic((q) => [
    q.insert(schema.invoices).values({
      id,
      number,
      customerId: input.customerId,
      quoteId: input.quoteId ?? null,
      orderId: input.orderId ?? null,
      title: input.title ?? null,
      status: input.issueNow ? "issued" : "draft",
      issuedAt: input.issuedAt,
      dueAt: input.dueAt,
      discount: Math.max(0, Math.round(input.discount)),
      vatRate: String(input.vatRate),
      vatIncluded: input.vatIncluded ?? false,
      subtotal: t.subtotal,
      total: t.total,
      notes: input.notes ?? null,
      createdBy: input.userId,
    }),
    ...(input.items.length
      ? [
          q.insert(schema.invoiceItems).values(
            input.items.map((it, i) => ({ invoiceId: id, position: i, productId: it.productId, description: it.description, unitPrice: it.unitPrice, qty: it.qty })),
          ),
        ]
      : []),
  ]);
  return id;
}

/** Émet un brouillon : attribue le numéro légal suivant et fige le document. */
export async function issueInvoiceRecord(id: string): Promise<string | null> {
  const db = await getDb();
  const [inv] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).limit(1);
  if (!inv || inv.status !== "draft") return null;
  const settings = await getSettings();
  const issuedAt = inv.issuedAt || today();
  const year = issuedAt.slice(0, 4);
  const number = formatNumber(settings.billing.invoicePrefix, year, await nextSequence("invoice", year));
  await db.update(schema.invoices).set({ number, status: "issued", issuedAt, updatedAt: new Date() }).where(eq(schema.invoices.id, id));
  return number;
}
