"use client";

import { saveMotoAction } from "@/app/admin/(panel)/motos/actions";
import { specFields } from "@/lib/admin/specs";
import { Field, FormError, Panel, Toggle, inputClass, textareaClass } from "./ui";
import { SubmitButton, useActionForm } from "./client";

export type MotoFormValues = {
  id?: string;
  name: string;
  taglineFr: string;
  taglineEn: string;
  descriptionFr: string;
  descriptionEn: string;
  photo: string | null;
  price: number | "";
  active: boolean;
  sort: number;
  specs: Record<string, string>;
  highlightsFr: string;
  highlightsEn: string;
};

export function MotoForm({ values }: { values: MotoFormValues }) {
  const { state, onSubmit, pending } = useActionForm(saveMotoAction);
  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid gap-6 lg:col-span-2">
        <Panel title="Identité du modèle" subtitle="Ces textes alimentent la page dédiée, le slider et la boutique.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom du modèle" required className="sm:col-span-2">
              <input name="name" defaultValue={values.name} required className={inputClass} placeholder="ex. ALTA" />
            </Field>
            <Field label="Accroche (français)" required>
              <input name="taglineFr" defaultValue={values.taglineFr} required className={inputClass} />
            </Field>
            <Field label="Accroche (anglais)" hint="Vide : reprend le français.">
              <input name="taglineEn" defaultValue={values.taglineEn} className={inputClass} />
            </Field>
            <Field label="Présentation (français)" hint="Texte libre affiché sur la page du modèle." className="sm:col-span-2">
              <textarea name="descriptionFr" defaultValue={values.descriptionFr} rows={4} className={textareaClass} />
            </Field>
            <Field label="Présentation (anglais)" className="sm:col-span-2">
              <textarea name="descriptionEn" defaultValue={values.descriptionEn} rows={4} className={textareaClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Fiche technique" subtitle="Les lignes vides s'affichent « Sur demande » (4 premières) ou sont masquées.">
          <div className="grid gap-5 sm:grid-cols-2">
            {specFields.map((f) => (
              <Field key={f.key} label={f.label}>
                <input name={`spec_${f.key}`} defaultValue={values.specs[f.key] ?? ""} className={inputClass} placeholder={f.placeholder} />
              </Field>
            ))}
          </div>
        </Panel>

        <Panel title="Points forts" subtitle="Une ligne par point fort ; la ligne anglaise de même rang sert de traduction.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Français">
              <textarea name="highlightsFr" defaultValue={values.highlightsFr} rows={5} className={textareaClass} placeholder={"Moteur central silencieux\nRecharge à domicile"} />
            </Field>
            <Field label="Anglais">
              <textarea name="highlightsEn" defaultValue={values.highlightsEn} rows={5} className={textareaClass} placeholder={"Quiet central motor\nHome charging"} />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="grid content-start gap-6">
        <Panel title="Photo" subtitle="Moto détourée (fond transparent), PNG ou WebP, 2 Mo maximum.">
          {values.photo && (
            <div className="mb-4 rounded-2xl bg-accent-soft p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values.photo} alt="" className="aspect-square w-full object-contain" />
            </div>
          )}
          <input
            type="file"
            name="photo"
            accept="image/png,image/jpeg,image/webp"
            className="block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent hover:file:opacity-90"
          />
        </Panel>

        <Panel title="Affichage">
          <div className="grid gap-5">
            <Toggle name="active" label="Visible sur le site" defaultChecked={values.active} />
            <Field label="Ordre d'affichage" hint="Les plus petits numéros apparaissent en premier.">
              <input name="sort" type="number" defaultValue={values.sort} className={inputClass} />
            </Field>
            <Field label="Prix (Ar)" hint="Vide : « Prix sur demande ».">
              <input name="price" inputMode="numeric" defaultValue={values.price} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <FormError message={state?.error} />
        <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="h-12 w-full">
          {values.id ? "Enregistrer le modèle" : "Créer le modèle"}
        </SubmitButton>
      </div>
    </form>
  );
}
