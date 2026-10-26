"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createInvoiceRecord } from "@/lib/admin/invoices";
import { isPaymentMethod, orderStatusList } from "@/lib/admin/status";
import { requireActionUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { getSettings } from "@/lib/content";
import { getDb, schema } from "@/lib/db";
import { addDays, today } from "@/lib/format";
import { int, isIsoDate, isUuid, opt, s } from "@/lib/validate";

export async function updateOrderStatusAction(fd: FormData) {
  const user = await requireActionUser("orders.write");
  const id = s(fd, "id");
  const status = s(fd, "status");
  if (!isUuid(id) || !(orderStatusList as string[]).includes(status)) redirect("/admin/commandes?ok=notfound");
  const db = await getDb();
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!o) redirect("/admin/commandes?ok=notfound");
  await db.update(schema.orders).set({ status, updatedAt: new Date() }).where(eq(schema.orders.id, id));
  await logAudit(user, `statut → ${status}`, "commande", id, o.ref);
  redirect(`/admin/commandes/${id}?ok=saved`);
}

export async function recordOrderPaymentAction(fd: FormData) {
  const user = await requireActionUser("payments.write");
  const id = s(fd, "id");
  const method = s(fd, "method");
  const amount = int(fd, "amount", 0);
  const paidAt = s(fd, "paidAt") || today();
  if (!isUuid(id) || !isPaymentMethod(method) || amount <= 0 || !isIsoDate(paidAt)) redirect(`/admin/commandes/${id}?ok=notfound`);
  const db = await getDb();
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!o) redirect("/admin/commandes?ok=notfound");

  await db.insert(schema.payments).values({ orderId: id, invoiceId: o.invoiceId, method, amount, reference: opt(fd, "reference"), note: opt(fd, "note"), paidAt, recordedBy: user.id });
  const [{ sum }] = await db.select({ sum: sql<number>`coalesce(sum(${schema.payments.amount}), 0)::int` }).from(schema.payments).where(eq(schema.payments.orderId, id));
  await db.update(schema.orders).set({ paymentStatus: sum >= o.total ? "paid" : "partial", updatedAt: new Date() }).where(eq(schema.orders.id, id));
  await logAudit(user, "paiement enregistré", "commande", id, `${o.ref} · ${amount} Ar`);
  redirect(`/admin/commandes/${id}?ok=paid`);
}

/** Crée une facture brouillon à partir d'une commande : mêmes lignes, mêmes prix (TVA incluse), paiements déjà reçus rattachés. */
export async function createInvoiceFromOrderAction(fd: FormData) {
  const user = await requireActionUser("invoices.write");
  const id = s(fd, "id");
  if (!isUuid(id)) redirect("/admin/commandes?ok=notfound");
  const db = await getDb();
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!o) redirect("/admin/commandes?ok=notfound");
  if (o.invoiceId) redirect(`/admin/factures/${o.invoiceId}`);

  const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
  const settings = await getSettings();
  const issuedAt = today();
  const invoiceId = await createInvoiceRecord({
    customerId: o.customerId,
    orderId: o.id,
    title: `Commande ${o.ref}`,
    items: items.map((i) => ({ productId: i.productId, description: i.name, unitPrice: i.unitPrice, qty: i.qty })),
    discount: 0,
    vatRate: settings.billing.vatRate,
    vatIncluded: true,
    issuedAt,
    dueAt: addDays(issuedAt, settings.billing.paymentTermsDays),
    notes: o.note,
    userId: user.id,
  });
  await db.update(schema.orders).set({ invoiceId, updatedAt: new Date() }).where(eq(schema.orders.id, id));
  await db.update(schema.payments).set({ invoiceId }).where(eq(schema.payments.orderId, id));
  await logAudit(user, "facture créée depuis commande", "facture", invoiceId, o.ref);
  redirect(`/admin/factures/${invoiceId}?ok=created`);
}
