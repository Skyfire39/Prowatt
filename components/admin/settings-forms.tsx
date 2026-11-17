"use client";

import { saveBillingAction, saveCompanyAction, saveMailAction, savePaymentAction, sendTestMailAction } from "@/app/admin/(panel)/parametres/actions";
import type { AppSettings } from "@/lib/settings";
import { mailFields } from "@/lib/mail-templates";
import { Field, FormError, Panel, Toggle, inputClass, selectClass, textareaClass } from "./ui";
import { SubmitButton, useActionForm } from "./client";

function Result({ state }: { state: { error?: string; ok?: string } | null }) {
  if (state?.ok) return <p role="status" className="rounded-xl border border-lime bg-lime/40 px-4 py-3 text-sm font-medium text-teal">{state.ok}</p>;
  return <FormError message={state?.error} />;
}

export function CompanyForm({ v }: { v: AppSettings["company"] }) {
  const { state, onSubmit, pending } = useActionForm(saveCompanyAction);
  return (
    <form method="post" onSubmit={onSubmit}>
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
          <Field label="Numéro WhatsApp" required hint="Format international sans « + », ex. 261381231011." className="sm:col-span-2">
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
    <form method="post" onSubmit={onSubmit}>
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
    <form method="post" onSubmit={onSubmit}>
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

export function MailForm({ v, configured, from }: { v: AppSettings["mail"]; configured: boolean; from: string | null }) {
  const { state, onSubmit, pending } = useActionForm(saveMailAction);
  const test = useActionForm(sendTestMailAction);
  return (
    <div className="grid gap-6">
      <form method="post" onSubmit={onSubmit}>
        <Panel title="E-mails des demandes de devis" subtitle="À chaque demande envoyée depuis le site, elle est sauvegardée ici puis envoyée par e-mail à vos commerciaux, avec une confirmation au demandeur.">
          <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${configured ? "border-lime bg-lime/40 text-teal" : "border-amber-300 bg-amber-50 text-amber-900"}`}>
            {configured ? (
              <>Envoi actif via Resend, expéditeur : <strong>{from}</strong>.</>
            ) : (
              <>
                L&apos;envoi n&apos;est pas encore relié : ajoutez <code className="rounded bg-black/5 px-1">RESEND_API_KEY</code> et <code className="rounded bg-black/5 px-1">MAIL_FROM</code> dans <code className="rounded bg-black/5 px-1">.env.local</code> (et chez votre hébergeur), puis redémarrez. Tant que ce n&apos;est pas fait, les demandes restent sauvegardées ici sans e-mail.
              </>
            )}
          </div>

          <div className="grid gap-5">
            <Toggle name="notifySales" label="Prévenir les commerciaux à chaque demande" defaultChecked={v.notifySales} />
            <Field label="Adresses des commerciaux" hint="Une adresse par ligne (ou séparées par des virgules). Elles reçoivent toutes la demande ; « Répondre » écrit directement au client.">
              <textarea name="salesEmails" defaultValue={v.salesEmails.join("\n")} rows={3} className={textareaClass} placeholder="commercial1@prowattmadagascar.com" />
            </Field>
            <Field label="Sujet de l'e-mail aux commerciaux">
              <input name="salesSubject" defaultValue={v.salesSubject} className={inputClass} />
            </Field>
            <Field label="Texte de l'e-mail aux commerciaux">
              <textarea name="salesBody" defaultValue={v.salesBody} rows={10} className={textareaClass} />
            </Field>

            <hr className="border-line" />

            <Toggle name="confirmCustomer" label="Envoyer une confirmation au demandeur" defaultChecked={v.confirmCustomer} hint="Seulement s'il a renseigné son adresse e-mail dans le formulaire." />
            <Field label="Sujet de la confirmation">
              <input name="customerSubject" defaultValue={v.customerSubject} className={inputClass} />
            </Field>
            <Field label="Texte de la confirmation">
              <textarea name="customerBody" defaultValue={v.customerBody} rows={9} className={textareaClass} />
            </Field>
            <Field label="Adresse de réponse du client" hint="Où arrivent les réponses à la confirmation. Vide : l'e-mail de l'entreprise.">
              <input name="replyTo" type="email" defaultValue={v.replyTo} className={inputClass} placeholder="info@prowattmadagascar.com" />
            </Field>

            <div className="rounded-2xl bg-accent-soft/60 p-4 text-sm">
              <p className="font-semibold">Champs à insérer dans vos textes et sujets</p>
              <p className="mt-0.5 text-muted">Écrivez-les tels quels, avec les doubles accolades : ils sont remplacés par les informations de la demande.</p>
              <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {mailFields.map(([k, d]) => (
                  <li key={k} className="flex gap-2">
                    <code className="shrink-0 rounded bg-white/70 px-1.5 py-0.5 text-xs font-semibold text-teal">{`{{${k}}}`}</code>
                    <span className="text-muted">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            <Result state={state} />
            <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="w-fit">Enregistrer les e-mails</SubmitButton>
          </div>
        </Panel>
      </form>

      <form method="post" onSubmit={test.onSubmit}>
        <Panel title="Envoyer un essai" subtitle="Reçoit un exemple avec une demande fictive, à partir des textes enregistrés ci-dessus (enregistrez d'abord vos modifications).">
          <div className="grid gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Adresse de test" required>
              <input name="to" type="email" required className={inputClass} placeholder="vous@exemple.com" />
            </Field>
            <Field label="Quel e-mail ?">
              <select name="which" className={selectClass} defaultValue="sales">
                <option value="sales">Alerte aux commerciaux</option>
                <option value="customer">Confirmation au client</option>
              </select>
            </Field>
            <SubmitButton pending={test.pending} pendingLabel="Envoi…" variant="soft">Envoyer l&apos;essai</SubmitButton>
          </div>
          <div className="mt-4 grid gap-4">
            <Result state={test.state} />
          </div>
        </Panel>
      </form>
    </div>
  );
}
