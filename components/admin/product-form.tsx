"use client";

import Link from "next/link";
import { saveProductAction } from "@/app/admin/(panel)/produits/actions";
import { Field, FormError, Panel, Toggle, inputClass, selectClass, textareaClass } from "./ui";
import type { ProductOption } from "@/lib/options";
import { SubmitButton, useActionForm } from "./client";
import { OptionsEditor } from "./options-editor";
import { ProductPhotos } from "./product-photos";

export type ProductFormValues = {
  id?: string;
  nameFr: string;
  nameEn: string;
  category: string;
  price: number | "";
  oldPrice: number | "";
  descriptionFr: string;
  descriptionEn: string;
  sku: string;
  stock: number | "";
  addedAt: string;
  bestSeller: boolean;
  active: boolean;
  /** Photos actuelles : la principale d'abord, 4 au plus. */
  photos: string[];
  options: ProductOption[];
};

export function ProductForm({ values, categories }: { values: ProductFormValues; categories: { id: string; name: string }[] }) {
  const { state, onSubmit, pending } = useActionForm(saveProductAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-3">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid gap-6 lg:col-span-2">
        <Panel title="Informations" subtitle="Le nom et la description s'affichent sur la boutique.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom" required className="sm:col-span-2">
              <input name="nameFr" defaultValue={values.nameFr} required className={inputClass} />
            </Field>
            <Field label="Catégorie" required>
              <select name="category" defaultValue={values.category} required className={selectClass}>
                <option value="" disabled>
                  Choisir…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Link href="/admin/produits/categories" className="mt-1.5 inline-block text-xs font-semibold text-accent hover:underline">
                + Ajouter ou renommer une catégorie
              </Link>
            </Field>
            <Field label="Référence (SKU)">
              <input name="sku" defaultValue={values.sku} className={inputClass} placeholder="ex. RAIL-CR20" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea name="descriptionFr" defaultValue={values.descriptionFr} rows={3} className={textareaClass} />
            </Field>
          </div>
        </Panel>

        <Panel title="Prix et stock">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Prix (Ar)" required>
              <input name="price" inputMode="numeric" defaultValue={values.price} required className={inputClass} placeholder="98 000" />
            </Field>
            <Field label="Ancien prix (Ar)" hint="Renseignez-le pour afficher une promotion (prix barré).">
              <input name="oldPrice" inputMode="numeric" defaultValue={values.oldPrice} className={inputClass} placeholder="Facultatif" />
            </Field>
            <Field label="Stock" hint="Laissez vide si vous ne suivez pas le stock.">
              <input name="stock" inputMode="numeric" defaultValue={values.stock} className={inputClass} />
            </Field>
            <Field label="Date d'ajout" hint="Sert au tri « plus récents » et à la section Nouveautés.">
              <input name="addedAt" type="date" defaultValue={values.addedAt} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <OptionsEditor initial={values.options} subject="ce produit" />
      </div>

      <div className="grid content-start gap-6">
        <Panel title="Visibilité">
          <div className="grid gap-5">
            <Toggle name="active" label="Visible sur la boutique" defaultChecked={values.active} hint="Décochez pour masquer sans supprimer." />
            <Toggle name="bestSeller" label="Meilleure vente" defaultChecked={values.bestSeller} hint="Affiché dans l'onglet « Meilleures ventes » de l'accueil." />
          </div>
        </Panel>

        <Panel title="Photos" subtitle="Jusqu'à 4 photos par produit. PNG, JPEG ou WebP, 2 Mo chacune. La première est la photo principale.">
          <ProductPhotos photos={values.photos} />
        </Panel>

        <FormError message={state?.error} />
        <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="h-12 w-full">
          {values.id ? "Enregistrer les modifications" : "Créer le produit"}
        </SubmitButton>
      </div>
    </form>
  );
}
