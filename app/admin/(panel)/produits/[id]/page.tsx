import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/client";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader, Panel } from "@/components/admin/ui";
import { TrashIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth/session";
import { categories } from "@/lib/data";
import { getDb, schema } from "@/lib/db";
import { deleteProductAction } from "../actions";

export const metadata: Metadata = { title: "Modifier le produit" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("products.write");
  const { id } = await params;
  const db = await getDb();
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  if (!p) notFound();

  return (
    <>
      <PageHeader eyebrow="Catalogue" title={p.nameFr} subtitle={`Référence ${p.sku ?? p.id}`} back={{ href: "/admin/produits", label: "Tous les produits" }} />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name.fr }))}
        values={{
          id: p.id,
          nameFr: p.nameFr,
          nameEn: p.nameEn,
          category: p.category,
          price: p.price,
          oldPrice: p.oldPrice ?? "",
          descriptionFr: p.descriptionFr ?? "",
          descriptionEn: p.descriptionEn ?? "",
          sku: p.sku ?? "",
          stock: p.stock ?? "",
          addedAt: p.addedAt,
          bestSeller: p.bestSeller,
          active: p.active,
          image: p.image,
        }}
      />
      <Panel title="Zone sensible" className="mt-6">
        <form action={deleteProductAction} className="flex flex-wrap items-center justify-between gap-4">
          <input type="hidden" name="id" value={p.id} />
          <p className="max-w-xl text-sm text-muted">
            Supprimer ce produit le retire définitivement de la boutique. Les commandes passées conservent son nom et son prix. Pour le masquer temporairement, décochez « Visible sur la boutique ».
          </p>
          <ConfirmButton title="Supprimer ce produit ?" message={`« ${p.nameFr} » sera retiré définitivement de la boutique.`} confirmLabel="Supprimer">
            <TrashIcon className="size-4" />
            Supprimer
          </ConfirmButton>
        </form>
      </Panel>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
