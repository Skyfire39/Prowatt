import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { listCategories } from "@/lib/admin/categories";
import { today } from "@/lib/format";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  await requireUser("products.write");
  const categories = await listCategories();
  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Nouveau produit" back={{ href: "/admin/produits", label: "Tous les produits" }} />
      <ProductForm
        categories={categories}
        values={{ nameFr: "", nameEn: "", category: "", price: "", oldPrice: "", descriptionFr: "", descriptionEn: "", sku: "", stock: "", addedAt: today(), bestSeller: false, active: true, image: null, options: [] }}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
