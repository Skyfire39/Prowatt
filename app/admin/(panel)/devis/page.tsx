import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { QuoteIcon } from "@/components/admin/icons";
import { Badge, DataTable, Empty, FilterBar, Flash, LinkBtn, PageHeader, Pagination, Panel, Td, inputClass, selectClass } from "@/components/admin/ui";
import { PlusIcon } from "@/components/icons";
import { quoteStatuses, quoteStatusList, type QuoteStatus } from "@/lib/admin/status";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { ar, fmtDate, num, today } from "@/lib/format";

export const metadata: Metadata = { title: "Devis" };
const PAGE_SIZE = 15;
type SP = { q?: string; status?: string; page?: string; ok?: string };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("quotes.read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim();
  const qt = schema.quotes;
  const c = schema.customers;
  const db = await getDb();

  const where = and(
    q ? or(ilike(qt.number, `%${q}%`), ilike(qt.title, `%${q}%`), ilike(c.name, `%${q}%`), ilike(c.company, `%${q}%`)) : undefined,
    sp.status && (quoteStatusList as string[]).includes(sp.status) ? eq(qt.status, sp.status) : undefined,
  );
  const base = db.select({ n: sql<number>`count(*)::int` }).from(qt).leftJoin(c, eq(c.id, qt.customerId)).where(where);
  const [[{ n }], rows] = await Promise.all([
    base,
    db
      .select({ ...getTableColumns(qt), customer: c.name, company: c.company })
      .from(qt)
      .leftJoin(c, eq(c.id, qt.customerId))
      .where(where)
      .orderBy(desc(qt.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
  ]);
  const pages = Math.max(1, Math.ceil(n / PAGE_SIZE));
  const t = today();
  const canWrite = can(user.role, "quotes.write");
  const href = (pg: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (sp.status) u.set("status", sp.status);
    if (pg > 1) u.set("page", String(pg));
    return `/admin/devis${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <Flash code={sp.ok} />
      <PageHeader
        eyebrow="Ventes"
        title="Devis"
        subtitle={`${num(n)} devis personnalisé${n > 1 ? "s" : ""}`}
        actions={
          canWrite && (
            <LinkBtn href="/admin/devis/nouveau">
              <PlusIcon className="size-4" />
              Nouveau devis
            </LinkBtn>
          )
        }
      />
      <Panel flush>
        <FilterBar action="/admin/devis">
          <input name="q" defaultValue={q} placeholder="Numéro, client, objet…" className={`${inputClass} w-64`} aria-label="Rechercher" />
          <select name="status" defaultValue={sp.status ?? ""} className={`${selectClass} w-44`} aria-label="Statut">
            <option value="">Tous les statuts</option>
            {quoteStatusList.map((s) => (
              <option key={s} value={s}>
                {quoteStatuses[s].label}
              </option>
            ))}
          </select>
        </FilterBar>
        {rows.length === 0 ? (
          <Empty icon={<QuoteIcon className="size-6" />} title="Aucun devis" text={q || sp.status ? "Aucun résultat avec ces filtres." : "Créez votre premier devis personnalisé en quelques clics."} action={canWrite ? <LinkBtn href="/admin/devis/nouveau">Nouveau devis</LinkBtn> : undefined} />
        ) : (
          <DataTable head={["Numéro", "Client", "Date", "Validité", "Statut", { label: "Total", right: true }]} className="mt-5">
            {rows.map((r) => {
              const expired = r.status === "sent" && r.validUntil && r.validUntil < t;
              const st = expired ? quoteStatuses.expired : (quoteStatuses[r.status as QuoteStatus] ?? quoteStatuses.draft);
              return (
                <tr key={r.id}>
                  <Td className="whitespace-nowrap">
                    <Link href={`/admin/devis/${r.id}`} className="font-semibold hover:underline">
                      {r.number}
                    </Link>
                    {r.title && <p className="max-w-56 truncate text-xs text-muted">{r.title}</p>}
                  </Td>
                  <Td>
                    {r.customer ?? <span className="text-muted">—</span>}
                    {r.company && <p className="text-xs text-muted">{r.company}</p>}
                  </Td>
                  <Td className="whitespace-nowrap text-muted">{fmtDate(r.issuedAt)}</Td>
                  <Td className="whitespace-nowrap text-muted">{r.validUntil ? fmtDate(r.validUntil) : "—"}</Td>
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
