import type { Metadata } from "next";
import { Shop } from "@/components/shop";
import { PageHero } from "@/components/ui";
import { categories, products, tr } from "@/lib/data";
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
              count: products.filter((p) => p.category === c.id).length,
            }))}
            items={products.map((p) => ({
              id: p.id,
              category: p.category,
              name: tr(p.name, lang),
              price: `${nf.format(p.price)} ${d.currency}`,
            }))}
            labels={d}
            contactHref={mailto(d.mailSubject)}
          />
        </div>
      </section>
    </>
  );
}
