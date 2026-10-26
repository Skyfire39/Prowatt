import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { computeTotals, today } from "@/lib/format";
import { invoiceState } from "./status";
import { paidSql } from "./queries";
import { isUuid } from "@/lib/validate";

export async function loadQuote(id: string) {
  if (!isUuid(id)) return null;
  const db = await getDb();
  const [quote] = await db.select().from(schema.quotes).where(eq(schema.quotes.id, id)).limit(1);
  if (!quote) return null;
  const [items, customer] = await Promise.all([
    db.select().from(schema.quoteItems).where(eq(schema.quoteItems.quoteId, id)).orderBy(asc(schema.quoteItems.position)),
    quote.customerId ? db.select().from(schema.customers).where(eq(schema.customers.id, quote.customerId)).limit(1).then((r) => r[0] ?? null) : Promise.resolve(null),
  ]);
  const totals = computeTotals(items, quote.discount, Number(quote.vatRate), quote.vatIncluded);
  return { quote, items, customer, totals };
}

export async function loadInvoice(id: string) {
  if (!isUuid(id)) return null;
  const db = await getDb();
  const [invoice] = await db
    .select({ inv: schema.invoices, paid: paidSql })
    .from(schema.invoices)
    .where(eq(schema.invoices.id, id))
    .limit(1)
    .then((r) => r.map((x) => ({ ...x.inv, paid: x.paid })));
  if (!invoice) return null;
  const [items, customer, payments] = await Promise.all([
    db.select().from(schema.invoiceItems).where(eq(schema.invoiceItems.invoiceId, id)).orderBy(asc(schema.invoiceItems.position)),
    invoice.customerId ? db.select().from(schema.customers).where(eq(schema.customers.id, invoice.customerId)).limit(1).then((r) => r[0] ?? null) : Promise.resolve(null),
    db.select().from(schema.payments).where(eq(schema.payments.invoiceId, id)).orderBy(asc(schema.payments.paidAt), asc(schema.payments.createdAt)),
  ]);
  const totals = computeTotals(items, invoice.discount, Number(invoice.vatRate), invoice.vatIncluded);
  const state = invoiceState({ status: invoice.status, total: invoice.total, dueAt: invoice.dueAt }, invoice.paid, today());
  return { invoice, items, customer, payments, totals, state };
}
