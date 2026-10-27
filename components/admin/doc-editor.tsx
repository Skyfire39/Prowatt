"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { ar, computeTotals } from "@/lib/format";
import type { FormState } from "@/lib/validate";
import { SubmitButton, useActionForm } from "./client";
import { Field, FormError, Panel, Toggle, inputClass, selectClass, textareaClass } from "./ui";

export type DocLine = { key: string; productId: string; description: string; unitPrice: number | ""; qty: number | "" };
export type DocValues = {
  id?: string;
  customerId: string;
  title: string;
  issuedAt: string;
  /** Date de validité (devis) ou d'échéance (facture). */
  endDate: string;
  vatRate: number;
  vatIncluded: boolean;
  discount: number | "";
  notes: string;
  terms: string;
  lines: DocLine[];
};
type Props = {
  kind: "quote" | "invoice";
  values: DocValues;
  customers: { id: string; name: string; company: string | null }[];
  products: { id: string; name: string; price: number }[];
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
};

let seq = 0;
export const newLine = (): DocLine => ({ key: `l${Date.now()}-${seq++}`, productId: "", description: "", unitPrice: "", qty: 1 });

/**
 * Éditeur de devis et de factures : lignes libres ou issues du catalogue, remise, TVA (prix HT ou TTC),
 * totaux en direct. Seules les lignes partent au serveur ; il recalcule tous les montants lui-même.
 */
export function DocEditor({ kind, values, customers, products, action }: Props) {
  const { state, onSubmit, pending } = useActionForm(action);
  const [lines, setLines] = useState<DocLine[]>(values.lines.length ? values.lines : [newLine()]);
  const [vatRate, setVatRate] = useState(values.vatRate);
  const [vatIncluded, setVatIncluded] = useState(values.vatIncluded);
  const [discount, setDiscount] = useState<number | "">(values.discount);

  const totals = useMemo(
    () =>
      computeTotals(
        lines.map((l) => ({ unitPrice: Number(l.unitPrice) || 0, qty: Number(l.qty) || 0 })),
        Number(discount) || 0,
        Number(vatRate) || 0,
        vatIncluded,
      ),
    [lines, discount, vatRate, vatIncluded],
  );

  const payload = JSON.stringify(
    lines.map((l) => ({ productId: l.productId || null, description: l.description, unitPrice: Number(l.unitPrice) || 0, qty: Number(l.qty) || 0 })),
  );

  const patch = (key: string, p: Partial<DocLine>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...p } : l)));

  // Les prix du catalogue sont des prix TTC : en mode HT on les ramène hors taxe pour ne pas facturer la TVA deux fois.
  function pick(key: string, productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return patch(key, { productId: "" });
    const unit = vatIncluded || !vatRate ? p.price : Math.round(p.price / (1 + vatRate / 100));
    patch(key, { productId, description: p.name, unitPrice: unit });
  }

  const isInvoice = kind === "invoice";

  return (
    <form method="post" onSubmit={onSubmit} className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-3">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <input type="hidden" name="items" value={payload} />

      <div className="grid min-w-0 content-start gap-6 xl:col-span-2">
        <Panel title={isInvoice ? "Facture" : "Devis"}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Client" className="sm:col-span-2" hint={
                <>
                  Pas encore dans la liste ?{" "}
                  <Link href="/admin/clients/nouveau" className="font-semibold text-accent hover:underline" target="_blank">
                    Créer un client
                  </Link>
                </>
              }>
              <select name="customerId" defaultValue={values.customerId} className={selectClass}>
                <option value="">— Choisir un client —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.company ? ` · ${c.company}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Objet" className="sm:col-span-2" hint="Ex. Installation solaire 3 kWc, kit éclairage…">
              <input name="title" defaultValue={values.title} className={inputClass} />
            </Field>
            <Field label="Date d'émission">
              <input name="issuedAt" type="date" defaultValue={values.issuedAt} required className={inputClass} />
            </Field>
            <Field label={isInvoice ? "Échéance de paiement" : "Valable jusqu'au"}>
              <input name="endDate" type="date" defaultValue={values.endDate} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Lignes" subtitle="Choisissez un produit du catalogue ou saisissez une ligne libre (main d'œuvre, transport…).">
          <div className="grid gap-4">
            <div className="hidden grid-cols-[13rem_minmax(0,1fr)_5.5rem_8.5rem_8rem_2.25rem] gap-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted 2xl:grid">
              <span>Produit</span>
              <span>Désignation</span>
              <span className="text-right">Qté</span>
              <span className="text-right">Prix unitaire</span>
              <span className="text-right">Total</span>
              <span />
            </div>
            {lines.map((l, i) => (
              <div key={l.key} className="grid grid-cols-[minmax(0,1fr)] gap-3 rounded-2xl border border-line/80 bg-white/55 p-3 2xl:grid-cols-[13rem_minmax(0,1fr)_5.5rem_8.5rem_8rem_2.25rem] 2xl:items-center 2xl:border-0 2xl:bg-transparent 2xl:p-0">
                <select aria-label={`Produit de la ligne ${i + 1}`} value={l.productId} onChange={(e) => pick(l.key, e.target.value)} className={selectClass}>
                  <option value="">Ligne libre</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input aria-label={`Désignation de la ligne ${i + 1}`} value={l.description} onChange={(e) => patch(l.key, { description: e.target.value })} placeholder="Désignation" className={inputClass} />
                <input aria-label={`Quantité de la ligne ${i + 1}`} inputMode="numeric" value={l.qty} onChange={(e) => patch(l.key, { qty: e.target.value === "" ? "" : Number(e.target.value.replace(/\D/g, "")) })} className={`${inputClass} text-right tabular-nums`} />
                <input aria-label={`Prix unitaire de la ligne ${i + 1}`} inputMode="numeric" value={l.unitPrice === "" ? "" : l.unitPrice} onChange={(e) => patch(l.key, { unitPrice: e.target.value === "" ? "" : Number(e.target.value.replace(/[^\d]/g, "")) })} placeholder="0" className={`${inputClass} text-right tabular-nums`} />
                <p className="px-1 text-right text-sm font-semibold tabular-nums 2xl:px-0">{ar((Number(l.unitPrice) || 0) * (Number(l.qty) || 0))}</p>
                <button
                  type="button"
                  onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.key !== l.key) : [newLine()]))}
                  aria-label={`Supprimer la ligne ${i + 1}`}
                  className="grid size-9 place-items-center justify-self-end rounded-full text-muted transition-colors hover:bg-red-600/10 hover:text-red-700"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setLines((ls) => [...ls, newLine()])} className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-dashed border-accent/50 px-4 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft">
              <PlusIcon className="size-4" />
              Ajouter une ligne
            </button>
          </div>
        </Panel>

        <Panel title={isInvoice ? "Notes" : "Notes et conditions"}>
          <div className="grid gap-5">
            <Field label="Notes visibles sur le document" hint="Délais, modalités d'installation, remerciements…">
              <textarea name="notes" defaultValue={values.notes} rows={3} className={textareaClass} />
            </Field>
            {!isInvoice && (
              <Field label="Conditions" hint="Reprises automatiquement depuis les paramètres ; modifiables pour ce devis.">
                <textarea name="terms" defaultValue={values.terms} rows={4} className={textareaClass} />
              </Field>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid content-start gap-6 xl:sticky xl:top-6 xl:self-start">
        <Panel title="Montants">
          <div className="grid gap-4">
            <Field label="Remise (Ar)">
              <input name="discount" inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value === "" ? "" : Number(e.target.value.replace(/\D/g, "")))} className={`${inputClass} text-right tabular-nums`} placeholder="0" />
            </Field>
            <Field label="Taux de TVA (%)">
              <input name="vatRate" type="number" min={0} max={100} step="0.5" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} className={`${inputClass} text-right tabular-nums`} />
            </Field>
            <Toggle name="vatIncluded" label="Prix saisis TTC" checked={vatIncluded} onChange={setVatIncluded} hint="TVA incluse dans les prix, comme sur le site. Sinon les prix sont hors taxe." />
          </div>
          <dl className="mt-6 grid gap-2.5 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Sous-total</dt>
              <dd className="font-medium tabular-nums">{ar(totals.subtotal)}</dd>
            </div>
            {Number(discount) > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Remise</dt>
                <dd className="font-medium tabular-nums">− {ar(Number(discount))}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Total HT</dt>
              <dd className="font-medium tabular-nums">{ar(totals.net)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{vatIncluded ? `Dont TVA ${vatRate} %` : `TVA ${vatRate} %`}</dt>
              <dd className="font-medium tabular-nums">{ar(totals.vat)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
              <dt className="font-semibold">Total TTC</dt>
              <dd className="text-3xl font-semibold tabular-nums tracking-tight">{ar(totals.total)}</dd>
            </div>
          </dl>
        </Panel>

        <FormError message={state?.error} />
        <div className="grid gap-2.5">
          <SubmitButton pending={pending} name="intent" value="save" pendingLabel="Enregistrement…" className="h-12 w-full">
            {isInvoice ? "Enregistrer le brouillon" : "Enregistrer le devis"}
          </SubmitButton>
          {isInvoice && (
            <SubmitButton pending={pending} name="intent" value="issue" variant="lime" pendingLabel="Émission…" className="h-12 w-full">
              Enregistrer et émettre
            </SubmitButton>
          )}
        </div>
        {isInvoice && <p className="text-xs leading-relaxed text-muted">Un brouillon reste modifiable et n&apos;a pas de numéro définitif. À l&apos;émission, la facture reçoit son numéro légal et ne peut plus être modifiée.</p>}
      </div>
    </form>
  );
}
