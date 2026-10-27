"use client";

import { useEffect, useState } from "react";
import { saveProjectAction } from "@/app/admin/(panel)/realisations/actions";
import { MAX_PROJECT_IMAGES, projectNumbers } from "@/lib/admin/projects";
import { Field, FormError, Panel, Toggle, inputClass, selectClass, textareaClass } from "./ui";
import { SubmitButton, useActionForm } from "./client";

export type ProjectFormValues = {
  id?: string;
  slug: string;
  titleFr: string;
  city: string;
  date: string;
  client: string;
  descriptionFr: string;
  noteFr: string;
  storageKind: string;
  panelsCount: number | "";
  panelsWatts: number | "";
  numbers: Record<string, number | "">;
  images: string[];
  active: boolean;
  sort: number | "";
};

const fileClass =
  "block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent hover:file:opacity-90";

export function ProjectForm({ values, categories }: { values: ProjectFormValues; categories: { id: string; name: string }[] }) {
  const { state, onSubmit, pending } = useActionForm(saveProjectAction);
  const [images, setImages] = useState(values.images);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const room = MAX_PROJECT_IMAGES - images.length;

  // Les formulaires acceptent 20 Mo au total : on prévient avant l'envoi plutôt que d'échouer sans message.
  const guard = (e: React.FormEvent<HTMLFormElement>) => {
    const total = [...e.currentTarget.querySelectorAll<HTMLInputElement>("input[type=file]")].flatMap((i) => [...(i.files ?? [])]).reduce((n, f) => n + f.size, 0);
    if (total > 18 * 1024 * 1024) {
      e.preventDefault();
      return setFileError("Les photos choisies dépassent 18 Mo au total. Enregistrez-les en plusieurs fois.");
    }
    setFileError(null);
    onSubmit(e);
  };

  const move = (i: number, to: number) =>
    setImages((list) => {
      const next = [...list];
      const [x] = next.splice(i, 1);
      next.splice(to, 0, x);
      return next;
    });

  return (
    <form method="post" onSubmit={guard} className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-3">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {images.map((src) => (
        <input key={src} type="hidden" name="image" value={src} />
      ))}

      <div className="grid gap-6 lg:col-span-2">
        <Panel title="Présentation du chantier" subtitle="Ces textes s'affichent sur la carte de la réalisation, dans sa catégorie.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Catégorie" required className="sm:col-span-2">
              <select name="slug" defaultValue={values.slug} required className={selectClass}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Titre" required className="sm:col-span-2">
              <input name="titleFr" defaultValue={values.titleFr} required className={inputClass} placeholder="ex. Plateforme logistique" />
            </Field>
            <Field label="Client" hint="Nom ou profil du client.">
              <input name="client" defaultValue={values.client} className={inputClass} placeholder="ex. Particulier à Ambohijanaka" />
            </Field>
            <Field label="Ville ou lieu">
              <input name="city" defaultValue={values.city} className={inputClass} placeholder="ex. Antananarivo" />
            </Field>
            <Field label="Installé en" hint="Mois et année (facultatif).">
              <input name="date" type="month" defaultValue={values.date} className={inputClass} />
            </Field>
            <Field label="Description" hint="Présentation détaillée du projet." className="sm:col-span-2">
              <textarea name="descriptionFr" defaultValue={values.descriptionFr} rows={5} className={textareaClass} />
            </Field>
            <Field label="Note courte" hint="Remplace la description sur la carte si elle est renseignée." className="sm:col-span-2">
              <input name="noteFr" defaultValue={values.noteFr} className={inputClass} placeholder="ex. Production moyenne d'environ 550 kWh par jour." />
            </Field>
          </div>
        </Panel>

        <Panel title="Caractéristiques" subtitle="Seules les lignes renseignées s'affichent sur le site.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Panneaux : nombre">
              <input name="panelsCount" inputMode="numeric" defaultValue={values.panelsCount} className={inputClass} placeholder="ex. 240" />
            </Field>
            <Field label="Panneaux : puissance unitaire (W)">
              <input name="panelsWatts" inputMode="numeric" defaultValue={values.panelsWatts} className={inputClass} placeholder="ex. 550" />
            </Field>
            {projectNumbers.map((f) => (
              <Field key={f.key} label={f.label}>
                <input name={f.key} inputMode="decimal" defaultValue={values.numbers[f.key] ?? ""} className={inputClass} placeholder={f.placeholder} />
              </Field>
            ))}
            <Field label="Type de stockage" hint="ex. Lithium, plomb-carbone…">
              <input name="storageKind" defaultValue={values.storageKind} className={inputClass} placeholder="ex. Lithium" />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="grid content-start gap-6">
        <Panel title="Photos du chantier" subtitle="La première photo sert de couverture. PNG, JPEG ou WebP, 2 Mo maximum par photo.">
          <div className="grid gap-4">
            {images.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 2xl:grid-cols-3">
                {images.map((src, i) => (
                  <li key={src} className="group relative aspect-square overflow-hidden rounded-2xl bg-accent-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="size-full object-cover" />
                    {i === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">Couverture</span>}
                    <button
                      type="button"
                      onClick={() => setImages((l) => l.filter((x) => x !== src))}
                      aria-label="Retirer cette photo"
                      className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/60 text-base text-white transition-colors hover:bg-red-600"
                    >
                      ×
                    </button>
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => move(i, 0)}
                        aria-label="Mettre en couverture"
                        title="Mettre en couverture"
                        className="absolute bottom-1 right-1 grid size-7 place-items-center rounded-full bg-black/60 text-sm text-white transition-colors hover:bg-accent"
                      >
                        ★
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {room > 0 ? (
              <>
                <input
                  type="file"
                  name="gallery"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const files = [...(e.target.files ?? [])];
                    setFileError(null);
                    if (files.length > room) {
                      e.target.value = "";
                      setPreviews([]);
                      return setFileError(`Vous pouvez encore ajouter ${room} photo${room > 1 ? "s" : ""} (${MAX_PROJECT_IMAGES} au maximum).`);
                    }
                    if (files.some((f) => f.size > 2 * 1024 * 1024)) {
                      e.target.value = "";
                      setPreviews([]);
                      return setFileError("Une photo dépasse 2 Mo.");
                    }
                    setPreviews(files.map((f) => URL.createObjectURL(f)));
                  }}
                  className={fileClass}
                />
                {previews.length > 0 && (
                  <ul className="grid grid-cols-2 gap-3 2xl:grid-cols-3">
                    {previews.map((u) => (
                      <li key={u} className="aspect-square overflow-hidden rounded-2xl bg-accent-soft ring-2 ring-accent/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" className="size-full object-cover" />
                      </li>
                    ))}
                  </ul>
                )}
                {previews.length > 0 && <p className="text-xs text-muted">Ces photos seront ajoutées à l&apos;enregistrement.</p>}
              </>
            ) : (
              <p className="text-sm text-muted">Le maximum de {MAX_PROJECT_IMAGES} photos est atteint. Retirez-en une pour en ajouter.</p>
            )}
            {fileError && (
              <p role="alert" className="text-xs font-medium text-red-700">
                {fileError}
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Affichage">
          <div className="grid gap-5">
            <Toggle name="active" label="Visible sur le site" defaultChecked={values.active} />
            <Field label="Ordre d'affichage" hint="Les plus petits numéros apparaissent en premier. Vide : à la fin.">
              <input name="sort" type="number" defaultValue={values.sort} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <FormError message={state?.error} />
        <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="h-12 w-full">
          {values.id ? "Enregistrer la réalisation" : "Créer la réalisation"}
        </SubmitButton>
      </div>
    </form>
  );
}
