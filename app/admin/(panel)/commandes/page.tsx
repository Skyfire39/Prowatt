import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { Badge, DataTable, Empty, FilterBar, Flash, PageHeader, Pagination, Panel, Td, inputClass, selectClass } from "@/components/admin/ui";
import { BagIcon } from "@/components/icons";
import { orderStatuses, orderStatusList, paymentMethods, type OrderStatus, type PaymentMethod } from "@/lib/admin/status";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { ar, fmtDateTime, num } from "@/lib/format";

export const metadata: Metadata = { title: "Commandes" };
const PAGE_SIZE = 15;
type SP = { q?: string; status?: string; pay?: string; page?: string; ok?: string };

const payTone = { paid: "teal", pending: "blue", partial: "blue", unpaid: "amber" } as const;
const payLabel = { paid: "Payée", pending: "En attente", partial: "Partielle", unpaid: "Non payée" } as const;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("orders.read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim();
  const o = schema.orders;
  const db = await getDb();

  const where = and(
    q ? or(ilike(o.ref, `%${q}%`), ilike(o.customerName, `%${q}%`), ilike(o.customerPhone, `%${q}%`)) : undefined,
    sp.status && (orderStatusList as string[]).includes(sp.status) ? eq(o.status, sp.status) : undefined,
    sp.pay && sp.pay in payLabel ? eq(o.paymentStatus, sp.pay) : undefined,
  );
  const [[{ n }], rows] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(o).where(where),
    db
      .select({ ...getTableColumns(o), items: sql<number>`(select coalesce(sum(i.qty), 0) from order_items i where i.order_id = "orders"."id")::int` })
      .from(o)
      .where(where)
      .orderBy(desc(o.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
  ]);
  const pages = Math.max(1, Math.ceil(n / PAGE_SIZE));
  const href = (pg: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (sp.status) u.set("status", sp.status);
    if (sp.pay) u.set("pay", sp.pay);
    if (pg > 1) u.set("page", String(pg));
    return `/admin/commandes${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <Flash code={sp.ok} />
      <PageHeader eyebrow="Ventes" title="Commandes" subtitle={`${num(n)} commande${n > 1 ? "s" : ""} passée${n > 1 ? "s" : ""} sur le site`} />
      <Panel flush>
        <FilterBar action="/admin/commandes">
          <input name="q" defaultValue={q} placeholder="Référence, client, téléphone…" className={`${inputClass} w-64`} aria-label="Rechercher" />
          <select name="status" defaultValue={sp.status ?? ""} className={`${selectClass} w-48`} aria-label="Statut">
            <option value="">Tous les statuts</option>
            {orderStatusList.map((s) => (
              <option key={s} value={s}>
                {orderStatuses[s].label}
              </option>
            ))}
          </select>
          <select name="pay" defaultValue={sp.pay ?? ""} className={`${selectClass} w-44`} aria-label="Paiement">
            <option value="">Tous paiements</option>
            {Object.entries(payLabel).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </FilterBar>
        {rows.length === 0 ? (
          <Empty icon={<BagIcon className="size-6" />} title="Aucune commande" text={q || sp.status || sp.pay ? "Aucun résultat avec ces filtres." : "Les commandes passées sur le site apparaîtront ici."} />
        ) : (
          <DataTable head={["Référence", "Client", { label: "Articles", right: true }, "Paiement", "Statut", { label: "Total", right: true }]} className="mt-5">
            {rows.map((r) => {
              const st = orderStatuses[r.status as OrderStatus] ?? orderStatuses.new;
              const pay = (r.paymentStatus in payLabel ? r.paymentStatus : "unpaid") as keyof typeof payLabel;
              return (
                <tr key={r.id}>
                  <Td className="whitespace-nowrap">
                    <Link href={`/admin/commandes/${r.id}`} className="font-semibold hover:underline">
                      {r.ref}
                    </Link>
                    <p className="text-xs text-muted">{fmtDateTime(r.createdAt)}</p>
                  </Td>
                  <Td>
                    <p className="font-medium">{r.customerName}</p>
                    <p className="text-xs text-muted">{r.customerPhone}</p>
                  </Td>
                  <Td right>{r.items}</Td>
                  <Td>
                    <Badge tone={payTone[pay]}>{payLabel[pay]}</Badge>
                    <p className="mt-1 text-xs text-muted">{paymentMethods[(r.paymentMethod === "bank" ? "virement" : r.paymentMethod === "card" ? "carte" : r.paymentMethod) as PaymentMethod] ?? r.paymentMethod}</p>
                  </Td>
                  <Td>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </Td>
                  <Td right className="font-semibold">
                    {ar(r.total)}
                  </Td>
                </tr>
              );
            })}
          </DataTable>
        )}
        <Pagination page={page} pages={pages} hrefFor={href} />
      </Panel>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
