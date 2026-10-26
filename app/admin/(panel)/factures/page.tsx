import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { InvoiceIcon } from "@/components/admin/icons";
import { Badge, DataTable, Empty, FilterBar, Flash, LinkBtn, PageHeader, Pagination, Panel, Td, inputClass, selectClass } from "@/components/admin/ui";
import { PlusIcon } from "@/components/icons";
import { paidSql } from "@/lib/admin/queries";
import { invoiceState, invoiceStates, type InvoiceState } from "@/lib/admin/status";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { ar, fmtDate, num, today } from "@/lib/format";

export const metadata: Metadata = { title: "Factures" };
const PAGE_SIZE = 15;
type SP = { q?: string; state?: string; page?: string; ok?: string };

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("invoices.read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim();
  const i = schema.invoices;
  const c = schema.customers;
  const db = await getDb();
  const t = today();

  const stateWhere = {
    draft: eq(i.status, "draft"),
    cancelled: eq(i.status, "cancelled"),
    paid: and(eq(i.status, "issued"), sql`${paidSql} >= ${i.total}`),
    overdue: and(eq(i.status, "issued"), sql`${paidSql} < ${i.total}`, sql`${i.dueAt} < ${t}`),
    partial: and(eq(i.status, "issued"), sql`${paidSql} > 0`, sql`${paidSql} < ${i.total}`, sql`(${i.dueAt} is null or ${i.dueAt} >= ${t})`),
    due: and(eq(i.status, "issued"), sql`${paidSql} = 0`, sql`${i.total} > 0`, sql`(${i.dueAt} is null or ${i.dueAt} >= ${t})`),
  } as const;
  const stateKey = sp.state && sp.state in stateWhere ? (sp.state as keyof typeof stateWhere) : undefined;

  const where = and(q ? or(ilike(i.number, `%${q}%`), ilike(i.title, `%${q}%`), ilike(c.name, `%${q}%`), ilike(c.company, `%${q}%`)) : undefined, stateKey ? stateWhere[stateKey] : undefined);
  const [[{ n }], rows, [{ due }]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(i).leftJoin(c, eq(c.id, i.customerId)).where(where),
    db
      .select({ ...getTableColumns(i), paid: paidSql, customer: c.name })
      .from(i)
      .leftJoin(c, eq(c.id, i.customerId))
      .where(where)
      .orderBy(desc(i.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ due: sql<number>`coalesce(sum(${i.total} - ${paidSql}), 0)::int` })
      .from(i)
      .where(and(eq(i.status, "issued"), sql`${i.total} > ${paidSql}`)),
  ]);
  const pages = Math.max(1, Math.ceil(n / PAGE_SIZE));
  const canWrite = can(user.role, "invoices.write");
  const href = (pg: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (sp.state) u.set("state", sp.state);
    if (pg > 1) u.set("page", String(pg));
    return `/admin/factures${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <Flash code={sp.ok} />
      <PageHeader
        eyebrow="Ventes"
        title="Factures"
        subtitle={`${num(n)} facture${n > 1 ? "s" : ""} · ${ar(due)} restent à encaisser`}
        actions={
          canWrite && (
            <LinkBtn href="/admin/factures/nouvelle">
              <PlusIcon className="size-4" />
              Nouvelle facture
            </LinkBtn>
          )
        }
      />
      <Panel flush>
        <FilterBar action="/admin/factures">
          <input name="q" defaultValue={q} placeholder="Numéro, client, objet…" className={`${inputClass} w-64`} aria-label="Rechercher" />
          <select name="state" defaultValue={sp.state ?? ""} className={`${selectClass} w-52`} aria-label="État">
            <option value="">Tous les états</option>
            {(Object.keys(stateWhere) as InvoiceState[]).map((k) => (
              <option key={k} value={k}>
                {invoiceStates[k].label}
              </option>
            ))}
          </select>
        </FilterBar>
        {rows.length === 0 ? (
          <Empty icon={<InvoiceIcon className="size-6" />} title="Aucune facture" text={q || sp.state ? "Aucun résultat avec ces filtres." : "Créez une facture, ou convertissez un devis accepté."} action={canWrite ? <LinkBtn href="/admin/factures/nouvelle">Nouvelle facture</LinkBtn> : undefined} />
        ) : (
          <DataTable head={["Numéro", "Client", "Date", "Échéance", "État", { label: "Total", right: true }, { label: "Reste dû", right: true }]} className="mt-5">
            {rows.map((r) => {
              const state = invoiceState(r, r.paid, t);
              const rest = r.status === "issued" ? Math.max(0, r.total - r.paid) : 0;
              return (
                <tr key={r.id}>
                  <Td className="whitespace-nowrap">
                    <Link href={`/admin/factures/${r.id}`} className="font-semibold hover:underline">
                      {r.status === "draft" ? "Brouillon" : r.number}
                    </Link>
                    {r.title && <p className="max-w-56 truncate text-xs text-muted">{r.title}</p>}
                  </Td>
                  <Td>{r.customer ?? <span className="text-muted">—</span>}</Td>
                  <Td className="whitespace-nowrap text-muted">{fmtDate(r.issuedAt)}</Td>
                  <Td className="whitespace-nowrap text-muted">{r.dueAt ? fmtDate(r.dueAt) : "—"}</Td>
                  <Td>
                    <Badge tone={invoiceStates[state].tone}>{invoiceStates[state].label}</Badge>
                  </Td>
                  <Td right className="font-semibold">
                    {ar(r.total)}
                  </Td>
                  <Td right>{rest > 0 ? <span className="font-semibold">{ar(rest)}</span> : <span className="text-muted">—</span>}</Td>
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
