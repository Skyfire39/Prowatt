import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/admin/client";
import { Badge, DataTable, Field, Flash, PageHeader, Panel, Td, inputClass, selectClass } from "@/components/admin/ui";
import { InvoiceIcon } from "@/components/admin/icons";
import { MailIcon, PhoneIcon } from "@/components/icons";
import { orderStatuses, orderStatusList, paymentMethods, type OrderStatus } from "@/lib/admin/status";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { ar, fmtDate, fmtDateTime, today } from "@/lib/format";
import { isUuid } from "@/lib/validate";
import { createInvoiceFromOrderAction, recordOrderPaymentAction, updateOrderStatusAction } from "../actions";

export const metadata: Metadata = { title: "Commande" };
const payLabel = { paid: "Payée", pending: "En attente", partial: "Partielle", unpaid: "Non payée" } as const;
const payTone = { paid: "teal", pending: "blue", partial: "blue", unpaid: "amber" } as const;

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser("orders.read");
  const { id } = await params;
  const { ok } = await searchParams;
  if (!isUuid(id)) notFound();
  const db = await getDb();
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  if (!o) notFound();

  const [items, pays, customer, invoice] = await Promise.all([
    db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id)).orderBy(asc(schema.orderItems.name)),
    db.select().from(schema.payments).where(eq(schema.payments.orderId, id)).orderBy(desc(schema.payments.createdAt)),
    o.customerId ? db.select().from(schema.customers).where(eq(schema.customers.id, o.customerId)).limit(1).then((r) => r[0]) : Promise.resolve(undefined),
    o.invoiceId ? db.select({ id: schema.invoices.id, number: schema.invoices.number, status: schema.invoices.status }).from(schema.invoices).where(eq(schema.invoices.id, o.invoiceId)).limit(1).then((r) => r[0]) : Promise.resolve(undefined),
  ]);

  const st = orderStatuses[o.status as OrderStatus] ?? orderStatuses.new;
  const pay = (o.paymentStatus in payLabel ? o.paymentStatus : "unpaid") as keyof typeof payLabel;
  const paid = pays.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, o.total - paid);
  const canWrite = can(user.role, "orders.write");
  const methodKey = o.paymentMethod === "bank" ? "virement" : o.paymentMethod === "card" ? "carte" : o.paymentMethod;

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow={`Commande · ${fmtDateTime(o.createdAt)}`}
        title={o.ref}
        back={{ href: "/admin/commandes", label: "Toutes les commandes" }}
        actions={
          <>
            <Badge tone={st.tone}>{st.label}</Badge>
            <Badge tone={payTone[pay]}>{payLabel[pay]}</Badge>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Panel title="Articles commandés" flush>
            <DataTable head={["Désignation", { label: "Prix unitaire", right: true }, { label: "Qté", right: true }, { label: "Total", right: true }]}>
              {items.map((i) => (
                <tr key={i.id}>
                  <Td className="font-medium">{i.name}</Td>
                  <Td right>{ar(i.unitPrice)}</Td>
                  <Td right>{i.qty}</Td>
                  <Td right className="font-semibold">
                    {ar(i.unitPrice * i.qty)}
                  </Td>
                </tr>
              ))}
            </DataTable>
            <div className="flex items-baseline justify-between border-t border-line px-7 py-5">
              <span className="text-muted">Total de la commande (hors livraison)</span>
              <span className="text-3xl font-semibold tabular-nums tracking-tight">{ar(o.total)}</span>
            </div>
          </Panel>

          <Panel title="Réception">
            <p className="font-medium">{o.mode === "ship" ? "Livraison" : "Retrait en magasin"}</p>
            {o.mode === "ship" && (
              <p className="mt-1 text-muted">
                {o.address}, {o.city}
              </p>
            )}
            {o.note && (
              <div className="mt-4 rounded-2xl bg-accent-soft/70 px-4 py-3 text-sm">
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-muted">Précisions du client</p>
                {o.note}
              </div>
            )}
          </Panel>

          <Panel title="Paiements reçus" subtitle={`${ar(paid)} reçus sur ${ar(o.total)}`} flush>
            {pays.length === 0 ? (
              <p className="px-7 pb-6 text-sm text-muted">
                Aucun paiement enregistré. Mode choisi par le client : <strong>{paymentMethods[methodKey as keyof typeof paymentMethods] ?? o.paymentMethod}</strong>.
                {o.paymentTx && <> Transaction MVola en cours : {o.paymentTx}.</>}
              </p>
            ) : (
              <DataTable head={["Date", "Mode", "Référence", { label: "Montant", right: true }]}>
                {pays.map((p) => (
                  <tr key={p.id}>
                    <Td className="whitespace-nowrap">{fmtDate(p.paidAt)}</Td>
                    <Td>{paymentMethods[p.method as keyof typeof paymentMethods] ?? p.method}</Td>
                    <Td className="max-w-48 truncate text-muted">{p.reference ?? p.note ?? "—"}</Td>
                    <Td right className="font-semibold">
                      {ar(p.amount)}
                    </Td>
                  </tr>
                ))}
              </DataTable>
            )}
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Client">
            <p className="text-lg font-semibold">{customer ? <Link href={`/admin/clients/${customer.id}`} className="hover:underline">{o.customerName}</Link> : o.customerName}</p>
            <div className="mt-3 grid gap-2 text-sm">
              <a href={`tel:${o.customerPhone}`} className="flex items-center gap-2.5 font-medium hover:underline">
                <PhoneIcon className="size-4 text-muted" />
                {o.customerPhone}
              </a>
              {o.customerEmail && (
                <a href={`mailto:${o.customerEmail}`} className="flex items-center gap-2.5 break-all font-medium hover:underline">
                  <MailIcon className="size-4 text-muted" />
                  {o.customerEmail}
                </a>
              )}
            </div>
          </Panel>

          {canWrite && (
            <Panel title="Statut">
              <form action={updateOrderStatusAction} className="grid gap-3">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className={selectClass} aria-label="Statut de la commande">
                  {orderStatusList.map((s) => (
                    <option key={s} value={s}>
                      {orderStatuses[s].label}
                    </option>
                  ))}
                </select>
                <SubmitButton variant="primary" pendingLabel="Mise à jour…">
                  Mettre à jour
                </SubmitButton>
              </form>
            </Panel>
          )}

          <Panel title="Facture">
            {invoice ? (
              <div className="grid gap-3">
                <p className="text-sm text-muted">Une facture a été créée pour cette commande.</p>
                <Link href={`/admin/factures/${invoice.id}`} className="inline-flex items-center gap-2 font-semibold text-accent hover:underline">
                  <InvoiceIcon className="size-4" />
                  {invoice.status === "draft" ? "Brouillon de facture" : invoice.number}
                </Link>
              </div>
            ) : can(user.role, "invoices.write") ? (
              <form action={createInvoiceFromOrderAction} className="grid gap-3">
                <input type="hidden" name="id" value={o.id} />
                <p className="text-sm text-muted">Génère un brouillon avec les mêmes lignes et prix (TVA incluse). Vous pourrez le relire avant de l&apos;émettre.</p>
                <SubmitButton variant="lime" pendingLabel="Création…">
                  <InvoiceIcon className="size-4" />
                  Créer la facture
                </SubmitButton>
              </form>
            ) : (
              <p className="text-sm text-muted">Pas encore de facture.</p>
            )}
          </Panel>

          {can(user.role, "payments.write") && remaining > 0 && (
            <Panel title="Enregistrer un paiement" subtitle={`Reste à payer : ${ar(remaining)}`}>
              <form action={recordOrderPaymentAction} className="grid gap-4">
                <input type="hidden" name="id" value={o.id} />
                <Field label="Mode de paiement">
                  <select name="method" defaultValue={methodKey in paymentMethods ? methodKey : "mvola"} className={selectClass}>
                    {Object.entries(paymentMethods).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Montant (Ar)">
                  <input name="amount" inputMode="numeric" defaultValue={remaining} required className={inputClass} />
                </Field>
                <Field label="Date">
                  <input name="paidAt" type="date" defaultValue={today()} className={inputClass} />
                </Field>
                <Field label="Référence" hint="N° de transaction, de virement, de chèque…">
                  <input name="reference" className={inputClass} />
                </Field>
                <SubmitButton pendingLabel="Enregistrement…">Enregistrer le paiement</SubmitButton>
              </form>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
