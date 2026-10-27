import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCart } from "@/components/add-to-cart";
import { CheckIcon, ChevronIcon, PhoneIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { ProductArt } from "@/components/product-art";
import { ProductDescription } from "@/components/product-description";
import { ProductCard } from "@/components/product-card";
import { ButtonLink } from "@/components/ui";
import { getProducts, getSettings } from "@/lib/content";
import { categories, tr } from "@/lib/data";
import { hasLocale, locales } from "@/lib/i18n";
import { loadPage } from "@/lib/page";
import { toSiteInfo } from "@/lib/site-info";
import { getDictionary } from "../../dictionaries";

export async function generateStaticParams() {
  const products = await getProducts();
  return locales.flatMap((lang) => products.map((p) => ({ lang, id: p.id })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/boutique/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  if (!hasLocale(lang) || !product) return {};
  const dict = await getDictionary(lang);
  const category = tr(categories.find((c) => c.id === product.category)!.name, lang);
  return {
    title: tr(product.name, lang),
    description: dict.product.about.replace("{name}", tr(product.name, lang)).replace("{category}", category),
  };
}

export default function ProductPage({ params }: PageProps<"/[lang]/boutique/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: PageProps<"/[lang]/boutique/[id]">["params"] }) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  const { lang, dict } = await loadPage(params);
  const site = toSiteInfo(await getSettings());

  const d = dict.product;
  const currency = dict.shop.currency;
  const nf = new Intl.NumberFormat(lang);
  const name = tr(product.name, lang);
  const category = tr(categories.find((c) => c.id === product.category)!.name, lang);
  const base = `/${lang}`;

  const related = [
    ...products.filter((p) => p.category === product.category && p.id !== product.id),
    ...products.filter((p) => p.category !== product.category),
  ].slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: product.id,
    category,
    offers: { "@type": "Offer", price: product.price, priceCurrency: "MGA", availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <Reveal y={10}>
            <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href={base} className="hover:text-ink">{dict.nav.home}</Link>
                </li>
                <ChevronIcon className="size-3.5 -rotate-90" />
                <li>
                  <Link href={`${base}/boutique`} className="hover:text-ink">{dict.nav.shop}</Link>
                </li>
                <ChevronIcon className="size-3.5 -rotate-90" />
                <li aria-current="page" className="line-clamp-1 font-medium text-ink">{name}</li>
              </ol>
            </nav>
          </Reveal>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Visuel : reste visible pendant la lecture de la fiche (desktop) */}
            <Reveal y={30} className="grid content-start gap-6 lg:col-span-7">
              <div className="glass border-teal/25 shadow-none relative overflow-hidden rounded-3xl p-6 sm:p-10">
                {!product.image && (
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/55"
                  />
                )}
                <span className="glass-chip relative z-10 inline-block rounded-full px-4 py-1.5 text-xs font-semibold">
                  {category}
                </span>
                {product.image ? (
                  <div className="relative mx-auto mt-3 aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-teal/15 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={name} className="absolute inset-0 size-full object-contain p-6" />
                  </div>
                ) : (
                  <div className="relative mx-auto aspect-[4/3] w-full max-w-xl">
                    <ProductArt />
                  </div>
                )}
                {product.id.length <= 24 && (
                  <p className="relative mt-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    {d.ref} {product.id.toUpperCase()}
                  </p>
                )}
              </div>
              {product.description?.[lang]?.trim() && (
                <ProductDescription title={d.aboutTitle} text={product.description[lang]!.trim()} />
              )}
            </Reveal>

            {/* Informations et achat */}
            <div className="lg:col-span-5">
              <Reveal y={24} delay={0.08}>
                <Link
                  href={`${base}/boutique`}
                  className="eyebrow transition-opacity hover:opacity-80"
                >
                  {category}
                </Link>
                <h1 className="mt-3 text-balance text-4xl leading-[1.05] tracking-[-0.035em] sm:text-5xl">{name}</h1>
                {product.oldPrice && (
                  <p className="mt-5 text-lg tabular-nums text-muted line-through">
                    {nf.format(product.oldPrice)} {currency}
                  </p>
                )}
                <p className={`${product.oldPrice ? "mt-1" : "mt-5"} text-5xl font-semibold tabular-nums tracking-tight text-accent`}>
                  {nf.format(product.price)} <span className="text-2xl text-muted">{currency}</span>
                </p>
              </Reveal>

              <Reveal y={24} delay={0.16} className="glass border-teal/25 shadow-none mt-8 rounded-3xl p-5 sm:p-6">
                <AddToCart
                  id={product.id}
                  name={name}
                  price={product.price}
                  lang={lang}
                  currency={currency}
                  labels={d}
                  checkoutHref={`${base}/commande`}
                />
              </Reveal>

              <Reveal y={24} delay={0.24} className="mt-6 grid gap-3">
                {!product.description?.[lang]?.trim() && (
                  <details open className="glass border-teal/25 shadow-none group rounded-2xl p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {d.aboutTitle}
                    <ChevronIcon className="size-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">
                    {product.description?.[lang]?.trim() || d.about.replace("{name}", name).replace("{category}", category)}
                  </p>
                </details>
                )}

                <details className="glass border-teal/25 shadow-none group rounded-2xl p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {d.orderTitle}
                    <ChevronIcon className="size-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="mt-3 space-y-3 text-muted">
                    {d.orderPoints.map((point) => (
                      <li key={point} className="flex gap-3 leading-relaxed">
                        <CheckIcon className="mt-1 size-4 shrink-0 text-accent" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <a href={site.phoneHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                    <PhoneIcon className="size-4" />
                    {site.phone}
                  </a>
                </details>

                <div className="glass-lime border-teal/20 shadow-none rounded-2xl p-5">
                  <p className="text-xl font-semibold tracking-tight">{d.helpTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed opacity-80">{d.helpText}</p>
                  <div className="mt-4">
                    <ButtonLink href={`${base}/devis`} variant="teal" arrow>
                      {d.helpCta}
                    </ButtonLink>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-4xl tracking-tight sm:text-5xl">{d.similar}</h2>
          </Reveal>
          <Reveal>
            <div className="swipe-row swipe-cards mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <article key={p.id} className="glass border-teal/25 shadow-none flex h-full flex-col rounded-2xl p-6">
                  <ProductCard
                    item={{
                      id: p.id,
                      name: tr(p.name, lang),
                      price: `${nf.format(p.price)} ${currency}`,
                      href: `${base}/boutique/${p.id}`,
                      image: p.image,
                      oldPrice: p.oldPrice ? `${nf.format(p.oldPrice)} ${currency}` : undefined,
                    }}
                    labels={dict.shop}
                  />
                </article>
              ))}
            </div>
          </Reveal>
          <div className="mt-10">
            <ButtonLink href={`${base}/boutique`} variant="glass">
              {d.backToShop}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
