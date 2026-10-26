import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { EditIcon } from "@/components/admin/icons";
import { Badge, DataTable, Empty, FilterBar, Flash, LinkBtn, PageHeader, Pagination, Panel, Td, inputClass, selectClass } from "@/components/admin/ui";
import { PlusIcon, UsersIcon } from "@/components/icons";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { customerTypes } from "@/lib/admin/status";
import { getDb, schema } from "@/lib/db";
import { ar, fmtDate, num } from "@/lib/format";

export const metadata: Metadata = { title: "Clients" };
const PAGE_SIZE = 15;
type SP = { q?: string; type?: string; source?: string; page?: string; ok?: string };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("customers.read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim();
  const c = schema.customers;
  const db = await getDb();

  const where = and(
    q ? or(ilike(c.name, `%${q}%`), ilike(c.company, `%${q}%`), ilike(c.email, `%${q}%`), ilike(c.phone, `%${q}%`)) : undefined,
    sp.type === "company" || sp.type === "individual" ? eq(c.type, sp.type) : undefined,
    sp.source === "site" || sp.source === "admin" ? eq(c.source, sp.source) : undefined,
  );

  const [[{ n }], rows] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(c).where(where),
    db
      .select({
        id: c.id,
        name: c.name,
        company: c.company,
        email: c.email,
        phone: c.phone,
        type: c.type,
        source: c.source,
        createdAt: c.createdAt,
        orders: sql<number>`(select count(*) from orders o where o.customer_id = "customers"."id")::int`,
        billed: sql<number>`coalesce((select sum(i.total) from invoices i where i.customer_id = "customers"."id" and i.status = 'issued'), 0)::int`,
      })
      .from(c)
      .where(where)
      .orderBy(desc(c.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
  ]);
  const pages = Math.max(1, Math.ceil(n / PAGE_SIZE));
  const canWrite = can(user.role, "customers.write");
  const href = (pg: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (sp.type) u.set("type", sp.type);
    if (sp.source) u.set("source", sp.source);
    if (pg > 1) u.set("page", String(pg));
    return `/admin/clients${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <Flash code={sp.ok} />
      <PageHeader
        eyebrow="Ventes"
        title="Clients"
        subtitle={`${num(n)} client${n > 1 ? "s" : ""} · les clients du site sont créés automatiquement à chaque commande`}
        actions={
          canWrite && (
            <LinkBtn href="/admin/clients/nouveau">
              <PlusIcon className="size-4" />
              Nouveau client
            </LinkBtn>
          )
        }
      />
      <Panel flush>
        <FilterBar action="/admin/clients">
          <input name="q" defaultValue={q} placeholder="Nom, société, téléphone, e-mail…" className={`${inputClass} w-72`} aria-label="Rechercher" />
          <select name="type" defaultValue={sp.type ?? ""} className={`${selectClass} w-40`} aria-label="Type">
            <option value="">Tous les types</option>
            <option value="individual">Particuliers</option>
            <option value="company">Sociétés</option>
          </select>
          <select name="source" defaultValue={sp.source ?? ""} className={`${selectClass} w-44`} aria-label="Origine">
            <option value="">Toutes origines</option>
            <option value="site">Depuis le site</option>
            <option value="admin">Créés à la main</option>
          </select>
        </FilterBar>
        {rows.length === 0 ? (
          <Empty icon={<UsersIcon className="size-6" />} title="Aucun client" text={q ? "Aucun résultat pour cette recherche." : "Les clients apparaissent ici dès la première commande ou création."} action={canWrite ? <LinkBtn href="/admin/clients/nouveau">Nouveau client</LinkBtn> : undefined} />
        ) : (
          <DataTable head={["Client", "Contact", "Type", { label: "Commandes", right: true }, { label: "Facturé", right: true }, "Depuis", { label: "", right: true }]} className="mt-5">
            {rows.map((r) => (
              <tr key={r.id}>
                <Td>
                  <Link href={`/admin/clients/${r.id}`} className="font-semibold hover:underline">
                    {r.name}
                  </Link>
                  {r.company && <p className="text-xs text-muted">{r.company}</p>}
                </Td>
                <Td>
                  <p>{r.phone ?? "—"}</p>
                  {r.email && <p className="text-xs text-muted">{r.email}</p>}
                </Td>
                <Td>
                  <Badge tone={r.type === "company" ? "blue" : "neutral"}>{customerTypes[r.type as keyof typeof customerTypes] ?? r.type}</Badge>
                  {r.source === "site" && (
                    <span className="ml-1.5">
                      <Badge tone="lime">Site</Badge>
                    </span>
                  )}
                </Td>
                <Td right>{r.orders}</Td>
                <Td right>{r.billed ? ar(r.billed) : <span className="text-muted">—</span>}</Td>
                <Td className="whitespace-nowrap text-muted">{fmtDate(r.createdAt)}</Td>
                <Td right>
                  {canWrite && (
                    <Link href={`/admin/clients/${r.id}/modifier`} aria-label={`Modifier ${r.name}`} className="inline-grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink">
                      <EditIcon className="size-[18px]" />
                    </Link>
                  )}
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
        <Pagination page={page} pages={pages} hrefFor={href} />
      </Panel>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
