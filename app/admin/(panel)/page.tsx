import type { Metadata } from "next";
import Link from "next/link";
import { RevenueChart } from "@/components/admin/charts";
import { ClockAlertIcon, HandshakeIcon, TrendIcon, WalletIcon } from "@/components/admin/icons";
import { Badge, DataTable, Empty, Flash, LinkBtn, PageHeader, Panel, Stat, Td } from "@/components/admin/ui";
import { BagIcon, PlusIcon } from "@/components/icons";
import { getDashboard } from "@/lib/admin/queries";
import { invoiceState, invoiceStates, orderStatuses, quoteStatuses, type OrderStatus, type QuoteStatus } from "@/lib/admin/status";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { ar, fmtDate, fmtDateTime, today } from "@/lib/format";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser("dashboard.view");
  const { denied } = await searchParams;
  const d = await getDashboard();
  const r = user.role;
  const t = today();

  const showFinance = can(r, "invoices.read");
  const showOrders = can(r, "orders.read");
  const showQuotes = can(r, "quotes.read");
  const growth = d.lastMonth > 0 ? Math.round(((d.thisMonth - d.lastMonth) / d.lastMonth) * 100) : null;
  const first = user.name.split(/\s+/)[0];
  const dateLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Indian/Antananarivo" }).format(new Date());

  return (
    <>
      <Flash denied={!!denied} />
      <PageHeader
        eyebrow="Tableau de bord"
        title={`Bonjour ${first}`}
        subtitle={<span className="capitalize">{dateLabel}</span>}
        actions={
          <>
            {can(r, "quotes.write") && (
              <LinkBtn href="/admin/devis/nouveau" variant="primary">
                <PlusIcon className="size-4" />
                Nouveau devis
              </LinkBtn>
            )}
            {can(r, "invoices.write") && (
              <LinkBtn href="/admin/factures/nouvelle" variant="soft">
                <PlusIcon className="size-4" />
                Nouvelle facture
              </LinkBtn>
            )}
            {can(r, "products.write") && (
              <LinkBtn href="/admin/produits/nouveau" variant="soft">
                <PlusIcon className="size-4" />
                Produit
              </LinkBtn>
            )}
          </>
        }
      />

      {(showFinance || showOrders || showQuotes) && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {showFinance && (
            <>
              <Stat
                tone="teal"
                label="Encaissé ce mois"
                value={ar(d.thisMonth)}
                icon={<TrendIcon className="size-5" />}
                hint={growth === null ? "Premier mois d'activité" : `${growth >= 0 ? "+" : ""}${growth} % vs mois précédent`}
              />
              <Stat
                label="À encaisser"
                value={ar(d.outstanding)}
                icon={<WalletIcon className="size-5" />}
                hint={d.overdueCount > 0 ? `${d.overdueCount} en retard · ${ar(d.overdueAmount)}` : "Aucun retard de paiement"}
              />
            </>
          )}
          {showOrders && (
            <Stat
              label="Commandes à traiter"
              value={d.ordersNew.n}
              icon={<BagIcon className="size-5" />}
              hint={d.ordersNew.n > 0 ? `${ar(d.ordersNew.sum)} en attente` : "Tout est à jour"}
            />
          )}
          {showQuotes && (
            <Stat
              label="Devis en attente"
              value={d.quotesOpen.n}
              icon={<HandshakeIcon className="size-5" />}
              hint={d.quotesOpen.n > 0 ? `${ar(d.quotesOpen.sum)} proposés` : "Aucun devis envoyé en attente"}
            />
          )}
        </div>
      )}

      {showFinance && (
        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <Panel title="Encaissements" subtitle="Six derniers mois, tous modes de paiement" className="xl:col-span-2">
            <RevenueChart months={d.months} />
          </Panel>
          <Panel title="Produits les plus vendus" subtitle="90 derniers jours">
            {d.topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Les ventes apparaîtront ici dès les premières commandes.</p>
            ) : (
              <ol className="grid gap-3">
                {d.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-accent">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className="text-sm font-semibold tabular-nums text-muted">{p.qty} u.</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {showOrders && (
          <Panel
            title="Dernières commandes"
            flush
            actions={
              <Link href="/admin/commandes" className="text-sm font-semibold text-accent hover:underline">
                Tout voir
              </Link>
            }
          >
            {d.recentOrders.length === 0 ? (
              <Empty icon={<BagIcon className="size-6" />} title="Aucune commande" text="Les commandes passées sur le site apparaîtront ici." />
            ) : (
              <DataTable head={["Référence", "Client", "Statut", { label: "Total", right: true }]}>
                {d.recentOrders.map((o) => {
                  const st = orderStatuses[o.status as OrderStatus] ?? orderStatuses.new;
                  return (
                    <tr key={o.id}>
                      <Td>
                        <Link href={`/admin/commandes/${o.id}`} className="font-semibold hover:underline">
                          {o.ref}
                        </Link>
                        <p className="text-xs text-muted">{fmtDateTime(o.createdAt)}</p>
                      </Td>
                      <Td>{o.customerName}</Td>
                      <Td>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </Td>
                      <Td right>{ar(o.total)}</Td>
                    </tr>
                  );
                })}
              </DataTable>
            )}
          </Panel>
        )}

        {showFinance && (
          <Panel
            title="Factures à encaisser"
            flush
            actions={
              <Link href="/admin/factures" className="text-sm font-semibold text-accent hover:underline">
                Tout voir
              </Link>
            }
          >
            {d.dueInvoices.length === 0 ? (
              <Empty icon={<ClockAlertIcon className="size-6" />} title="Rien à encaisser" text="Aucune facture émise en attente de paiement." />
            ) : (
              <DataTable head={["Facture", "Client", "Échéance", { label: "Reste dû", right: true }]}>
                {d.dueInvoices.map((i) => {
                  const state = invoiceState({ status: "issued", total: i.total, dueAt: i.dueAt }, i.paid, t);
                  return (
                    <tr key={i.id}>
                      <Td>
                        <Link href={`/admin/factures/${i.id}`} className="font-semibold hover:underline">
                          {i.number}
                        </Link>
                      </Td>
                      <Td>{i.customer ?? "—"}</Td>
                      <Td>
                        <Badge tone={invoiceStates[state].tone}>{i.dueAt ? fmtDate(i.dueAt) : "Sans échéance"}</Badge>
                      </Td>
                      <Td right>{ar(i.total - i.paid)}</Td>
                    </tr>
                  );
                })}
              </DataTable>
            )}
          </Panel>
        )}

        {showQuotes && (
          <Panel
            title="Devis récents"
            flush
            actions={
              <Link href="/admin/devis" className="text-sm font-semibold text-accent hover:underline">
                Tout voir
              </Link>
            }
          >
            {d.recentQuotes.length === 0 ? (
              <Empty icon={<HandshakeIcon className="size-6" />} title="Aucun devis" text="Créez votre premier devis personnalisé." action={can(r, "quotes.write") ? <LinkBtn href="/admin/devis/nouveau">Nouveau devis</LinkBtn> : undefined} />
            ) : (
              <DataTable head={["Devis", "Client", "Statut", { label: "Total", right: true }]}>
                {d.recentQuotes.map((q) => {
                  const st = quoteStatuses[q.status as QuoteStatus] ?? quoteStatuses.draft;
                  return (
                    <tr key={q.id}>
                      <Td>
                        <Link href={`/admin/devis/${q.id}`} className="font-semibold hover:underline">
                          {q.number}
                        </Link>
                      </Td>
                      <Td>{q.customer ?? "—"}</Td>
                      <Td>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </Td>
                      <Td right>{ar(q.total)}</Td>
                    </tr>
                  );
                })}
              </DataTable>
            )}
          </Panel>
        )}

        {can(r, "audit.read") && (
          <Panel title="Activité récente" subtitle="Dernières actions de l'équipe">
            {d.activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Aucune activité pour le moment.</p>
            ) : (
              <ul className="grid gap-3.5">
                {d.activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p>
                        <strong className="font-semibold">{a.userName}</strong> · {a.action} · {a.entity}
                      </p>
                      {a.detail && <p className="truncate text-muted">{a.detail}</p>}
                    </div>
                    <time className="shrink-0 text-xs text-muted">{fmtDateTime(a.createdAt)}</time>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
