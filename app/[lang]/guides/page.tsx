import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/motion";
import { RealisationsHero } from "@/components/realisations-hero";
import { CtaBand } from "@/components/ui";
import { guides } from "@/lib/guides";
import { loadPage } from "@/lib/page";
import { absoluteUrl, breadcrumbLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Guides solaire et moto électrique à Madagascar | Prowatt",
  description: "Batterie lithium ou gel, délestage Jirama, choisir son installation solaire, moto électrique : les guides pratiques de Prowatt Madagascar.",
  path: "/guides",
});

/** Les pages d'achat que les guides complètent : chacune répond à une recherche précise. */
const shortcuts = [
  { href: "/installation-solaire-madagascar", title: "Installation solaire", text: "Maison, commerce, entreprise" },
  { href: "/batterie-solaire-madagascar", title: "Batteries solaires", text: "Lithium et gel" },
  { href: "/moto-electrique-madagascar", title: "Moto électrique", text: "Scooters Ecooter" },
];

export default async function GuidesPage({ params }: PageProps<"/[lang]/guides">) {
  const { dict } = await loadPage(params);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: dict.nav.home, path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: guides.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/guides/${g.slug}`), name: g.title })),
          },
        ]}
      />
      <RealisationsHero
        eyebrow="Guides"
        title="Bien choisir son énergie solaire et sa moto électrique."
        subtitle="Des réponses simples aux questions que vous nous posez avant d'acheter : batteries, délestage, installation, scooters."
      />

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {guides.map((g, i) => (
            <Reveal key={g.slug} delay={(i % 2) * 0.08}>
              <Link href={`/guides/${g.slug}`} className="glass group flex h-full flex-col rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-8">
                <p className="eyebrow">{g.eyebrow}</p>
                <h2 className="mt-3 text-balance text-2xl leading-snug tracking-tight sm:text-3xl">{g.title}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{g.excerpt}</p>
                <p className="mt-6 flex items-center justify-between text-sm font-semibold text-accent">
                  <span>Lire le guide · {g.minutes} min</span>
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <p className="eyebrow">Passer à l&apos;action</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {shortcuts.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="glass-strong group flex items-center justify-between gap-4 rounded-2xl p-5 transition-opacity hover:opacity-85">
                  <span>
                    <span className="block text-lg font-semibold tracking-tight">{s.title}</span>
                    <span className="text-sm text-muted">{s.text}</span>
                  </span>
                  <ArrowIcon className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <CtaBand
        title={dict.home.cta.title}
        subtitle={dict.home.cta.subtitle}
        primary={{ href: "/devis", label: dict.home.cta.primary }}
        secondary={{ href: "/contact", label: dict.home.cta.secondary }}
      />
    </>
  );
}
