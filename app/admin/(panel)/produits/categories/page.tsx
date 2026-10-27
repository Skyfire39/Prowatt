import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, Field, Flash, PageHeader, Panel, btn, inputClass } from "@/components/admin/ui";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { MOTO_CATEGORY, listCategories } from "@/lib/admin/categories";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { createCategoryAction, deleteCategoryAction, saveCategoryAction } from "./actions";

export const metadata: Metadata = { title: "Catégories de produits" };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("products.write");
  const { ok } = await searchParams;
  const db = await getDb();
  const [list, counts] = await Promise.all([
    listCategories(),
    db.select({ category: schema.products.category, n: sql<number>`count(*)::int` }).from(schema.products).groupBy(schema.products.category),
  ]);
  const used = new Map(counts.map((c) => [c.category, c.n]));

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow="Catalogue"
        title="Catégories de produits"
        subtitle="Les catégories de la boutique : elles servent de filtres sur le site et au classement des produits. Un changement de nom s'applique aussitôt."
        back={{ href: "/admin/produits", label: "Tous les produits" }}
      />

      <Panel title="Nouvelle catégorie" className="mb-6">
        <form action={createCategoryAction} className="flex flex-wrap items-end gap-3">
          <Field label="Nom de la catégorie" className="min-w-64 flex-1">
            <input name="name" required minLength={2} maxLength={60} className={inputClass} placeholder="ex. Onduleur hybride" />
          </Field>
          <button type="submit" className={`${btn("primary", "md")} gap-2`}>
            <PlusIcon className="size-4" />
            Ajouter
          </button>
        </form>
      </Panel>

      <Panel title={`${list.length} catégorie${list.length > 1 ? "s" : ""}`} subtitle="Le numéro d'ordre règle la place dans la liste des filtres (les plus petits en premier).">
        <ul className="grid gap-3">
          {list.map((c) => {
            const n = used.get(c.id) ?? 0;
            const reserved = c.id === MOTO_CATEGORY;
            return (
              <li key={c.id} className="rounded-2xl border border-line/70 bg-white/40 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <form action={saveCategoryAction} className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={c.id} />
                    <Field label="Nom" className="min-w-56 flex-1">
                      <input name="name" defaultValue={c.name} required minLength={2} maxLength={60} className={inputClass} />
                    </Field>
                    <Field label="Ordre" className="w-24">
                      <input name="sort" type="number" defaultValue={c.sort} className={inputClass} />
                    </Field>
                    <button type="submit" className={btn("soft", "md")}>
                      Enregistrer
                    </button>
                  </form>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={n > 0 ? "teal" : "neutral"}>
                      {n} produit{n > 1 ? "s" : ""}
                    </Badge>
                    {reserved ? (
                      <span className="text-xs text-muted">Réservée aux motos : ne peut pas être supprimée.</span>
                    ) : (
                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton
                          title="Supprimer cette catégorie ?"
                          message={n > 0 ? `${n} produit${n > 1 ? "s utilisent" : " utilise"} « ${c.name} » : déplacez-les d'abord dans une autre catégorie.` : `La catégorie « ${c.name} » sera supprimée.`}
                          confirmLabel="Supprimer"
                        >
                          <TrashIcon className="size-4" />
                          Supprimer
                        </ConfirmButton>
                      </form>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted">Adresse : {c.id}</p>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
