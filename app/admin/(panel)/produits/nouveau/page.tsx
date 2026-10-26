import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { categories } from "@/lib/data";
import { today } from "@/lib/format";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  await requireUser("products.write");
  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Nouveau produit" back={{ href: "/admin/produits", label: "Tous les produits" }} />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name.fr }))}
        values={{ nameFr: "", nameEn: "", category: "", price: "", oldPrice: "", descriptionFr: "", descriptionEn: "", sku: "", stock: "", addedAt: today(), bestSeller: false, active: true, image: null }}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
