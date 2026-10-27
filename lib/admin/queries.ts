import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { today } from "@/lib/format";

const { invoices, payments, orders, quotes, customers, auditLog, orderItems } = schema;

/** Total encaissé sur une facture (sous-requête réutilisable). */
export const paidSql = sql<number>`coalesce((select sum(p.amount) from payments p where p.invoice_id = "invoices"."id"), 0)::int`;

type NavCounts = { newOrders: number; overdueInvoices: number };
let navCache: { at: number; value: NavCounts } | undefined;

/**
 * Compteurs affichés en badge dans la navigation. Gardés 15 s en mémoire : ils sont demandés à chaque page de
 * l'administration et la base peut être loin (chaque aller-retour coûte plusieurs centaines de millisecondes).
 * Les actions qui changent une commande ou une facture appellent `resetNavCounts()`.
 */
export function resetNavCounts() {
  navCache = undefined;
}

export async function getNavCounts(): Promise<NavCounts> {
  if (navCache && Date.now() - navCache.at < 15_000) return navCache.value;
  const value = await loadNavCounts();
  navCache = { at: Date.now(), value };
  return value;
}

async function loadNavCounts(): Promise<NavCounts> {
  const db = await getDb();
  const t = today();
  const [[o], [i]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(orders).where(eq(orders.status, "new")),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(invoices)
      .where(and(eq(invoices.status, "issued"), sql`${invoices.dueAt} < ${t}`, sql`${invoices.total} > ${paidSql}`)),
  ]);
  return { newOrders: o.n, overdueInvoices: i.n };
}

const monthKey = (d: Date) => d.toISOString().slice(0, 7);

export async function getDashboard() {
  const db = await getDb();
  const now = new Date();
  const t = today();
  const monthStart = `${t.slice(0, 7)}-01`;
  const sixAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)).toISOString().slice(0, 10);

  const [revenueRows, receivable, ordersNew, quotesOpen, recentOrders, dueInvoices, recentQuotes, activity, topProducts, customersCount] = await Promise.all([
    db
      .select({ m: sql<string>`to_char(${payments.paidAt}, 'YYYY-MM')`, total: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
      .from(payments)
      .where(gte(payments.paidAt, sixAgo))
      .groupBy(sql`1`),
    db
      .select({ total: invoices.total, paid: paidSql, dueAt: invoices.dueAt })
      .from(invoices)
      .where(eq(invoices.status, "issued")),
    db
      .select({ n: sql<number>`count(*)::int`, sum: sql<number>`coalesce(sum(${orders.total}), 0)::int` })
      .from(orders)
      .where(eq(orders.status, "new")),
    db
      .select({ n: sql<number>`count(*)::int`, sum: sql<number>`coalesce(sum(${quotes.total}), 0)::int` })
      .from(quotes)
      .where(eq(quotes.status, "sent")),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
    db
      .select({
        id: invoices.id,
        number: invoices.number,
        total: invoices.total,
        dueAt: invoices.dueAt,
        paid: paidSql,
        customer: customers.name,
      })
      .from(invoices)
      .leftJoin(customers, eq(customers.id, invoices.customerId))
      .where(and(eq(invoices.status, "issued"), sql`${invoices.total} > ${paidSql}`))
      .orderBy(sql`${invoices.dueAt} asc nulls last`)
      .limit(6),
    db
      .select({ id: quotes.id, number: quotes.number, total: quotes.total, status: quotes.status, customer: customers.name })
      .from(quotes)
      .leftJoin(customers, eq(customers.id, quotes.customerId))
      .orderBy(desc(quotes.createdAt))
      .limit(5),
    db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(8),
    db
      .select({ name: orderItems.name, qty: sql<number>`sum(${orderItems.qty})::int` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(gte(orders.createdAt, new Date(Date.now() - 90 * 86400000)), sql`${orders.status} <> 'cancelled'`))
      .groupBy(orderItems.name)
      .orderBy(desc(sql`sum(${orderItems.qty})`))
      .limit(5),
    db.select({ n: sql<number>`count(*)::int` }).from(customers),
  ]);

  // Six derniers mois, y compris ceux sans encaissement.
  const byMonth = new Map(revenueRows.map((r) => [r.m, r.total]));
  const months = Array.from({ length: 6 }, (_, k) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - k), 1));
    const key = monthKey(d);
    return { key, label: d.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" }), total: byMonth.get(key) ?? 0 };
  });
  const thisMonth = months[5].total;
  const lastMonth = months[4].total;

  const outstanding = receivable.reduce((s, r) => s + Math.max(0, r.total - r.paid), 0);
  const overdue = receivable.filter((r) => r.total > r.paid && r.dueAt && r.dueAt < t);

  return {
    months,
    thisMonth,
    lastMonth,
    monthStart,
    outstanding,
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((s, r) => s + (r.total - r.paid), 0),
    ordersNew: ordersNew[0],
    quotesOpen: quotesOpen[0],
    recentOrders,
    dueInvoices,
    recentQuotes,
    activity,
    topProducts,
    customers: customersCount[0].n,
  };
}

export { inArray };
