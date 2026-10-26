import type { Metadata } from "next";
import { Shop } from "@/components/shop";
import { PageHero } from "@/components/ui";
import { categories, ecooters, modelHref, products, tr } from "@/lib/data";
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

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Shop
            categories={categories.map((c) => ({
              id: c.id,
              name: tr(c.name, lang),
              count:
                products.filter((p) => p.category === c.id).length +
                (c.id === "motos-electriques" ? ecooters.length : 0),
            }))}
            items={[
              ...products.map((p) => ({
                id: p.id,
                category: p.category,
                name: tr(p.name, lang),
                price: `${nf.format(p.price)} ${d.currency}`,
                priceValue: p.price as number | null,
                addedAt: p.addedAt,
                href: `/${lang}/boutique/${p.id}`,
              })),
              // Les motos Ecooter : fiche dédiée, prix sur demande. Date d'ajout provisoire.
              ...ecooters.map((m) => ({
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
                  photo: m.photo,
                  priceLabel: dict.ecooter.model.priceOnRequest,
                  cta: dict.ecooter.model.view,
                },
              })),
            ]}
            bounds={{
              min: nf.format(Math.min(...products.map((p) => p.price))),
              max: nf.format(Math.max(...products.map((p) => p.price))),
            }}
            labels={d}
            contactHref={mailto(d.mailSubject)}
          />
        </div>
      </section>
    </>
  );
}
