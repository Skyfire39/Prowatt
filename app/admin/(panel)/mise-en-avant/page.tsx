import type { Metadata } from "next";
import { FeaturedManager } from "@/components/admin/featured-manager";
import { Flash, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { categories } from "@/lib/data";
import { getDb, schema } from "@/lib/db";

export const metadata: Metadata = { title: "Mise en avant" };
const catName = new Map(categories.map((c) => [c.id, c.name.fr]));

export default async function FeaturedPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("content.write");
  const { ok } = await searchParams;
  const db = await getDb();
  const rows = (await db.select().from(schema.products)).sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.nameFr.localeCompare(b.nameFr, "fr"));

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow="Site"
        title="Mise en avant"
        subtitle="Choisissez les produits de la section « Produits à la une » de l'accueil : 4 par onglet (meilleures ventes, nouveautés, promotions)."
      />
      <FeaturedManager
        initial={rows.map((r) => ({
          id: r.id,
          name: r.nameFr,
          category: catName.get(r.category) ?? r.category,
          price: r.price,
          oldPrice: r.oldPrice,
          bestSeller: r.bestSeller,
          active: r.active,
          image: r.image,
        }))}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
