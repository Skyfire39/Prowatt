"use client";

import { saveMotoAction } from "@/app/admin/(panel)/motos/actions";
import { specFields } from "@/lib/admin/specs";
import { Field, FormError, Panel, Toggle, inputClass, textareaClass } from "./ui";
import type { ProductOption } from "@/lib/options";
import { SubmitButton, useActionForm } from "./client";
import { OptionsEditor } from "./options-editor";

export type MotoFormValues = {
  id?: string;
  name: string;
  taglineFr: string;
  taglineEn: string;
  descriptionFr: string;
  descriptionEn: string;
  photo: string | null;
  productPhoto: string | null;
  price: number | "";
  active: boolean;
  sort: number;
  specs: Record<string, string>;
  highlightsFr: string;
  highlightsEn: string;
  options: ProductOption[];
};

const fileClass =
  "block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent hover:file:opacity-90";

export function MotoForm({ values }: { values: MotoFormValues }) {
  const { state, onSubmit, pending } = useActionForm(saveMotoAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-3">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid gap-6 lg:col-span-2">
        <Panel title="Identité du modèle" subtitle="Ces textes alimentent la page dédiée, le slider et la boutique.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom du modèle" required className="sm:col-span-2">
              <input name="name" defaultValue={values.name} required className={inputClass} placeholder="ex. ALTA" />
            </Field>
            <Field label="Accroche" required>
              <input name="taglineFr" defaultValue={values.taglineFr} required className={inputClass} />
            </Field>
            {values.descriptionFr.trim() && (
              <Field label="Ancienne présentation" hint="Remplacée par les détails ci-dessous : videz ce texte une fois les détails renseignés." className="sm:col-span-2">
                <textarea name="descriptionFr" defaultValue={values.descriptionFr} rows={3} className={textareaClass} />
              </Field>
            )}
          </div>
        </Panel>

        <Panel title="Détails du modèle" subtitle="Ce que le client lit dans « Paramètres du produit » sur la page du modèle. Les quatre premiers sont toujours affichés (« Sur demande » si vides), les autres seulement s'ils sont renseignés.">
          <div className="grid gap-x-8 sm:grid-cols-2">
            {specFields.map((f, k) => (
              <label key={f.key} className="grid gap-1 border-b border-line/60 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                <span className="flex items-center justify-between gap-2">
                  {f.label}
                  {k < 4 && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] normal-case tracking-normal text-accent">Toujours affiché</span>}
                </span>
                <input name={`spec_${f.key}`} defaultValue={values.specs[f.key] ?? ""} className={`${inputClass} text-sm font-semibold normal-case tracking-normal text-ink`} placeholder={f.placeholder} />
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="Points forts" subtitle="Une ligne par point fort.">
          <Field label="Points forts">
            <textarea name="highlightsFr" defaultValue={values.highlightsFr} rows={5} className={textareaClass} placeholder={"Moteur central silencieux\nRecharge à domicile"} />
          </Field>
        </Panel>

        <OptionsEditor initial={values.options} subject="cette moto" />
      </div>

      <div className="grid content-start gap-6">
        <Panel title="Photo d'accueil" subtitle="Moto détourée (fond transparent), PNG ou WebP, 2 Mo maximum. Affichée sur la page d'accueil.">
          {values.photo && (
            <div className="mb-4 rounded-2xl bg-accent-soft p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values.photo} alt="" className="aspect-square w-full object-contain" />
            </div>
          )}
          <input type="file" name="photo" accept="image/png,image/jpeg,image/webp" className={fileClass} />
        </Panel>

        <Panel title="Photo produit" subtitle="Photo avec décor (JPEG, PNG ou WebP, 2 Mo maximum) : pages Ecooter, boutique et panier. Sans photo produit, la photo d'accueil est reprise.">
          {values.productPhoto && (
            <div className="mb-4 overflow-hidden rounded-2xl bg-accent-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values.productPhoto} alt="" className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
          <input type="file" name="productPhoto" accept="image/png,image/jpeg,image/webp" className={fileClass} />
          {values.productPhoto && (
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input type="checkbox" name="removeProductPhoto" className="size-4 accent-[#175c55]" />
              Retirer la photo produit
            </label>
          )}
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
