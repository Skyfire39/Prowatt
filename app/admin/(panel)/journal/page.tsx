import type { Metadata } from "next";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Badge, DataTable, Empty, FilterBar, PageHeader, Pagination, Panel, Td, inputClass, selectClass } from "@/components/admin/ui";
import { HistoryIcon } from "@/components/admin/icons";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { fmtDateTime, num } from "@/lib/format";

export const metadata: Metadata = { title: "Journal d'activité" };
const PAGE_SIZE = 30;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ q?: string; entity?: string; page?: string }> }) {
  await requireUser("audit.read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim();
  const a = schema.auditLog;
  const db = await getDb();
  const where = and(q ? or(ilike(a.userName, `%${q}%`), ilike(a.action, `%${q}%`), ilike(a.detail, `%${q}%`)) : undefined, sp.entity ? eq(a.entity, sp.entity) : undefined);

  const [[{ n }], rows, entities] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(a).where(where),
    db.select().from(a).where(where).orderBy(desc(a.createdAt), desc(a.id)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.selectDistinct({ entity: a.entity }).from(a).orderBy(a.entity),
  ]);
  const pages = Math.max(1, Math.ceil(n / PAGE_SIZE));
  const href = (pg: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (sp.entity) u.set("entity", sp.entity);
    if (pg > 1) u.set("page", String(pg));
    return `/admin/journal${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <PageHeader eyebrow="Système" title="Journal d'activité" subtitle={`${num(n)} action${n > 1 ? "s" : ""} enregistrée${n > 1 ? "s" : ""} : qui a fait quoi, et quand.`} />
      <Panel flush>
        <FilterBar action="/admin/journal">
          <input name="q" defaultValue={q} placeholder="Utilisateur, action, détail…" className={`${inputClass} w-64`} aria-label="Rechercher" />
          <select name="entity" defaultValue={sp.entity ?? ""} className={`${selectClass} w-48`} aria-label="Objet">
            <option value="">Tous les objets</option>
            {entities.map((e) => (
              <option key={e.entity} value={e.entity}>
                {e.entity}
              </option>
            ))}
          </select>
        </FilterBar>
        {rows.length === 0 ? (
          <Empty icon={<HistoryIcon className="size-6" />} title="Aucune activité" />
        ) : (
          <DataTable head={["Date", "Utilisateur", "Action", "Objet", "Détail"]} className="mt-5">
            {rows.map((r) => (
              <tr key={r.id}>
                <Td className="whitespace-nowrap text-muted">{fmtDateTime(r.createdAt)}</Td>
                <Td className="font-medium">{r.userName}</Td>
                <Td>{r.action}</Td>
                <Td>
                  <Badge tone="neutral">{r.entity}</Badge>
                </Td>
                <Td className="max-w-72 truncate text-muted">{r.detail ?? "—"}</Td>
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
