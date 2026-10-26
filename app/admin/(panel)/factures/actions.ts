"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { parseItems } from "@/lib/admin/documents";
import { createInvoiceRecord, issueInvoiceRecord } from "@/lib/admin/invoices";
import { loadInvoice } from "@/lib/admin/load";
import { isPaymentMethod } from "@/lib/admin/status";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { atomic, getDb, schema } from "@/lib/db";
import { computeTotals, today } from "@/lib/format";
import { bool, int, isIsoDate, isUuid, num, opt, s, type FormState } from "@/lib/validate";

export async function saveInvoiceAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("invoices.write");
  const db = await getDb();
  const id = s(fd, "id");
  const issue = s(fd, "intent") === "issue";

  const parsed = parseItems(s(fd, "items"));
  if ("error" in parsed) return { error: parsed.error };
  if (parsed.items.length === 0) return { error: "Ajoutez au moins une ligne à la facture." };

  const issuedAt = s(fd, "issuedAt");
  const dueAt = s(fd, "endDate");
  if (!isIsoDate(issuedAt)) return { error: "Date d'émission invalide." };
  if (dueAt && !isIsoDate(dueAt)) return { error: "Date d'échéance invalide." };
  if (dueAt && dueAt < issuedAt) return { error: "L'échéance précède la date d'émission." };
  const customerId = s(fd, "customerId");
  if (customerId && !isUuid(customerId)) return { error: "Client invalide." };
  if (issue && !customerId) return { error: "Choisissez un client avant d'émettre la facture." };

  const vatRate = Math.min(100, Math.max(0, num(fd, "vatRate", 0)));
  const vatIncluded = bool(fd, "vatIncluded");
  const discount = Math.max(0, int(fd, "discount", 0));

  if (!id) {
    const newId = await createInvoiceRecord({
      customerId: customerId || null,
      title: opt(fd, "title"),
      items: parsed.items,
      discount,
      vatRate,
      vatIncluded,
      issuedAt,
      dueAt: dueAt || null,
      notes: opt(fd, "notes"),
      userId: user.id,
      issueNow: issue,
    });
    await logAudit(user, issue ? "création et émission" : "création", "facture", newId);
    redirect(`/admin/factures/${newId}?ok=${issue ? "issued" : "created"}`);
  }

  if (!isUuid(id)) return { error: "Facture introuvable." };
  const [inv] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).limit(1);
  if (!inv) return { error: "Facture introuvable." };
  if (inv.status !== "draft") return { error: "Une facture émise n'est plus modifiable." };

  const t = computeTotals(parsed.items, discount, vatRate, vatIncluded);
  await atomic((x) => [
    x
      .update(schema.invoices)
      .set({ customerId: customerId || null, title: opt(fd, "title"), issuedAt, dueAt: dueAt || null, discount, vatRate: String(vatRate), vatIncluded, subtotal: t.subtotal, total: t.total, notes: opt(fd, "notes"), updatedAt: new Date() })
      .where(eq(schema.invoices.id, id)),
    x.delete(schema.invoiceItems).where(eq(schema.invoiceItems.invoiceId, id)),
    x.insert(schema.invoiceItems).values(parsed.items.map((it, i) => ({ invoiceId: id, position: i, productId: it.productId, description: it.description, unitPrice: it.unitPrice, qty: it.qty }))),
  ]);
  if (issue) {
    const number = await issueInvoiceRecord(id);
    await logAudit(user, "émission", "facture", id, number ?? undefined);
    redirect(`/admin/factures/${id}?ok=issued`);
  }
  await logAudit(user, "modification", "facture", id, inv.number);
  redirect(`/admin/factures/${id}?ok=saved`);
}

export async function issueInvoiceAction(fd: FormData) {
  const user = await requireActionUser("invoices.write");
  const id = s(fd, "id");
  const loaded = await loadInvoice(id);
  if (!loaded) redirect("/admin/factures?ok=notfound");
  if (loaded.invoice.status !== "draft") redirect(`/admin/factures/${id}`);
  if (!loaded.invoice.customerId) redirect(`/admin/factures/${id}/modifier`);
  if (loaded.items.length === 0) redirect(`/admin/factures/${id}/modifier`);
  const number = await issueInvoiceRecord(id);
  await logAudit(user, "émission", "facture", id, number ?? undefined);
  redirect(`/admin/factures/${id}?ok=issued`);
}

export async function recordInvoicePaymentAction(fd: FormData) {
  const user = await requireActionUser("payments.write");
  const id = s(fd, "id");
  const method = s(fd, "method");
  const amount = int(fd, "amount", 0);
  const paidAt = s(fd, "paidAt") || today();
  const loaded = await loadInvoice(id);
  if (!loaded || !isPaymentMethod(method) || amount <= 0 || !isIsoDate(paidAt)) redirect(`/admin/factures/${id}?ok=notfound`);
  const { invoice } = loaded;
  if (invoice.status !== "issued") redirect(`/admin/factures/${id}?ok=notissued`);
  if (amount > invoice.total - invoice.paid) redirect(`/admin/factures/${id}?ok=overpay`);

  const db = await getDb();
  await db.insert(schema.payments).values({ invoiceId: id, orderId: invoice.orderId, method, amount, reference: opt(fd, "reference"), note: opt(fd, "note"), paidAt, recordedBy: user.id });
  // Si la facture vient d'une commande, l'état de paiement de la commande suit.
  if (invoice.orderId) {
    const [{ sum }] = await db.select({ sum: sql<number>`coalesce(sum(${schema.payments.amount}), 0)::int` }).from(schema.payments).where(eq(schema.payments.orderId, invoice.orderId));
    await db.update(schema.orders).set({ paymentStatus: sum >= invoice.total ? "paid" : "partial", updatedAt: new Date() }).where(eq(schema.orders.id, invoice.orderId));
  }
  await logAudit(user, "paiement enregistré", "facture", id, `${invoice.number} · ${amount} Ar`);
  redirect(`/admin/factures/${id}?ok=paid`);
}

export async function deletePaymentAction(fd: FormData) {
  const user = await requireActionUser("payments.write");
  const paymentId = s(fd, "paymentId");
  const invoiceId = s(fd, "id");
  if (!isUuid(paymentId) || !isUuid(invoiceId)) redirect("/admin/factures?ok=notfound");
  const db = await getDb();
  await db.delete(schema.payments).where(eq(schema.payments.id, paymentId));
  await logAudit(user, "paiement supprimé", "facture", invoiceId);
  redirect(`/admin/factures/${invoiceId}?ok=deleted`);
}

export async function cancelInvoiceAction(fd: FormData) {
  const user = await requireActionUser("invoices.write");
  const id = s(fd, "id");
  const loaded = await loadInvoice(id);
  if (!loaded || loaded.invoice.status !== "issued") redirect("/admin/factures?ok=notfound");
  const db = await getDb();
  await db.update(schema.invoices).set({ status: "cancelled", updatedAt: new Date() }).where(eq(schema.invoices.id, id));
  await logAudit(user, "annulation", "facture", id, loaded.invoice.number);
  redirect(`/admin/factures/${id}?ok=cancelled`);
}

export async function deleteInvoiceAction(fd: FormData) {
  const user = await requireActionUser("invoices.write");
  const id = s(fd, "id");
  const loaded = await loadInvoice(id);
  if (!loaded) redirect("/admin/factures?ok=notfound");
  // Seuls les brouillons se suppriment : une facture émise garde son numéro (elle s'annule).
  if (loaded.invoice.status !== "draft") redirect(`/admin/factures/${id}?ok=locked`);
  const db = await getDb();
  await atomic((x) => [
    x.update(schema.orders).set({ invoiceId: null }).where(eq(schema.orders.invoiceId, id)),
    x.update(schema.quotes).set({ invoiceId: null }).where(eq(schema.quotes.invoiceId, id)),
    x.delete(schema.invoices).where(eq(schema.invoices.id, id)),
  ]);
  void db;
  await logAudit(user, "suppression du brouillon", "facture", id, loaded.invoice.number);
  redirect("/admin/factures?ok=deleted");
}
