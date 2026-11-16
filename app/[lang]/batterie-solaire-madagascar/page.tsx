import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/motion";
import { ProductCard } from "@/components/product-card";
import { RealisationsHero } from "@/components/realisations-hero";
import { CtaBand, SectionHead } from "@/components/ui";
import { getProducts } from "@/lib/content";
import { tr } from "@/lib/data";
import { guides } from "@/lib/guides";
import { cardPrice, priceRange } from "@/lib/options";
import { loadPage } from "@/lib/page";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Batterie solaire à Madagascar : lithium et gel | Prowatt",
  description: "Batteries solaires lithium et gel à Antananarivo, prix en ariary : comparez, choisissez la capacité adaptée et commandez en ligne ou demandez conseil à Prowatt.",
  path: "/batterie-solaire-madagascar",
});

const lithium = ["Capacité exploitable élevée", "Très longue durée de vie", "Légère, compacte, recharge rapide", "Aucun entretien"];
const gel = ["Prix d'achat plus bas", "Technologie éprouvée, scellée", "Idéale pour un usage occasionnel", "Aucun entretien"];

const faq = [
  { q: "Batterie lithium ou gel : laquelle choisir ?", a: "Le lithium coûte plus cher mais dure bien plus longtemps et exploite une plus grande part de sa capacité : il convient à un usage quotidien. Le gel est plus économique et suffit pour un usage occasionnel, comme un kit anti-délestage." },
  { q: "Quelle capacité de batterie me faut-il ?", a: "Additionnez la puissance des appareils à garder allumés multipliée par la durée de coupure à couvrir. Ajoutez une marge, et doublez à peu près la capacité nominale avec une batterie gel. Notre équipe peut faire ce calcul pour vous." },
  { q: "Les batteries sont-elles garanties ?", a: "Le matériel est couvert par une garantie, qui peut aller jusqu'à 10 ans sur le matériel et la pose pour une installation complète. Les conditions exactes sont indiquées sur votre devis." },
  { q: "Peut-on acheter une batterie seule, sans installation ?", a: "Oui, les batteries de la boutique s'achètent en ligne. Pour un système complet (onduleur, panneaux), une étude évite les erreurs de compatibilité." },
];

export default async function SolarBatteryPage({ params }: PageProps<"/[lang]/batterie-solaire-madagascar">) {
  const { lang, dict } = await loadPage(params);
  const d = dict.shop;
  const nf = new Intl.NumberFormat(lang);
  const money = (n: number) => `${nf.format(n)} ${d.currency}`;
  const products = await getProducts();
  const card = (p: (typeof products)[number]) => ({
    id: p.id,
    name: tr(p.name, lang),
    ...cardPrice(p.price, p.oldPrice, p.options, money, d.from),
    href: `/boutique/${p.id}`,
    image: p.image,
    hasOptions: p.options.length > 0,
  });
  const groups = [
    { id: "batterie-lithium", title: "Batteries lithium", items: products.filter((p) => p.category === "batterie-lithium").sort((a, b) => priceRange(a.price, a.options).min - priceRange(b.price, b.options).min).slice(0, 8) },
    { id: "batterie-gel", title: "Batteries gel", items: products.filter((p) => p.category === "batterie-gel").sort((a, b) => priceRange(a.price, a.options).min - priceRange(b.price, b.options).min).slice(0, 8) },
  ];
  const guide = guides.find((g) => g.slug === "batterie-lithium-ou-gel");

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: dict.nav.home, path: "/" },
          { name: "Batteries solaires", path: "/batterie-solaire-madagascar" },
        ])}
      />
      <RealisationsHero
        eyebrow="Batteries solaires"
        title="Batteries solaires à Madagascar : lithium et gel."
        subtitle="Gardez la lumière allumée la nuit et pendant les coupures. Comparez les deux technologies, choisissez la bonne capacité et commandez en ariary."
        points={["Lithium longue durée", "Gel économique", "Conseil sur la capacité"]}
      />

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {[
            { t: "Batterie lithium", s: "Pour un usage quotidien", l: lithium },
            { t: "Batterie gel", s: "Pour démarrer avec un budget serré", l: gel },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 0.1}>
              <div className="glass h-full rounded-3xl p-8">
                <p className="eyebrow">{c.s}</p>
                <h2 className="mt-3 text-3xl tracking-tight">{c.t}</h2>
                <ul className="mt-5 grid gap-3">
                  {c.l.map((x) => (
                    <li key={x} className="flex gap-3 leading-relaxed text-ink/80">
                      <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                        <CheckIcon className="size-3" />
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        {guide && (
          <Reveal className="mx-auto mt-6 max-w-6xl">
            <Link href={`/guides/${guide.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
              Lire le comparatif complet : lithium ou gel ?
              <ArrowIcon className="size-4" />
            </Link>
          </Reveal>
        )}
      </section>

      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.id} className="px-4 py-12 sm:px-6">
              <div className="mx-auto max-w-6xl">
                <SectionHead eyebrow="Boutique" title={g.title} />
                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {g.items.map((p) => (
                    <article key={p.id} className="glass flex h-full flex-col rounded-2xl p-5">
                      <ProductCard item={card(p)} labels={d} />
                    </article>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Link href="/boutique" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                    Voir toute la boutique
                    <ArrowIcon className="size-4" />
                  </Link>
                </div>
              </div>
            </section>
          ),
      )}

      <Faq eyebrow="Questions fréquentes" title="Batteries solaires : vos questions" items={faq} />

      <CtaBand
        title="Quelle batterie pour votre installation ?"
        subtitle="Dites-nous quels appareils garder allumés : nous calculons la capacité et la technologie adaptées."
        primary={{ href: "/devis", label: dict.home.cta.primary }}
        secondary={{ href: "/contact", label: dict.home.cta.secondary }}
      />
    </>
  );
}
