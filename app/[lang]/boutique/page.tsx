import type { Metadata } from "next";
import { Shop } from "@/components/shop";
import { PageHero } from "@/components/ui";
import { getCategories, getEcooters, getProducts, getSettings } from "@/lib/content";
import { modelHref, motoCartId, tr } from "@/lib/data";
import { cardPrice, priceRange } from "@/lib/options";
import { loadPage } from "@/lib/page";
import { mailto } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/boutique">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.nav.shop, description: dict.shop.subtitle };
}

export default async function ShopPage({ params }: PageProps<"/[lang]/boutique">) {
  const { lang, dict } = await loadPage(params);
  const d = dict.shop;
  const nf = new Intl.NumberFormat(lang);
  const [products, ecooters, settings, categories] = await Promise.all([getProducts(), getEcooters(), getSettings(), getCategories()]);

  const money = (n: number) => `${nf.format(n)} ${d.currency}`;
  const prices = [...products.map((p) => p.price), ...ecooters.flatMap((m) => (m.price ? [m.price] : []))];

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Shop
            // Une catégorie sans produit n'apparaît pas dans les filtres.
            categories={categories
              .map((c) => ({
                id: c.id,
                name: tr(c.name, lang),
                count: products.filter((p) => p.category === c.id).length + (c.id === "motos-electriques" ? ecooters.length : 0),
              }))
              .filter((c) => c.count > 0)}
            items={[
              ...products.map((p) => ({
                id: p.id,
                category: p.category,
                name: tr(p.name, lang),
                ...cardPrice(p.price, p.oldPrice, p.options, money, d.from),
                priceValue: priceRange(p.price, p.options).min as number | null,
                addedAt: p.addedAt,
                href: `/boutique/${p.id}`,
                image: p.image,
              })),
              // Motos Ecooter avec un prix : achat direct au panier, la fiche du modèle reste un clic plus loin.
              ...ecooters
                .filter((m) => m.price)
                .map((m) => ({
                  id: motoCartId(m.id),
                  category: "motos-electriques",
                  name: `Ecooter ${m.name}`,
                  ...cardPrice(m.price!, undefined, m.options, money, d.from),
                  priceValue: priceRange(m.price!, m.options).min as number | null,
                  addedAt: "2025-01-01",
                  href: modelHref(lang, m.id),
                  image: m.productPhoto ?? m.photo,
                })),
              // Motos sans prix : fiche dédiée, prix sur demande.
              ...ecooters
                .filter((m) => !m.price)
                .map((m) => ({
                  id: `ecooter-${m.id}`,
                  category: "motos-electriques",
                  name: `Ecooter ${m.name}`,
                  price: "",
                  priceValue: null as number | null,
                  addedAt: "2025-01-01",
                  href: modelHref(lang, m.id),
                  moto: {
                    name: m.name,
                    href: modelHref(lang, m.id),
                    photo: m.productPhoto ?? m.photo,
                    priceLabel: dict.ecooter.model.priceOnRequest,
                    cta: dict.ecooter.model.view,
                  },
                })),
            ]}
            bounds={{
              min: nf.format(Math.min(...prices)),
              max: nf.format(Math.max(...prices)),
            }}
            labels={d}
            contactHref={mailto(d.mailSubject, "", settings.company.email)}
          />
        </div>
      </section>
    </>
  );
}
