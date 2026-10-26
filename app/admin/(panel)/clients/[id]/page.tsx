import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditIcon } from "@/components/admin/icons";
import { Badge, DataTable, Empty, Flash, LinkBtn, PageHeader, Panel, Stat, Td } from "@/components/admin/ui";
import { MailIcon, PhoneIcon, WhatsAppIcon, BagIcon, PlusIcon } from "@/components/icons";
import { invoiceState, invoiceStates, orderStatuses, quoteStatuses, customerTypes, type OrderStatus, type QuoteStatus } from "@/lib/admin/status";
import { paidSql } from "@/lib/admin/queries";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { ar, fmtDate, today } from "@/lib/format";
import { isUuid } from "@/lib/validate";

export const metadata: Metadata = { title: "Fiche client" };

export default async function CustomerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser("customers.read");
  const { id } = await params;
  const { ok } = await searchParams;
  if (!isUuid(id)) notFound();
  const db = await getDb();
  const [c] = await db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
  if (!c) notFound();

  const [orders, quotes, invoices] = await Promise.all([
    db.select().from(schema.orders).where(eq(schema.orders.customerId, id)).orderBy(desc(schema.orders.createdAt)).limit(20),
    db.select().from(schema.quotes).where(eq(schema.quotes.customerId, id)).orderBy(desc(schema.quotes.createdAt)).limit(20),
    db
      .select({ id: schema.invoices.id, number: schema.invoices.number, status: schema.invoices.status, total: schema.invoices.total, dueAt: schema.invoices.dueAt, issuedAt: schema.invoices.issuedAt, paid: paidSql })
      .from(schema.invoices)
      .where(eq(schema.invoices.customerId, id))
      .orderBy(desc(schema.invoices.createdAt))
      .limit(20),
  ]);
  const t = today();
  const issued = invoices.filter((i) => i.status === "issued");
  const billed = issued.reduce((s, i) => s + i.total, 0);
  const paid = issued.reduce((s, i) => s + Math.min(i.paid, i.total), 0);
  const wa = c.phone ? `https://wa.me/${c.phone.replace(/\D/g, "").replace(/^0/, "261")}` : null;
  const canInvoice = can(user.role, "invoices.write");
  const canQuote = can(user.role, "quotes.write");

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow={customerTypes[c.type as keyof typeof customerTypes] ?? "Client"}
        title={c.name}
        subtitle={c.company ?? undefined}
        back={{ href: "/admin/clients", label: "Tous les clients" }}
        actions={
          <>
            {canQuote && (
              <LinkBtn href={`/admin/devis/nouveau?client=${c.id}`}>
                <PlusIcon className="size-4" />
                Devis
              </LinkBtn>
            )}
            {canInvoice && (
              <LinkBtn href={`/admin/factures/nouvelle?client=${c.id}`} variant="soft">
                <PlusIcon className="size-4" />
                Facture
              </LinkBtn>
            )}
            {can(user.role, "customers.write") && (
              <LinkBtn href={`/admin/clients/${c.id}/modifier`} variant="soft">
                <EditIcon className="size-4" />
                Modifier
              </LinkBtn>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Commandes" value={orders.length} icon={<BagIcon className="size-5" />} hint="Passées sur le site ou saisies" />
        <Stat label="Facturé" value={ar(billed)} icon={<BagIcon className="size-5" />} tone="teal" hint={`${issued.length} facture${issued.length > 1 ? "s" : ""} émise${issued.length > 1 ? "s" : ""}`} />
        <Stat label="Reste à payer" value={ar(Math.max(0, billed - paid))} icon={<BagIcon className="size-5" />} hint={billed - paid > 0 ? "À encaisser" : "Compte à jour"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:order-2">
          <Panel title="Coordonnées">
            <dl className="grid gap-3.5 text-sm">
              {c.phone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="size-4 shrink-0 text-muted" />
                  <a href={`tel:${c.phone}`} className="font-medium hover:underline">
                    {c.phone}
                  </a>
                </div>
              )}
              {c.email && (
                <div className="flex items-center gap-3">
                  <MailIcon className="size-4 shrink-0 text-muted" />
                  <a href={`mailto:${c.email}`} className="break-all font-medium hover:underline">
                    {c.email}
                  </a>
                </div>
              )}
              {wa && (
                <div className="flex items-center gap-3">
                  <WhatsAppIcon className="size-4 shrink-0 text-muted" />
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                    Écrire sur WhatsApp
                  </a>
                </div>
              )}
              {(c.address || c.city) && <p className="text-muted">{[c.address, c.city].filter(Boolean).join(", ")}</p>}
              {(c.nif || c.stat) && (
                <p className="text-xs text-muted">
                  {c.nif && <>NIF {c.nif} </>}
                  {c.stat && <>· STAT {c.stat}</>}
                </p>
              )}
              <p className="text-xs text-muted">Client depuis le {fmtDate(c.createdAt)}</p>
            </dl>
          </Panel>
          {c.notes && (
            <Panel title="Notes internes">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.notes}</p>
            </Panel>
          )}
        </div>

        <div className="grid content-start gap-6 lg:order-1 lg:col-span-2">
          <Panel title="Factures" flush>
            {invoices.length === 0 ? (
              <Empty icon={<BagIcon className="size-6" />} title="Aucune facture" />
            ) : (
              <DataTable head={["Numéro", "Date", "État", { label: "Total", right: true }]}>
                {invoices.map((i) => {
                  const st = invoiceStates[invoiceState({ status: i.status, total: i.total, dueAt: i.dueAt }, i.paid, t)];
                  return (
                    <tr key={i.id}>
                      <Td>
                        <Link href={`/admin/factures/${i.id}`} className="font-semibold hover:underline">
                          {i.number}
                        </Link>
                      </Td>
                      <Td className="text-muted">{fmtDate(i.issuedAt)}</Td>
                      <Td>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </Td>
                      <Td right>{ar(i.total)}</Td>
                    </tr>
                  );
                })}
              </DataTable>
            )}
          </Panel>
          <Panel title="Devis" flush>
            {quotes.length === 0 ? (
              <Empty icon={<BagIcon className="size-6" />} title="Aucun devis" />
            ) : (
              <DataTable head={["Numéro", "Date", "Statut", { label: "Total", right: true }]}>
                {quotes.map((q) => {
                  const st = quoteStatuses[q.status as QuoteStatus] ?? quoteStatuses.draft;
                  return (
                    <tr key={q.id}>
                      <Td>
                        <Link href={`/admin/devis/${q.id}`} className="font-semibold hover:underline">
                          {q.number}
                        </Link>
                      </Td>
                      <Td className="text-muted">{fmtDate(q.issuedAt)}</Td>
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
          <Panel title="Commandes" flush>
            {orders.length === 0 ? (
              <Empty icon={<BagIcon className="size-6" />} title="Aucune commande" />
            ) : (
              <DataTable head={["Référence", "Date", "Statut", { label: "Total", right: true }]}>
                {orders.map((o) => {
                  const st = orderStatuses[o.status as OrderStatus] ?? orderStatuses.new;
                  return (
                    <tr key={o.id}>
                      <Td>
                        <Link href={`/admin/commandes/${o.id}`} className="font-semibold hover:underline">
                          {o.ref}
                        </Link>
                      </Td>
                      <Td className="text-muted">{fmtDate(o.createdAt)}</Td>
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
        </div>
      </div>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
