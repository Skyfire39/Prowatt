"use client";

import { saveBillingAction, saveCompanyAction, savePaymentAction } from "@/app/admin/(panel)/parametres/actions";
import type { AppSettings } from "@/lib/settings";
import { Field, FormError, Panel, inputClass, textareaClass } from "./ui";
import { SubmitButton, useActionForm } from "./client";

function Result({ state }: { state: { error?: string; ok?: string } | null }) {
  if (state?.ok) return <p role="status" className="rounded-xl border border-lime bg-lime/40 px-4 py-3 text-sm font-medium text-teal">{state.ok}</p>;
  return <FormError message={state?.error} />;
}

export function CompanyForm({ v }: { v: AppSettings["company"] }) {
  const { state, onSubmit, pending } = useActionForm(saveCompanyAction);
  return (
    <form onSubmit={onSubmit}>
      <Panel title="Entreprise" subtitle="Coordonnées affichées sur le site (pied de page, contact, bulles WhatsApp et e-mail) et sur les documents.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom commercial" required className="sm:col-span-2">
            <input name="name" defaultValue={v.name} required className={inputClass} />
          </Field>
          <Field label="E-mail" required>
            <input name="email" type="email" defaultValue={v.email} required className={inputClass} />
          </Field>
          <Field label="Téléphone" required>
            <input name="phone" defaultValue={v.phone} required className={inputClass} />
          </Field>
          <Field label="Numéro WhatsApp" required hint="Format international sans « + », ex. 261343422220." className="sm:col-span-2">
            <input name="whatsappNumber" defaultValue={v.whatsappNumber} required className={inputClass} />
          </Field>
          <Field label="Adresse">
            <textarea name="addressFr" defaultValue={v.address.fr} rows={2} className={textareaClass} />
          </Field>
          <Field label="Horaires" hint="Une ligne par créneau.">
            <textarea name="hoursFr" defaultValue={v.hours.fr.join("\n")} rows={4} className={textareaClass} />
          </Field>
        </div>
        <div className="mt-6 grid gap-4">
          <Result state={state} />
          <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="w-fit">Enregistrer l&apos;entreprise</SubmitButton>
        </div>
      </Panel>
    </form>
  );
}

export function PaymentForm({ v }: { v: AppSettings["payment"] }) {
  const { state, onSubmit, pending } = useActionForm(savePaymentAction);
  return (
    <form onSubmit={onSubmit}>
      <Panel title="Coordonnées de paiement" subtitle="Affichées au client à la fin de sa commande (MVola, virement, carte). Un champ vide n'est pas affiché.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Numéro MVola marchand">
            <input name="mvolaNumber" defaultValue={v.mvola.number} className={inputClass} placeholder="034 00 000 00" />
          </Field>
          <Field label="Titulaire du compte MVola">
            <input name="mvolaHolder" defaultValue={v.mvola.holder} className={inputClass} />
          </Field>
          <Field label="Banque">
            <input name="bankName" defaultValue={v.bank.bank} className={inputClass} />
          </Field>
          <Field label="Titulaire du compte bancaire">
            <input name="bankHolder" defaultValue={v.bank.holder} className={inputClass} />
          </Field>
          <Field label="RIB / IBAN" className="sm:col-span-2">
            <input name="bankAccount" defaultValue={v.bank.account} className={inputClass} />
          </Field>
          <Field label="Lien de paiement par carte" hint="Page de paiement sécurisée de votre prestataire (https)." className="sm:col-span-2">
            <input name="cardUrl" type="url" defaultValue={v.card.url} className={inputClass} placeholder="https://" />
          </Field>
        </div>
        <div className="mt-6 grid gap-4">
          <Result state={state} />
          <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="w-fit">Enregistrer les coordonnées</SubmitButton>
        </div>
      </Panel>
    </form>
  );
}

export function BillingForm({ v }: { v: AppSettings["billing"] }) {
  const { state, onSubmit, pending } = useActionForm(saveBillingAction);
  return (
    <form onSubmit={onSubmit}>
      <Panel title="Facturation" subtitle="Mentions légales et règles appliquées à tous les devis et factures.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Raison sociale" className="sm:col-span-2">
            <input name="legalName" defaultValue={v.legalName} className={inputClass} />
          </Field>
          <Field label="Adresse légale" className="sm:col-span-2">
            <input name="address" defaultValue={v.address} className={inputClass} />
          </Field>
          <Field label="NIF">
            <input name="nif" defaultValue={v.nif} className={inputClass} />
          </Field>
          <Field label="STAT">
            <input name="stat" defaultValue={v.stat} className={inputClass} />
          </Field>
          <Field label="RCS" className="sm:col-span-2">
            <input name="rcs" defaultValue={v.rcs} className={inputClass} />
          </Field>
          <Field label="TVA par défaut (%)">
            <input name="vatRate" type="number" min={0} max={100} step="0.5" defaultValue={v.vatRate} className={inputClass} />
          </Field>
          <span />
          <Field label="Préfixe des devis" hint="Ex. DV → DV-2026-0001">
            <input name="quotePrefix" defaultValue={v.quotePrefix} maxLength={6} className={`${inputClass} uppercase`} />
          </Field>
          <Field label="Préfixe des factures" hint="Ex. FA → FA-2026-0001">
            <input name="invoicePrefix" defaultValue={v.invoicePrefix} maxLength={6} className={`${inputClass} uppercase`} />
          </Field>
          <Field label="Validité d'un devis (jours)">
            <input name="quoteValidityDays" type="number" min={0} max={365} defaultValue={v.quoteValidityDays} className={inputClass} />
          </Field>
          <Field label="Délai de paiement (jours)">
            <input name="paymentTermsDays" type="number" min={0} max={365} defaultValue={v.paymentTermsDays} className={inputClass} />
          </Field>
          <Field label="Coordonnées bancaires imprimées sur les factures" className="sm:col-span-2">
            <textarea name="bankDetails" defaultValue={v.bankDetails} rows={3} className={textareaClass} placeholder={"Banque : …\nRIB : …\nMVola : …"} />
          </Field>
          <Field label="Conditions des devis" className="sm:col-span-2">
            <textarea name="quoteTerms" defaultValue={v.quoteTerms} rows={4} className={textareaClass} />
          </Field>
          <Field label="Mot de fin des factures" className="sm:col-span-2">
            <input name="invoiceFooter" defaultValue={v.invoiceFooter} className={inputClass} />
          </Field>
        </div>
        <div className="mt-6 grid gap-4">
          <Result state={state} />
          <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="w-fit">Enregistrer la facturation</SubmitButton>
        </div>
      </Panel>
    </form>
  );
}
