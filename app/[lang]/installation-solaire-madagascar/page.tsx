import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { ArrowIcon, BatteryIcon, DropIcon, GridIcon, HomeIcon, ShieldIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/motion";
import { RealisationsHero } from "@/components/realisations-hero";
import { CtaBand, SectionHead } from "@/components/ui";
import { WhyCards } from "@/components/why-cards";
import { guides } from "@/lib/guides";
import { slugs } from "@/lib/data";
import type { Slug } from "@/lib/data";
import { loadPage } from "@/lib/page";
import { absoluteUrl, breadcrumbLd, pageMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Installation solaire à Madagascar : maison, commerce | Prowatt",
  description: "Panneaux solaires, batteries et onduleurs à Antananarivo : solutions autonome, hybride, on-grid et anti-délestage. Étude personnalisée gratuite, garantie jusqu'à 10 ans.",
  path: "/installation-solaire-madagascar",
});

const icons: Record<Slug, typeof HomeIcon> = {
  "100-autonome": HomeIcon,
  hybride: BatteryIcon,
  ongrid: GridIcon,
  "anti-delestage": ShieldIcon,
  "acces-a-eau": DropIcon,
};

const faq = [
  { q: "Combien coûte une installation solaire à Madagascar ?", a: "Le prix dépend de votre consommation, de la puissance de l'onduleur, de la capacité des batteries et du nombre de panneaux. Une pré-analyse gratuite de vos besoins permet de vous remettre un devis détaillé, avec une projection de la production solaire." },
  { q: "Quelle garantie sur l'installation ?", a: "Prowatt propose une garantie pouvant aller jusqu'à 10 ans sur le matériel et la pose. La durée et les conditions exactes figurent sur votre devis." },
  { q: "Où intervenez-vous ?", a: "Nous sommes basés à Antananarivo, à Ankadifotsy. Contactez-nous pour connaître les conditions d'intervention dans votre région." },
  { q: "Que faut-il préparer pour demander un devis ?", a: "Vos dernières factures d'électricité, la liste des équipements à alimenter et quelques informations sur le logement ou le site. Le formulaire de devis vous guide pas à pas." },
  { q: "Peut-on commencer petit et agrandir plus tard ?", a: "Souvent oui, si l'onduleur et le câblage sont prévus pour. C'est un point à valider dès l'étude." },
];

export default async function SolarInstallationPage({ params }: PageProps<"/[lang]/installation-solaire-madagascar">) {
  const { dict } = await loadPage(params);
  const steps = dict.home.steps;
  const guide = guides.find((g) => g.slug === "quelle-installation-solaire-maison-madagascar");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: dict.nav.home, path: "/" },
            { name: "Installation solaire", path: "/installation-solaire-madagascar" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Installation solaire à Madagascar",
            serviceType: "Installation de panneaux solaires, batteries et onduleurs",
            url: absoluteUrl("/installation-solaire-madagascar"),
            areaServed: { "@type": "Country", name: "Madagascar" },
            provider: { "@type": "Organization", name: "Prowatt Madagascar", url: SITE_URL },
          },
        ]}
      />
      <RealisationsHero
        eyebrow="Installation solaire"
        title="L'énergie solaire, installée de l'étude à la garantie."
        subtitle="Maison, commerce ou entreprise : panneaux solaires, batteries et onduleurs dimensionnés pour votre consommation, à Antananarivo et à Madagascar."
        points={["Pré-analyse gratuite", "Installation par nos techniciens", "Garantie jusqu'à 10 ans"]}
      />

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow="Nos solutions" title="Une installation pour chaque besoin." subtitle="Choisissez la famille de solutions qui correspond à votre situation, nous dimensionnons le reste." />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {slugs.map((s, i) => {
              const Icon = icons[s];
              const c = dict.categories[s];
              return (
                <Reveal key={s} delay={(i % 3) * 0.08}>
                  <Link href={`/realisations/${s}`} className="glass group relative flex h-full flex-col rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1">
                    <span className="grid size-12 place-items-center rounded-2xl bg-accent text-on-accent">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-6 text-2xl tracking-tight">{c.name}</h3>
                    <p className="mt-2 flex-1 leading-relaxed text-muted">{c.short}</p>
                    <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent">
                      Voir nos réalisations
                      <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={steps.eyebrow} title={steps.title} />
          <ol className="mt-14 grid gap-4 md:grid-cols-5">
            {steps.items.map((it, i) => (
              <Reveal key={it.title} delay={i * 0.07}>
                <li className="glass h-full rounded-3xl p-6">
                  <span className="grid size-10 place-items-center rounded-full bg-accent text-sm font-semibold text-on-accent tabular-nums">{i + 1}</span>
                  <h3 className="mt-4 text-xl leading-snug tracking-tight">{it.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{it.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={dict.home.why.eyebrow} title={dict.home.why.title} />
          <WhyCards items={dict.home.why.items} />
        </div>
      </section>

      {guide && (
        <section className="px-4 py-6 sm:px-6">
          <Reveal className="mx-auto max-w-6xl">
            <Link href={`/guides/${guide.slug}`} className="glass-strong group flex flex-wrap items-center justify-between gap-4 rounded-3xl p-7 sm:p-9">
              <span>
                <span className="eyebrow">Guide</span>
                <span className="mt-2 block text-2xl leading-snug tracking-tight sm:text-3xl">{guide.title}</span>
              </span>
              <ArrowIcon className="size-5 text-accent transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </section>
      )}

      <Faq eyebrow="Questions fréquentes" title="Installer du solaire : vos questions" items={faq} />

      <CtaBand
        title={dict.home.cta.title}
        subtitle={dict.home.cta.subtitle}
        primary={{ href: "/devis", label: dict.home.cta.primary }}
        secondary={{ href: "/contact", label: dict.home.cta.secondary }}
      />
    </>
  );
}
