import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Badge, DataTable, Empty, FilterBar, Flash, PageHeader, Pagination, Panel, Stat, Td, inputClass, selectClass } from "@/components/admin/ui";
import { MailIcon, PhoneIcon, QuoteIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { fmtDate, num } from "@/lib/format";
import { requestKinds, requestStatusList, requestStatuses, type RequestStatus } from "@/lib/quote-requests";

export const metadata: Metadata = { title: "Demandes de devis" };
const PAGE_SIZE = 15;
type SP = { q?: string; status?: string; kind?: string; page?: string; ok?: string };

export default async function RequestsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("quotes.read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim();
  const t = schema.quoteRequests;
  const db = await getDb();

  const where = and(
    q ? or(ilike(t.name, `%${q}%`), ilike(t.contact, `%${q}%`), ilike(t.phone, `%${q}%`), ilike(t.email, `%${q}%`), ilike(t.city, `%${q}%`), ilike(t.ref, `%${q}%`)) : undefined,
    (requestStatusList as string[]).includes(sp.status ?? "") ? eq(t.status, sp.status as string) : undefined,
    sp.kind === "individual" || sp.kind === "company" ? eq(t.kind, sp.kind) : undefined,
  );

  const count = (w?: ReturnType<typeof and>) => db.select({ n: sql<number>`count(*)::int` }).from(t).where(w).then(([r]) => r.n);
  const [filtered, total, fresh, contacted, quoted, rows] = await Promise.all([
    count(where),
    count(),
    count(eq(t.status, "new")),
    count(eq(t.status, "contacted")),
    count(eq(t.status, "quoted")),
    db.select().from(t).where(where).orderBy(desc(t.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
  ]);
  const pages = Math.max(1, Math.ceil(filtered / PAGE_SIZE));

  const href = (pg: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (sp.status) u.set("status", sp.status);
    if (sp.kind) u.set("kind", sp.kind);
    if (pg > 1) u.set("page", String(pg));
    return `/admin/demandes${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <Flash code={sp.ok} />
      <PageHeader
        eyebrow="Ventes"
        title="Demandes de devis"
        subtitle="Chaque formulaire « Particulier » ou « Société » envoyé depuis le site est sauvegardé ici. Ouvrez une demande pour la suivre ou l'exporter en PDF avec le logo Prowatt."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Nouvelles" value={num(fresh)} hint={fresh > 0 ? "à traiter" : "rien en attente"} icon={<MailIcon className="size-5" />} tone="teal" />
        <Stat label="Contactées" value={num(contacted)} hint="en cours de suivi" icon={<PhoneIcon className="size-5" />} />
        <Stat label="Devis envoyés" value={num(quoted)} hint="réponse donnée" icon={<QuoteIcon className="size-5" />} />
        <Stat label="Au total" value={num(total)} hint="demandes reçues" icon={<QuoteIcon className="size-5" />} />
      </div>

      <Panel flush className="mt-6">
        <FilterBar action="/admin/demandes">
          <input name="q" defaultValue={q} placeholder="Nom, téléphone, ville, référence…" className={`${inputClass} w-72`} aria-label="Rechercher" />
          <select name="status" defaultValue={sp.status ?? ""} className={`${selectClass} w-44`} aria-label="Statut">
            <option value="">Tous les statuts</option>
            {requestStatusList.map((s) => (
              <option key={s} value={s}>
                {requestStatuses[s].label}
              </option>
            ))}
          </select>
          <select name="kind" defaultValue={sp.kind ?? ""} className={`${selectClass} w-40`} aria-label="Type">
            <option value="">Tous les types</option>
            <option value="individual">Particuliers</option>
            <option value="company">Sociétés</option>
          </select>
        </FilterBar>

        {rows.length === 0 ? (
          <Empty
            icon={<QuoteIcon className="size-6" />}
            title="Aucune demande"
            text={q || sp.status || sp.kind ? "Aucun résultat avec ces filtres." : "Les demandes envoyées depuis le site apparaîtront ici dès la première."}
          />
        ) : (
          <DataTable head={["Demande", "Contact", "Objectif", "Statut", { label: "Reçue le", right: true }]} className="mt-5">
            {rows.map((r) => {
              const st = requestStatuses[r.status as RequestStatus] ?? requestStatuses.new;
              return (
                <tr key={r.id}>
                  <Td>
                    <Link href={`/admin/demandes/${r.id}`} className="font-semibold hover:underline">
                      {r.name}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <Badge tone={r.kind === "company" ? "blue" : "lime"}>{requestKinds[r.kind as keyof typeof requestKinds] ?? r.kind}</Badge>
                      <span className="tabular-nums">{r.ref}</span>
                    </p>
                  </Td>
                  <Td>
                    <p className="font-medium">{r.contact || r.phone}</p>
                    <p className="text-xs text-muted">{[r.contact ? r.phone : null, r.city].filter(Boolean).join(" · ") || "—"}</p>
                  </Td>
                  <Td className="max-w-64 text-muted">{r.goal ?? "—"}</Td>
                  <Td>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </Td>
                  <Td right className="whitespace-nowrap text-muted">
                    {fmtDate(r.createdAt)}
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
