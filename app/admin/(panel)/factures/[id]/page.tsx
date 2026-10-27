import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton, SubmitButton } from "@/components/admin/client";
import { DocumentSheet } from "@/components/admin/document-sheet";
import { EditIcon, PrinterIcon } from "@/components/admin/icons";
import { Badge, Field, Flash, LinkBtn, PageHeader, Panel, inputClass, selectClass } from "@/components/admin/ui";
import { CheckIcon, MailIcon, TrashIcon, WhatsAppIcon, CloseIcon } from "@/components/icons";
import { loadInvoice } from "@/lib/admin/load";
import { invoiceStamp } from "@/lib/admin/stamps";
import { invoiceStates, paymentMethods } from "@/lib/admin/status";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/content";
import { ar, fmtDate, today } from "@/lib/format";
import { cancelInvoiceAction, deleteInvoiceAction, deletePaymentAction, issueInvoiceAction, recordInvoicePaymentAction } from "../actions";

export const metadata: Metadata = { title: "Facture" };

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser("invoices.read");
  const { id } = await params;
  const { ok } = await searchParams;
  const [loaded, settings] = await Promise.all([loadInvoice(id), getSettings()]);
  if (!loaded) notFound();
  const { invoice, items, customer, payments, totals, state } = loaded;

  const st = invoiceStates[state];
  const isDraft = invoice.status === "draft";
  const isIssued = invoice.status === "issued";
  const canWrite = can(user.role, "invoices.write");
  const canPay = can(user.role, "payments.write");
  const rest = Math.max(0, invoice.total - invoice.paid);
  const pct = invoice.total > 0 ? Math.min(100, Math.round((invoice.paid / invoice.total) * 100)) : 100;
  const number = isDraft ? "Brouillon" : invoice.number;

  const subject = `Facture ${invoice.number} — ${settings.company.name}`;
  const body = `Bonjour${customer ? ` ${customer.name}` : ""},\n\nVeuillez trouver notre facture ${invoice.number} d'un montant de ${ar(invoice.total)}${invoice.dueAt ? `, à régler avant le ${fmtDate(invoice.dueAt)}` : ""}.\n\nMerci pour votre confiance.\n${settings.company.name} · ${settings.company.phone}`;
  const mail = customer?.email ? `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : null;
  const wa = customer?.phone ? `https://wa.me/${customer.phone.replace(/\D/g, "").replace(/^0/, "261")}?text=${encodeURIComponent(body)}` : null;

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow="Facture"
        title={number}
        subtitle={invoice.title ?? undefined}
        back={{ href: "/admin/factures", label: "Toutes les factures" }}
        actions={
          <>
            <Badge tone={st.tone}>{st.label}</Badge>
            <LinkBtn href={`/admin/factures/${id}/imprimer`} target="_blank" variant="soft">
              <PrinterIcon className="size-4" />
              Imprimer / PDF
            </LinkBtn>
            {canWrite && isDraft && (
              <LinkBtn href={`/admin/factures/${id}/modifier`} variant="primary">
                <EditIcon className="size-4" />
                Modifier
              </LinkBtn>
            )}
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 overflow-x-auto rounded-3xl bg-white/30 p-3 sm:p-6">
          <DocumentSheet
            kind="invoice"
            number={number}
            stamp={invoiceStamp(state)}
            title={invoice.title}
            issuedAt={invoice.issuedAt}
            endDate={invoice.dueAt}
            settings={settings}
            customer={customer}
            items={items}
            discount={invoice.discount}
            vatRate={Number(invoice.vatRate)}
            vatIncluded={invoice.vatIncluded}
            totals={totals}
            notes={invoice.notes}
            paid={invoice.paid}
            payments={payments.map((p) => ({ paidAt: p.paidAt, method: paymentMethods[p.method as keyof typeof paymentMethods] ?? p.method, amount: p.amount }))}
          />
        </div>

        <aside className="grid content-start gap-6">
          <Panel title="Règlement">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold tabular-nums tracking-tight">{ar(invoice.paid)}</span>
              <span className="text-sm text-muted">sur {ar(invoice.total)}</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Part réglée">
              <div className="h-full rounded-full bg-gradient-to-r from-[#2f7d6e] to-[#175c55] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted">
              {isDraft ? "Brouillon : pas encore émise." : state === "cancelled" ? "Facture annulée." : rest > 0 ? `${ar(rest)} restent à payer${invoice.dueAt && invoice.dueAt < today() ? " — échéance dépassée." : "."}` : "Facture entièrement réglée."}
            </p>

            {payments.length > 0 && (
              <ul className="mt-4 grid gap-2 border-t border-line pt-4 text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{ar(p.amount)}</p>
                      <p className="truncate text-xs text-muted">
                        {fmtDate(p.paidAt)} · {paymentMethods[p.method as keyof typeof paymentMethods] ?? p.method}
                        {p.reference ? ` · ${p.reference}` : ""}
                      </p>
                    </div>
                    {canPay && isIssued && (
                      <form action={deletePaymentAction}>
                        <input type="hidden" name="id" value={invoice.id} />
                        <input type="hidden" name="paymentId" value={p.id} />
                        <ConfirmButton title="Supprimer ce paiement ?" message={`Le paiement de ${ar(p.amount)} sera retiré de la facture.`} confirmLabel="Supprimer" variant="ghost" size="icon">
                          <CloseIcon className="size-4" />
                        </ConfirmButton>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {canPay && isIssued && rest > 0 && (
            <Panel title="Enregistrer un paiement">
              <form action={recordInvoicePaymentAction} className="grid gap-4">
                <input type="hidden" name="id" value={invoice.id} />
                <Field label="Mode de paiement">
                  <select name="method" defaultValue="mvola" className={selectClass}>
                    {Object.entries(paymentMethods).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Montant (Ar)">
                  <input name="amount" inputMode="numeric" defaultValue={rest} required className={inputClass} />
                </Field>
                <Field label="Date">
                  <input name="paidAt" type="date" defaultValue={today()} className={inputClass} />
                </Field>
                <Field label="Référence" hint="N° de transaction, de virement, de chèque…">
                  <input name="reference" className={inputClass} />
                </Field>
                <SubmitButton pendingLabel="Enregistrement…">
                  <CheckIcon className="size-4" />
                  Enregistrer le paiement
                </SubmitButton>
              </form>
            </Panel>
          )}

          <Panel title="Actions">
            <div className="grid gap-2.5">
              {canWrite && isDraft && (
                <form action={issueInvoiceAction}>
                  <input type="hidden" name="id" value={invoice.id} />
                  <SubmitButton variant="lime" className="w-full" pendingLabel="Émission…">
                    Émettre la facture
                  </SubmitButton>
                  {(!invoice.customerId || items.length === 0) && <p className="mt-2 text-xs text-muted">Un client et au moins une ligne sont nécessaires : modifiez le brouillon.</p>}
                </form>
              )}
              {isIssued && mail && (
                <LinkBtn href={mail} variant="soft">
                  <MailIcon className="size-4" />
                  Écrire par e-mail
                </LinkBtn>
              )}
              {isIssued && wa && (
                <LinkBtn href={wa} target="_blank" variant="soft">
                  <WhatsAppIcon className="size-4" />
                  Écrire sur WhatsApp
                </LinkBtn>
              )}
              {canWrite && isIssued && (
                <form action={cancelInvoiceAction}>
                  <input type="hidden" name="id" value={invoice.id} />
                  <ConfirmButton title="Annuler cette facture ?" message={`La facture ${invoice.number} sera marquée annulée. Son numéro est conservé.`} confirmLabel="Annuler la facture" variant="danger" className="w-full">
                    Annuler la facture
                  </ConfirmButton>
                </form>
              )}
              {canWrite && isDraft && (
                <form action={deleteInvoiceAction}>
                  <input type="hidden" name="id" value={invoice.id} />
                  <ConfirmButton title="Supprimer ce brouillon ?" message="Le brouillon sera supprimé définitivement." confirmLabel="Supprimer" className="w-full">
                    <TrashIcon className="size-4" />
                    Supprimer le brouillon
                  </ConfirmButton>
                </form>
              )}
              {customer && (
                <Link href={`/admin/clients/${customer.id}`} className="text-sm font-semibold text-accent hover:underline">
                  Fiche de {customer.name}
                </Link>
              )}
              {invoice.quoteId && (
                <Link href={`/admin/devis/${invoice.quoteId}`} className="text-sm font-semibold text-accent hover:underline">
                  Devis d&apos;origine
                </Link>
              )}
              {invoice.orderId && (
                <Link href={`/admin/commandes/${invoice.orderId}`} className="text-sm font-semibold text-accent hover:underline">
                  Commande d&apos;origine
                </Link>
              )}
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
