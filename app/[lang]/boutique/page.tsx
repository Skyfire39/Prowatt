import type { Metadata } from "next";
import Link from "next/link";
import { Shop } from "@/components/shop";
import { PageHero } from "@/components/ui";
import { getCategories, getEcooters, getProducts, getSettings } from "@/lib/content";
import { batteryTechs, modelHref, motoCartId, techs, tr } from "@/lib/data";
import { cardPrice, priceRange } from "@/lib/options";
import { loadPage } from "@/lib/page";
import { pageMetadata } from "@/lib/seo";
import { mailto } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/boutique">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return pageMetadata({ ...dict.seo.boutique, path: "/boutique" });
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
            // Sous-catégories des motos : une moto proposée en Graphène et en Lithium figure dans les deux.
            subs={techs
              .map((t) => ({ id: t, name: dict.ecooter.techs[t].name, count: ecooters.filter((m) => batteryTechs(m.specs.battery, m.options).includes(t)).length }))
              .filter((t) => t.count > 0)}
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
                  techs: batteryTechs(m.specs.battery, m.options),
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
                  techs: batteryTechs(m.specs.battery, m.options),
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

          {/* Liste complète en liens : le filtre ci-dessus ne montre que 12 produits à la fois, ces liens permettent aux robots (et à ceux qui n'utilisent pas les filtres) de trouver chaque fiche. */}
          <nav aria-label={d.catalogue} className="mt-20 border-t border-line pt-10">
            <h2 className="text-3xl tracking-tight">{d.catalogue}</h2>
            <p className="mt-1 text-muted">{d.catalogueHint}</p>
            <div className="mt-8 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => {
                const list = products.filter((p) => p.category === c.id);
                const motos = c.id === "motos-electriques" ? ecooters : [];
                if (list.length + motos.length === 0) return null;
                return (
                  <div key={c.id}>
                    <h3 className="text-lg font-semibold tracking-tight">{tr(c.name, lang)}</h3>
                    <ul className="mt-3 grid gap-1.5 text-sm">
                      {motos.map((m) => (
                        <li key={m.id}>
                          <Link href={modelHref(lang, m.id)} className="text-muted underline-offset-4 hover:text-ink hover:underline">
                            Ecooter {m.name}
                          </Link>
                        </li>
                      ))}
                      {list.map((p) => (
                        <li key={p.id}>
                          <Link href={`/boutique/${p.id}`} className="text-muted underline-offset-4 hover:text-ink hover:underline">
                            {tr(p.name, lang)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </section>
    </>
  );
}
