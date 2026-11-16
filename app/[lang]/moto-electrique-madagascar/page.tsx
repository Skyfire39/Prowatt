import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { ArrowIcon, BatteryIcon, BoltIcon, LeafIcon, ShieldIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { MotoCard } from "@/components/moto-card";
import { Reveal } from "@/components/motion";
import { RealisationsHero } from "@/components/realisations-hero";
import { CtaBand, SectionHead } from "@/components/ui";
import { getEcooters } from "@/lib/content";
import { modelHref, techs } from "@/lib/data";
import { guides } from "@/lib/guides";
import { priceRange } from "@/lib/options";
import { loadPage } from "@/lib/page";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Moto électrique à Madagascar : scooters Ecooter | Prowatt",
  description: "Motos et scooters électriques Ecooter à Antananarivo : batterie lithium ou graphène, zéro carburant, prix en ariary. Découvrez les modèles et demandez un essai.",
  path: "/moto-electrique-madagascar",
});

const perks = [
  { icon: LeafIcon, title: "Zéro carburant", text: "On recharge sur une prise : plus de pompe, plus de plein à payer." },
  { icon: BoltIcon, title: "Entretien réduit", text: "Pas de vidange, de bougies ni de filtre à changer." },
  { icon: BatteryIcon, title: "Lithium ou graphène", text: "Deux technologies de batterie, selon votre usage et votre budget." },
  { icon: ShieldIcon, title: "Garantie", text: "Un équipement fiable, garanti sur le matériel." },
];

const faq = [
  { q: "Combien de temps faut-il pour recharger une moto électrique ?", a: "Le temps de charge est indiqué sur la fiche de chaque modèle. En général, une charge complète se fait en quelques heures, ce qui permet de recharger la nuit ou pendant la journée de travail." },
  { q: "Lithium ou graphène : quelle batterie choisir ?", a: "Le lithium est plus léger, dure plus longtemps et se recharge plus vite ; le graphène offre robustesse, performance et un budget maîtrisé. Chaque technologie a sa page détaillée." },
  { q: "Peut-on recharger avec des panneaux solaires ?", a: "Oui. Avec une installation adaptée, vous rechargez avec l'électricité que vous produisez vous-même : la mobilité devient quasi gratuite." },
  { q: "Comment acheter une moto Ecooter ?", a: "Les modèles affichés avec un prix s'achètent directement dans la boutique. Pour les autres, ouvrez la fiche du modèle pour demander le prix ou un essai." },
];

export default async function ElectricMotorbikePage({ params }: PageProps<"/[lang]/moto-electrique-madagascar">) {
  const { lang, dict } = await loadPage(params);
  const e = dict.ecooter;
  const nf = new Intl.NumberFormat(lang);
  const models = await getEcooters();
  const guide = guides.find((g) => g.slug === "moto-electrique-madagascar-guide");

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: dict.nav.home, path: "/" },
          { name: "Moto électrique", path: "/moto-electrique-madagascar" },
        ])}
      />
      <RealisationsHero
        eyebrow="Mobilité électrique"
        title="Moto électrique à Madagascar : les scooters Ecooter."
        subtitle="Silencieux, économiques à l'usage, rechargeables sur une prise : choisissez votre modèle et sa batterie lithium ou graphène."
        points={["Zéro carburant", "Lithium ou graphène", "Prix en ariary"]}
      />

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow="Nos modèles" title="Trouvez le scooter de vos trajets." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((m, i) => (
              <Reveal key={m.id} delay={(i % 3) * 0.08}>
                <article className="glass flex h-full flex-col rounded-2xl p-5">
                  <MotoCard
                    item={{
                      name: m.name,
                      href: modelHref(lang, m.id),
                      photo: m.productPhoto ?? m.photo,
                      priceLabel: m.price ? `${m.options.length > 0 ? `${dict.shop.from} ` : ""}${nf.format(priceRange(m.price, m.options).min)} ${dict.shop.currency}` : e.model.priceOnRequest,
                      cta: e.model.view,
                    }}
                  />
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/ecooter" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
              Voir toute la gamme Ecooter
              <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow="Pourquoi l'électrique" title="Le plein, c'est une prise." />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <li className="glass h-full rounded-3xl p-7">
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent text-on-accent">
                    <p.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-xl tracking-tight">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{p.text}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={e.battery} title="Deux technologies de batterie." />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {techs.map((t, i) => (
              <Reveal key={t} delay={i * 0.1}>
                <Link href={`/ecooter/${t}`} className="glass group flex h-full flex-col rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1">
                  <p className="eyebrow">{e.techs[t].name}</p>
                  <h3 className="mt-3 text-3xl tracking-tight">{e.techs[t].title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-muted">{e.techs[t].tagline}</p>
                  <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent">
                    Découvrir
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
          {guide && (
            <Reveal className="mt-6">
              <Link href={`/guides/${guide.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                Lire le guide : ce qu&apos;il faut savoir avant d&apos;acheter
                <ArrowIcon className="size-4" />
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      <Faq eyebrow="Questions fréquentes" title="Moto électrique : vos questions" items={faq} />

      <CtaBand
        title="Prêt à rouler en électrique ?"
        subtitle="Parlez-nous de vos trajets : nous vous conseillons le modèle et la batterie adaptés."
        primary={{ href: "/contact", label: dict.home.cta.secondary }}
        secondary={{ href: "/boutique", label: dict.nav.shop }}
      />
    </>
  );
}
