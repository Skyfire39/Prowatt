"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { formatNumber, nextSequence, parseItems } from "@/lib/admin/documents";
import { createInvoiceRecord } from "@/lib/admin/invoices";
import { loadQuote } from "@/lib/admin/load";
import { quoteStatusList } from "@/lib/admin/status";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getSettings } from "@/lib/content";
import { atomic, getDb, schema } from "@/lib/db";
import { addDays, computeTotals, today } from "@/lib/format";
import { bool, int, isIsoDate, isUuid, num, opt, s, type FormState } from "@/lib/validate";

export async function saveQuoteAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("quotes.write");
  const db = await getDb();
  const id = s(fd, "id");

  const parsed = parseItems(s(fd, "items"));
  if ("error" in parsed) return { error: parsed.error };
  if (parsed.items.length === 0) return { error: "Ajoutez au moins une ligne au devis." };

  const issuedAt = s(fd, "issuedAt");
  const endDate = s(fd, "endDate");
  if (!isIsoDate(issuedAt)) return { error: "Date d'émission invalide." };
  if (endDate && !isIsoDate(endDate)) return { error: "Date de validité invalide." };
  if (endDate && endDate < issuedAt) return { error: "La date de validité précède la date d'émission." };

  const customerId = s(fd, "customerId");
  if (customerId && !isUuid(customerId)) return { error: "Client invalide." };

  const vatRate = Math.min(100, Math.max(0, num(fd, "vatRate", 0)));
  const vatIncluded = bool(fd, "vatIncluded");
  const discount = Math.max(0, int(fd, "discount", 0));
  const t = computeTotals(parsed.items, discount, vatRate, vatIncluded);
  const settings = await getSettings();

  const fields = {
    customerId: customerId || null,
    title: opt(fd, "title"),
    issuedAt,
    validUntil: endDate || null,
    discount,
    vatRate: String(vatRate),
    vatIncluded,
    subtotal: t.subtotal,
    total: t.total,
    notes: opt(fd, "notes"),
    terms: opt(fd, "terms"),
    updatedAt: new Date(),
  };
  const rows = (quoteId: string) =>
    parsed.items.map((it, i) => ({ quoteId, position: i, productId: it.productId, description: it.description, unitPrice: it.unitPrice, qty: it.qty }));

  if (id) {
    if (!isUuid(id)) return { error: "Devis introuvable." };
    const [q] = await db.select().from(schema.quotes).where(eq(schema.quotes.id, id)).limit(1);
    if (!q) return { error: "Devis introuvable." };
    if (q.invoiceId) return { error: "Ce devis a déjà été converti en facture : il n'est plus modifiable." };
    await atomic((x) => [
      x.update(schema.quotes).set(fields).where(eq(schema.quotes.id, id)),
      x.delete(schema.quoteItems).where(eq(schema.quoteItems.quoteId, id)),
      x.insert(schema.quoteItems).values(rows(id)),
    ]);
    await logAudit(user, "modification", "devis", id, q.number);
    redirect(`/admin/devis/${id}?ok=saved`);
  }

  const year = issuedAt.slice(0, 4);
  const number = formatNumber(settings.billing.quotePrefix, year, await nextSequence("quote", year));
  const newId = randomUUID();
  await atomic((x) => [x.insert(schema.quotes).values({ id: newId, number, status: "draft", createdBy: user.id, ...fields }), x.insert(schema.quoteItems).values(rows(newId))]);
  await logAudit(user, "création", "devis", newId, number);
  redirect(`/admin/devis/${newId}?ok=created`);
}

export async function setQuoteStatusAction(fd: FormData) {
  const user = await requireActionUser("quotes.write");
  const id = s(fd, "id");
  const status = s(fd, "status");
  if (!isUuid(id) || !(quoteStatusList as string[]).includes(status)) redirect("/admin/devis?ok=notfound");
  const db = await getDb();
  const [q] = await db.select().from(schema.quotes).where(eq(schema.quotes.id, id)).limit(1);
  if (!q) redirect("/admin/devis?ok=notfound");
  await db.update(schema.quotes).set({ status, updatedAt: new Date() }).where(eq(schema.quotes.id, id));
  await logAudit(user, `statut → ${status}`, "devis", id, q.number);
  redirect(`/admin/devis/${id}?ok=saved`);
}

export async function convertQuoteToInvoiceAction(fd: FormData) {
  const user = await requireActionUser("invoices.write");
  const id = s(fd, "id");
  const loaded = await loadQuote(id);
  if (!loaded) redirect("/admin/devis?ok=notfound");
  const { quote, items } = loaded;
  if (quote.invoiceId) redirect(`/admin/factures/${quote.invoiceId}`);
  if (items.length === 0) redirect(`/admin/devis/${id}?ok=locked`);

  const settings = await getSettings();
  const issuedAt = today();
  const invoiceId = await createInvoiceRecord({
    customerId: quote.customerId,
    quoteId: quote.id,
    title: quote.title ?? `Devis ${quote.number}`,
    items: items.map((i) => ({ productId: i.productId, description: i.description, unitPrice: i.unitPrice, qty: i.qty })),
    discount: quote.discount,
    vatRate: Number(quote.vatRate),
    vatIncluded: quote.vatIncluded,
    issuedAt,
    dueAt: addDays(issuedAt, settings.billing.paymentTermsDays),
    notes: quote.notes,
    userId: user.id,
  });
  const db = await getDb();
  await db.update(schema.quotes).set({ invoiceId, status: "accepted", updatedAt: new Date() }).where(eq(schema.quotes.id, id));
  await logAudit(user, "converti en facture", "devis", id, quote.number);
  redirect(`/admin/factures/${invoiceId}?ok=converted`);
}

export async function duplicateQuoteAction(fd: FormData) {
  const user = await requireActionUser("quotes.write");
  const loaded = await loadQuote(s(fd, "id"));
  if (!loaded) redirect("/admin/devis?ok=notfound");
  const { quote, items } = loaded;
  const settings = await getSettings();
  const issuedAt = today();
  const year = issuedAt.slice(0, 4);
  const number = formatNumber(settings.billing.quotePrefix, year, await nextSequence("quote", year));
  const newId = randomUUID();
  await atomic((x) => [
    x.insert(schema.quotes).values({
      id: newId,
      number,
      customerId: quote.customerId,
      title: quote.title,
      status: "draft",
      issuedAt,
      validUntil: addDays(issuedAt, settings.billing.quoteValidityDays),
      discount: quote.discount,
      vatRate: quote.vatRate,
      vatIncluded: quote.vatIncluded,
      subtotal: quote.subtotal,
      total: quote.total,
      notes: quote.notes,
      terms: quote.terms,
      createdBy: user.id,
    }),
    ...(items.length ? [x.insert(schema.quoteItems).values(items.map((i, p) => ({ quoteId: newId, position: p, productId: i.productId, description: i.description, unitPrice: i.unitPrice, qty: i.qty })))] : []),
  ]);
  await logAudit(user, "duplication", "devis", newId, `${number} (copie de ${quote.number})`);
  redirect(`/admin/devis/${newId}?ok=created`);
}

export async function deleteQuoteAction(fd: FormData) {
  const user = await requireActionUser("quotes.write");
  const id = s(fd, "id");
  const loaded = await loadQuote(id);
  if (!loaded) redirect("/admin/devis?ok=notfound");
  if (loaded.quote.invoiceId) redirect(`/admin/devis/${id}?ok=inuse`);
  const db = await getDb();
  await db.delete(schema.quotes).where(eq(schema.quotes.id, id));
  await logAudit(user, "suppression", "devis", id, loaded.quote.number);
  redirect("/admin/devis?ok=deleted");
}
