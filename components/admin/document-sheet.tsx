import { Logo } from "@/components/logo";
import type { AppSettings } from "@/lib/settings";
import { ar, fmtDate } from "@/lib/format";

type Party = { name: string; company: string | null; address: string | null; city: string | null; phone: string | null; email: string | null; nif: string | null; stat: string | null } | null;

export type SheetProps = {
  kind: "quote" | "invoice";
  number: string;
  /** Tampon diagonal : BROUILLON, PAYÉE, ANNULÉE… */
  stamp?: { label: string; tone: "teal" | "red" | "grey" };
  title: string | null;
  issuedAt: string;
  endDate: string | null;
  settings: AppSettings;
  customer: Party;
  items: { description: string; unitPrice: number; qty: number }[];
  discount: number;
  vatRate: number;
  vatIncluded: boolean;
  totals: { subtotal: number; net: number; vat: number; total: number };
  notes?: string | null;
  terms?: string | null;
  payments?: { paidAt: string; method: string; amount: number }[];
  paid?: number;
};

const stampTone = { teal: "border-[#175c55] text-[#175c55]", red: "border-red-700 text-red-700", grey: "border-neutral-400 text-neutral-400" };

/** Feuille A4 d'un devis ou d'une facture : mêmes couleurs que le site, prête à imprimer ou à enregistrer en PDF. */
export function DocumentSheet(p: SheetProps) {
  const { company, billing } = p.settings;
  const isInvoice = p.kind === "invoice";
  const due = p.totals.total - (p.paid ?? 0);

  return (
    <article className="print-sheet relative mx-auto w-full max-w-[210mm] overflow-hidden rounded-2xl bg-white p-[12mm] text-[13px] leading-relaxed text-[#12413c] shadow-[0_20px_60px_rgb(23_92_85/0.18)] sm:p-[14mm]">
      {p.stamp && (
        <div aria-hidden="true" className={`pointer-events-none absolute left-1/2 top-[120mm] z-10 -translate-x-1/2 -rotate-12 whitespace-nowrap rounded-2xl border-[6px] px-8 py-2 text-6xl font-black uppercase tracking-[0.2em] opacity-25 ${stampTone[p.stamp.tone]}`}>
          {p.stamp.label}
        </div>
      )}

      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <Logo variant="wordmark" className="h-11 w-auto" />
          <div className="mt-4 space-y-0.5 text-[12px] text-[#4b6f6a]">
            <p className="font-semibold text-[#12413c]">{billing.legalName || company.name}</p>
            <p>{billing.address || company.address.fr}</p>
            <p>
              {company.phone} · {company.email}
            </p>
            {(billing.nif || billing.stat || billing.rcs) && (
              <p>{[billing.nif && `NIF ${billing.nif}`, billing.stat && `STAT ${billing.stat}`, billing.rcs && `RCS ${billing.rcs}`].filter(Boolean).join(" · ")}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-semibold uppercase tracking-[0.12em] text-[#175c55]">{isInvoice ? "Facture" : "Devis"}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{p.number}</p>
          <dl className="mt-3 grid grid-cols-[auto_auto] justify-end gap-x-4 gap-y-0.5 text-[12px]">
            <dt className="text-[#4b6f6a]">Date</dt>
            <dd className="font-medium">{fmtDate(p.issuedAt)}</dd>
            <dt className="text-[#4b6f6a]">{isInvoice ? "Échéance" : "Valable jusqu'au"}</dt>
            <dd className="font-medium">{p.endDate ? fmtDate(p.endDate) : "—"}</dd>
          </dl>
        </div>
      </header>

      <section className="mt-9 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#eef6e1] p-5">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4b6f6a]">{isInvoice ? "Facturé à" : "Proposé à"}</p>
          {p.customer ? (
            <div className="space-y-0.5">
              <p className="text-base font-semibold">{p.customer.company || p.customer.name}</p>
              {p.customer.company && <p>{p.customer.name}</p>}
              {(p.customer.address || p.customer.city) && <p>{[p.customer.address, p.customer.city].filter(Boolean).join(", ")}</p>}
              {p.customer.phone && <p>{p.customer.phone}</p>}
              {p.customer.email && <p>{p.customer.email}</p>}
              {(p.customer.nif || p.customer.stat) && <p className="text-[12px] text-[#4b6f6a]">{[p.customer.nif && `NIF ${p.customer.nif}`, p.customer.stat && `STAT ${p.customer.stat}`].filter(Boolean).join(" · ")}</p>}
            </div>
          ) : (
            <p className="text-[#4b6f6a]">Client à renseigner</p>
          )}
        </div>
        {p.title && (
          <div className="p-1">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4b6f6a]">Objet</p>
            <p className="text-base font-semibold">{p.title}</p>
          </div>
        )}
      </section>

      <table className="mt-8 w-full border-collapse text-left">
        <thead>
          <tr className="bg-[#175c55] text-white">
            <th className="rounded-l-lg px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider">Désignation</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">Qté</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">Prix unitaire {p.vatIncluded ? "TTC" : "HT"}</th>
            <th className="rounded-r-lg px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">Total {p.vatIncluded ? "TTC" : "HT"}</th>
          </tr>
        </thead>
        <tbody>
          {p.items.map((it, i) => (
            <tr key={i} className="border-b border-[#175c55]/12 break-inside-avoid">
              <td className="px-3 py-3 font-medium">{it.description}</td>
              <td className="px-3 py-3 text-right tabular-nums">{it.qty}</td>
              <td className="px-3 py-3 text-right tabular-nums">{ar(it.unitPrice)}</td>
              <td className="px-3 py-3 text-right font-semibold tabular-nums">{ar(it.unitPrice * it.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-[60%] space-y-4 text-[12px] text-[#4b6f6a]">
          {p.notes && <p className="whitespace-pre-wrap">{p.notes}</p>}
          {!isInvoice && p.terms && (
            <div>
              <p className="mb-0.5 font-semibold text-[#12413c]">Conditions</p>
              <p className="whitespace-pre-wrap">{p.terms}</p>
            </div>
          )}
          {isInvoice && billing.bankDetails && (
            <div>
              <p className="mb-0.5 font-semibold text-[#12413c]">Règlement</p>
              <p className="whitespace-pre-wrap">{billing.bankDetails}</p>
            </div>
          )}
        </div>

        <dl className="ml-auto w-64 space-y-1.5 break-inside-avoid">
          <div className="flex justify-between">
            <dt className="text-[#4b6f6a]">Sous-total</dt>
            <dd className="tabular-nums">{ar(p.totals.subtotal)}</dd>
          </div>
          {p.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-[#4b6f6a]">Remise</dt>
              <dd className="tabular-nums">− {ar(p.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-[#4b6f6a]">Total HT</dt>
            <dd className="tabular-nums">{ar(p.totals.net)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#4b6f6a]">{p.vatIncluded ? `Dont TVA ${p.vatRate} %` : `TVA ${p.vatRate} %`}</dt>
            <dd className="tabular-nums">{ar(p.totals.vat)}</dd>
          </div>
          <div className="flex items-baseline justify-between rounded-xl bg-[#175c55] px-3 py-2.5 text-white">
            <dt className="text-[12px] font-semibold uppercase tracking-wider">Total TTC</dt>
            <dd className="text-xl font-semibold tabular-nums">{ar(p.totals.total)}</dd>
          </div>
          {isInvoice && (p.paid ?? 0) > 0 && (
            <>
              <div className="flex justify-between pt-1">
                <dt className="text-[#4b6f6a]">Déjà réglé</dt>
                <dd className="tabular-nums">− {ar(p.paid ?? 0)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Reste à payer</dt>
                <dd className="tabular-nums">{ar(Math.max(0, due))}</dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {isInvoice && p.payments && p.payments.length > 0 && (
        <section className="mt-6 break-inside-avoid text-[12px]">
          <p className="mb-1 font-semibold">Paiements reçus</p>
          <ul className="grid gap-0.5 text-[#4b6f6a]">
            {p.payments.map((pay, i) => (
              <li key={i} className="flex justify-between border-b border-[#175c55]/10 py-1">
                <span>
                  {fmtDate(pay.paidAt)} · {pay.method}
                </span>
                <span className="tabular-nums">{ar(pay.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-10 border-t border-[#175c55]/15 pt-4 text-center text-[11px] text-[#4b6f6a]">
        {isInvoice ? billing.invoiceFooter : ""}
        <p className="mt-0.5">
          {billing.legalName || company.name} · {company.phone} · {company.email}
        </p>
      </footer>
    </article>
  );
}
