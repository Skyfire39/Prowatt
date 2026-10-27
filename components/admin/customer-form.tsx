"use client";

import { saveCustomerAction } from "@/app/admin/(panel)/clients/actions";
import { Field, FormError, Panel, inputClass, selectClass, textareaClass } from "./ui";
import { SubmitButton, useActionForm } from "./client";

export type CustomerValues = {
  id?: string;
  type: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  nif: string;
  stat: string;
  notes: string;
};

export function CustomerForm({ values }: { values: CustomerValues }) {
  const { state, onSubmit, pending } = useActionForm(saveCustomerAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-3">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="grid gap-6 lg:col-span-2">
        <Panel title="Coordonnées">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Type de client">
              <select name="type" defaultValue={values.type} className={selectClass}>
                <option value="individual">Particulier</option>
                <option value="company">Société</option>
              </select>
            </Field>
            <Field label="Nom du contact" required>
              <input name="name" defaultValue={values.name} required className={inputClass} />
            </Field>
            <Field label="Société" hint="Pour les clients professionnels." className="sm:col-span-2">
              <input name="company" defaultValue={values.company} className={inputClass} />
            </Field>
            <Field label="Téléphone">
              <input name="phone" type="tel" defaultValue={values.phone} className={inputClass} placeholder="034 00 000 00" />
            </Field>
            <Field label="E-mail">
              <input name="email" type="email" defaultValue={values.email} className={inputClass} />
            </Field>
            <Field label="Adresse" className="sm:col-span-2">
              <input name="address" defaultValue={values.address} className={inputClass} />
            </Field>
            <Field label="Ville">
              <input name="city" defaultValue={values.city} className={inputClass} />
            </Field>
          </div>
        </Panel>
        <Panel title="Informations fiscales" subtitle="Imprimées sur les factures des sociétés.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="NIF">
              <input name="nif" defaultValue={values.nif} className={inputClass} />
            </Field>
            <Field label="STAT">
              <input name="stat" defaultValue={values.stat} className={inputClass} />
            </Field>
          </div>
        </Panel>
      </div>
      <div className="grid content-start gap-6">
        <Panel title="Notes internes" subtitle="Visibles uniquement par l'équipe.">
          <textarea name="notes" defaultValue={values.notes} rows={8} className={textareaClass} placeholder="Préférences, historique, rappels…" />
        </Panel>
        <FormError message={state?.error} />
        <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="h-12 w-full">
          {values.id ? "Enregistrer le client" : "Créer le client"}
        </SubmitButton>
      </div>
    </form>
  );
}
