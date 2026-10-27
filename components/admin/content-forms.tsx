"use client";

import { savePartnerAction, saveTestimonialAction } from "@/app/admin/(panel)/contenu/actions";
import { Field, FormError, Toggle, inputClass, textareaClass } from "./ui";
import { SubmitButton, useActionForm } from "./client";

const fileClass =
  "block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent hover:file:opacity-90";

export type TestimonialValues = { id?: string; name: string; textFr: string; textEn: string; photo: string | null; sort: number; active: boolean };
export type PartnerValues = { id?: string; name: string; logo: string | null; sort: number; active: boolean };

export function TestimonialForm({ values }: { values: TestimonialValues }) {
  const { state, onSubmit, pending } = useActionForm(saveTestimonialAction);
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <Field label="Nom du client" required>
          <input name="name" defaultValue={values.name} required className={inputClass} />
        </Field>
        <Field label="Ordre">
          <input name="sort" type="number" defaultValue={values.sort} className={inputClass} />
        </Field>
      </div>
      <Field label="Témoignage" required hint="400 caractères maximum.">
        <textarea name="textFr" defaultValue={values.textFr} rows={4} required maxLength={400} className={textareaClass} />
      </Field>
      <Field label="Photo" hint="Carrée de préférence — PNG, JPEG ou WebP, 2 Mo maximum.">
        <div className="flex items-center gap-4">
          {values.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={values.photo} alt="" className="size-14 shrink-0 rounded-full object-cover" />
          )}
          <input type="file" name="photo" accept="image/png,image/jpeg,image/webp" className={fileClass} />
        </div>
      </Field>
      <Toggle name="active" label="Affiché sur le site" defaultChecked={values.active} />
      <FormError message={state?.error} />
      <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="w-fit">
        {values.id ? "Enregistrer l'avis" : "Ajouter l'avis"}
      </SubmitButton>
    </form>
  );
}

export function PartnerForm({ values }: { values: PartnerValues }) {
  const { state, onSubmit, pending } = useActionForm(savePartnerAction);
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <Field label="Nom du partenaire" required>
          <input name="name" defaultValue={values.name} required className={inputClass} />
        </Field>
        <Field label="Ordre">
          <input name="sort" type="number" defaultValue={values.sort} className={inputClass} />
        </Field>
      </div>
      <Field label="Logo" required={!values.id} hint="Fond blanc ou transparent — PNG, JPEG ou WebP, 2 Mo maximum.">
        <div className="flex items-center gap-4">
          {values.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={values.logo} alt="" className="size-14 shrink-0 rounded-xl bg-white object-contain p-1" />
          )}
          <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" className={fileClass} />
        </div>
      </Field>
      <Toggle name="active" label="Affiché sur le site" defaultChecked={values.active} />
      <FormError message={state?.error} />
      <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="w-fit">
        {values.id ? "Enregistrer le partenaire" : "Ajouter le partenaire"}
      </SubmitButton>
    </form>
  );
}
