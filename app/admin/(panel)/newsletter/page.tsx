import type { Metadata } from "next";
import { and, desc, eq, ilike, isNotNull, isNull, sql } from "drizzle-orm";
import { ConnectionTest, ExportLink, ImportForm, RowActions, SyncAll } from "@/components/admin/newsletter-tools";
import { Badge, DataTable, Empty, FilterBar, Flash, PageHeader, Pagination, Panel, Stat, Td, inputClass, selectClass, type Tone } from "@/components/admin/ui";
import { MailIcon, CheckIcon, ClockIcon, UsersIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { fmtDate, num } from "@/lib/format";
import { mailchimpConfig } from "@/lib/mailchimp";
import { pendingSync } from "@/lib/newsletter";

export const metadata: Metadata = { title: "Newsletter" };
const PAGE_SIZE = 20;
type SP = { q?: string; status?: string; source?: string; sync?: string; page?: string; ok?: string };

const sourceLabels: Record<string, string> = { site: "Site", admin: "À la main", import: "Import" };
const mcStatus: Record<string, { tone: Tone; label: string }> = {
  subscribed: { tone: "teal", label: "Inscrit" },
  pending: { tone: "amber", label: "À confirmer" },
  unsubscribed: { tone: "neutral", label: "Désabonné chez Mailchimp" },
  cleaned: { tone: "red", label: "Adresse invalide" },
  archived: { tone: "neutral", label: "Archivé" },
};

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("newsletter.manage");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim();
  const t = schema.subscribers;
  const db = await getDb();
  const cfg = mailchimpConfig();

  const where = and(
    q ? ilike(t.email, `%${q}%`) : undefined,
    sp.status === "subscribed" || sp.status === "unsubscribed" ? eq(t.status, sp.status) : undefined,
    sp.source === "site" || sp.source === "admin" || sp.source === "import" ? eq(t.source, sp.source) : undefined,
    sp.sync === "todo" ? pendingSync() : sp.sync === "ok" ? and(isNotNull(t.mailchimpSyncedAt), isNull(t.mailchimpError)) : undefined,
  );

  const count = (w?: ReturnType<typeof and>) => db.select({ n: sql<number>`count(*)::int` }).from(t).where(w).then(([r]) => r.n);
  const [filtered, total, active, unsub, synced, pending, rows] = await Promise.all([
    count(where),
    count(),
    count(eq(t.status, "subscribed")),
    count(eq(t.status, "unsubscribed")),
    count(and(eq(t.status, "subscribed"), isNotNull(t.mailchimpSyncedAt), isNull(t.mailchimpError))),
    count(pendingSync()),
    db.select().from(t).where(where).orderBy(desc(t.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
  ]);
  const pages = Math.max(1, Math.ceil(filtered / PAGE_SIZE));

  const query = (extra: Record<string, string> = {}) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (sp.status) u.set("status", sp.status);
    if (sp.source) u.set("source", sp.source);
    for (const [k, v] of Object.entries(extra)) u.set(k, v);
    return u;
  };
  const href = (pg: number) => {
    const u = query();
    if (sp.sync) u.set("sync", sp.sync);
    if (pg > 1) u.set("page", String(pg));
    return `/admin/newsletter${u.size ? `?${u}` : ""}`;
  };

  return (
    <>
      <Flash code={sp.ok} />
      <PageHeader
        eyebrow="Site"
        title="Newsletter"
        subtitle="Chaque inscription du site est sauvegardée ici, puis envoyée à Mailchimp. Vous pouvez aussi exporter la liste en CSV."
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportLink href={`/admin/newsletter/export?${query()}`} variant="primary">
              Exporter en CSV
            </ExportLink>
            <ExportLink href={`/admin/newsletter/export?${query({ sep: ";" })}`}>CSV pour Excel (;)</ExportLink>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Abonnés actifs" value={num(active)} hint={`${num(total)} adresse${total > 1 ? "s" : ""} au total`} icon={<UsersIcon className="size-5" />} tone="teal" />
        <Stat label="Dans Mailchimp" value={num(synced)} hint="envoyés sans erreur" icon={<CheckIcon className="size-5" />} />
        <Stat label="À envoyer" value={num(pending)} hint={pending > 0 ? "jamais envoyés ou en échec" : "rien en attente"} icon={<ClockIcon className="size-5" />} />
        <Stat label="Désabonnés" value={num(unsub)} hint="exclus des envois" icon={<MailIcon className="size-5" />} />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
        <Panel title="Connexion Mailchimp" subtitle={cfg ? "Les nouvelles inscriptions partent automatiquement vers votre audience." : "Pas encore reliée : les inscriptions sont sauvegardées ici en attendant."}>
          {cfg ? (
            <div className="grid gap-5">
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Audience</dt>
                  <dd className="font-medium">••••{cfg.audienceId.slice(-4)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Confirmation par e-mail (double opt-in)</dt>
                  <dd>
                    <Badge tone={cfg.doubleOptIn ? "teal" : "neutral"}>{cfg.doubleOptIn ? "Activée" : "Désactivée"}</Badge>
                  </dd>
                </div>
              </dl>
              <ConnectionTest />
              <SyncAll pendingCount={pending} />
            </div>
          ) : (
            <div className="grid gap-3 text-sm leading-relaxed">
              <p>Ajoutez ces deux variables dans <code className="rounded bg-ink/5 px-1">.env.local</code> (et dans les variables de votre hébergeur), puis redémarrez le site :</p>
              <pre className="overflow-x-auto rounded-xl bg-ink/5 p-3 text-[13px]">{`MAILCHIMP_API_KEY=xxxxxxxx-us21\nMAILCHIMP_AUDIENCE_ID=xxxxxxxxxx\n# facultatif : "true" pour l'e-mail de confirmation\nMAILCHIMP_DOUBLE_OPT_IN=true`}</pre>
              <ul className="list-disc space-y-1 pl-5 text-muted">
                <li>Clé API : Mailchimp → Profil → Extras → API keys → Create A Key.</li>
                <li>Identifiant d&apos;audience : Audience → Settings → Audience name and defaults.</li>
              </ul>
            </div>
          )}
        </Panel>

        <Panel title="Ajouter des adresses" subtitle="Pour une personne rencontrée en boutique, ou pour importer une liste existante.">
          <ImportForm />
        </Panel>
      </div>

      <Panel flush className="mt-6">
        <FilterBar action="/admin/newsletter">
          <input name="q" defaultValue={q} placeholder="Rechercher une adresse…" className={`${inputClass} w-64`} aria-label="Rechercher" />
          <select name="status" defaultValue={sp.status ?? ""} className={`${selectClass} w-40`} aria-label="Statut">
            <option value="">Tous les statuts</option>
            <option value="subscribed">Abonnés</option>
            <option value="unsubscribed">Désabonnés</option>
          </select>
          <select name="source" defaultValue={sp.source ?? ""} className={`${selectClass} w-40`} aria-label="Origine">
            <option value="">Toutes origines</option>
            <option value="site">Depuis le site</option>
            <option value="admin">À la main</option>
            <option value="import">Import</option>
          </select>
          <select name="sync" defaultValue={sp.sync ?? ""} className={`${selectClass} w-48`} aria-label="Mailchimp">
            <option value="">Mailchimp : tous</option>
            <option value="todo">À envoyer ou en échec</option>
            <option value="ok">Envoyés</option>
          </select>
        </FilterBar>

        {rows.length === 0 ? (
          <Empty
            icon={<MailIcon className="size-6" />}
            title="Aucune adresse"
            text={q || sp.status || sp.source || sp.sync ? "Aucun résultat avec ces filtres." : "Les inscriptions du site apparaîtront ici dès la première."}
          />
        ) : (
          <DataTable head={["Adresse", "Statut", "Mailchimp", { label: "", right: true }]} className="mt-5">
            {rows.map((r) => {
              const mc = r.mailchimpStatus ? mcStatus[r.mailchimpStatus] : undefined;
              return (
                <tr key={r.id}>
                  <Td>
                    <p className="break-all font-medium">{r.email}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <Badge tone={r.source === "site" ? "lime" : "neutral"}>{sourceLabels[r.source] ?? r.source}</Badge>
                      {fmtDate(r.createdAt)}
                    </p>
                  </Td>
                  <Td>
                    <Badge tone={r.status === "subscribed" ? "teal" : "neutral"}>{r.status === "subscribed" ? "Abonné" : "Désabonné"}</Badge>
                  </Td>
                  <Td>
                    {r.mailchimpError ? (
                      <div className="grid gap-1">
                        <Badge tone="red">Échec</Badge>
                        <span className="max-w-64 text-xs text-red-700">{r.mailchimpError}</span>
                      </div>
                    ) : mc ? (
                      <Badge tone={mc.tone}>{mc.label}</Badge>
                    ) : (
                      <Badge tone="neutral">Non envoyé</Badge>
                    )}
                  </Td>
                  <Td right>
                    <RowActions id={r.id} email={r.email} status={r.status} canSync={cfg !== null} />
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
