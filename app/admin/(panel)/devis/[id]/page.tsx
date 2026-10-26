import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton, SubmitButton } from "@/components/admin/client";
import { DocumentSheet } from "@/components/admin/document-sheet";
import { EditIcon, InvoiceIcon, PrinterIcon } from "@/components/admin/icons";
import { Badge, Flash, LinkBtn, PageHeader, Panel, selectClass } from "@/components/admin/ui";
import { MailIcon, TrashIcon, WhatsAppIcon } from "@/components/icons";
import { loadQuote } from "@/lib/admin/load";
import { quoteStamp } from "@/lib/admin/stamps";
import { quoteStatuses, quoteStatusList, type QuoteStatus } from "@/lib/admin/status";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/content";
import { ar, fmtDate, today } from "@/lib/format";
import { convertQuoteToInvoiceAction, deleteQuoteAction, duplicateQuoteAction, setQuoteStatusAction } from "../actions";

export const metadata: Metadata = { title: "Devis" };

export default async function QuotePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser("quotes.read");
  const { id } = await params;
  const { ok } = await searchParams;
  const [loaded, settings] = await Promise.all([loadQuote(id), getSettings()]);
  if (!loaded) notFound();
  const { quote, items, customer, totals } = loaded;

  const expired = quote.status === "sent" && quote.validUntil && quote.validUntil < today();
  const st = expired ? quoteStatuses.expired : (quoteStatuses[quote.status as QuoteStatus] ?? quoteStatuses.draft);
  const canWrite = can(user.role, "quotes.write");
  const locked = !!quote.invoiceId;

  const subject = `Devis ${quote.number} — ${settings.company.name}`;
  const body = `Bonjour${customer ? ` ${customer.name}` : ""},\n\nVeuillez trouver notre devis ${quote.number}${quote.title ? ` (${quote.title})` : ""} d'un montant de ${ar(quote.total)}${quote.validUntil ? `, valable jusqu'au ${fmtDate(quote.validUntil)}` : ""}.\n\nNous restons à votre disposition.\n${settings.company.name} · ${settings.company.phone}`;
  const mail = customer?.email ? `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : null;
  const wa = customer?.phone ? `https://wa.me/${customer.phone.replace(/\D/g, "").replace(/^0/, "261")}?text=${encodeURIComponent(body)}` : null;

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow="Devis"
        title={quote.number}
        subtitle={quote.title ?? undefined}
        back={{ href: "/admin/devis", label: "Tous les devis" }}
        actions={
          <>
            <Badge tone={st.tone}>{st.label}</Badge>
            <LinkBtn href={`/admin/devis/${id}/imprimer`} target="_blank" variant="soft">
              <PrinterIcon className="size-4" />
              Imprimer / PDF
            </LinkBtn>
            {canWrite && !locked && (
              <LinkBtn href={`/admin/devis/${id}/modifier`} variant="primary">
                <EditIcon className="size-4" />
                Modifier
              </LinkBtn>
            )}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 overflow-x-auto rounded-3xl bg-white/30 p-3 sm:p-6 xl:order-1">
          <DocumentSheet
            kind="quote"
            number={quote.number}
            stamp={quoteStamp(quote.status, quote.validUntil)}
            title={quote.title}
            issuedAt={quote.issuedAt}
            endDate={quote.validUntil}
            settings={settings}
            customer={customer}
            items={items}
            discount={quote.discount}
            vatRate={Number(quote.vatRate)}
            vatIncluded={quote.vatIncluded}
            totals={totals}
            notes={quote.notes}
            terms={quote.terms}
          />
        </div>

        <aside className="grid content-start gap-6 xl:order-2">
          {canWrite && (
            <Panel title="Suivi">
              <form action={setQuoteStatusAction} className="grid gap-3">
                <input type="hidden" name="id" value={quote.id} />
                <select name="status" defaultValue={quote.status} className={selectClass} aria-label="Statut du devis">
                  {quoteStatusList.map((s) => (
                    <option key={s} value={s}>
                      {quoteStatuses[s].label}
                    </option>
                  ))}
                </select>
                <SubmitButton pendingLabel="Mise à jour…">Mettre à jour le statut</SubmitButton>
              </form>
            </Panel>
          )}

          <Panel title="Envoyer au client" subtitle="Imprimez le PDF, puis joignez-le au message.">
            <div className="grid gap-2.5">
              {mail ? (
                <LinkBtn href={mail} variant="soft">
                  <MailIcon className="size-4" />
                  Écrire par e-mail
                </LinkBtn>
              ) : (
                <p className="text-sm text-muted">Pas d&apos;e-mail renseigné pour ce client.</p>
              )}
              {wa && (
                <LinkBtn href={wa} target="_blank" variant="soft">
                  <WhatsAppIcon className="size-4" />
                  Écrire sur WhatsApp
                </LinkBtn>
              )}
              {customer && (
                <Link href={`/admin/clients/${customer.id}`} className="text-sm font-semibold text-accent hover:underline">
                  Fiche de {customer.name}
                </Link>
              )}
            </div>
          </Panel>

          <Panel title="Actions">
            <div className="grid gap-2.5">
              {can(user.role, "invoices.write") &&
                (locked ? (
                  <LinkBtn href={`/admin/factures/${quote.invoiceId}`} variant="lime">
                    <InvoiceIcon className="size-4" />
                    Voir la facture
                  </LinkBtn>
                ) : (
                  <form action={convertQuoteToInvoiceAction}>
                    <input type="hidden" name="id" value={quote.id} />
                    <SubmitButton variant="lime" className="w-full" pendingLabel="Conversion…">
                      <InvoiceIcon className="size-4" />
                      Convertir en facture
                    </SubmitButton>
                  </form>
                ))}
              {canWrite && (
                <form action={duplicateQuoteAction}>
                  <input type="hidden" name="id" value={quote.id} />
                  <SubmitButton variant="soft" className="w-full" pendingLabel="Duplication…">
                    Dupliquer ce devis
                  </SubmitButton>
                </form>
              )}
              {canWrite && !locked && (
                <form action={deleteQuoteAction}>
                  <input type="hidden" name="id" value={quote.id} />
                  <ConfirmButton title="Supprimer ce devis ?" message={`Le devis ${quote.number} sera supprimé définitivement.`} confirmLabel="Supprimer" size="md" className="w-full">
                    <TrashIcon className="size-4" />
                    Supprimer
                  </ConfirmButton>
                </form>
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
