import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, BatteryIcon, BoltIcon, WrenchIcon } from "@/components/icons";
import { Faq } from "@/components/faq";
import { ModelCard } from "@/components/model-card";
import { ModelSlider } from "@/components/model-slider";
import { Reveal } from "@/components/motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { getEcooters } from "@/lib/content";
import { modelHref, techs, tr } from "@/lib/data";
import { loadPage } from "@/lib/page";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/ecooter">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return pageMetadata({ ...dict.seo.ecooter, path: "/ecooter" });
}

const techIcons = [BoltIcon, BatteryIcon, WrenchIcon];

export default async function EcooterPage({ params }: PageProps<"/[lang]/ecooter">) {
  const { lang, dict } = await loadPage(params);
  const d = dict.ecooter;
  const ecooters = await getEcooters();

  const slides = ecooters.map((m) => ({
    id: m.id,
    name: m.name,
    tagline: tr(m.tagline, lang),
    photo: m.productPhoto ?? m.photo,
    cutout: !m.productPhoto,
    specs: m.specs,
    href: modelHref(lang, m.id),
  }));

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />

      <section className="px-4 pb-12 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <ModelSlider slides={slides} labels={{ ...d.slider, cta: d.model.view }} />
        </Reveal>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {techs.map((t, i) => (
            <Reveal key={t} delay={i * 0.1}>
              <Link
                href={`/ecooter/${t}`}
                className="glass-teal group flex h-full flex-col rounded-3xl p-8 transition-transform hover:-translate-y-1 sm:p-10"
              >
                <span className="grid size-12 place-items-center rounded-full bg-lime text-teal">
                  <BatteryIcon className="size-6" />
                </span>
                <h2 className="mt-6 text-4xl tracking-tight">{d.techs[t].name}</h2>
                <p className="mt-2 flex-1 text-lg text-white/75">{d.techs[t].tagline}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-medium text-lime">
                  {d.viewTech}
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={d.eyebrow} title={d.models} subtitle={d.note} />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ecooters.map((m, i) => (
              <ModelCard key={m.id} model={m} lang={lang} dict={d} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={d.eyebrow} title={d.techTitle} />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {d.tech.map((t, i) => {
              const Icon = techIcons[i];
              return (
                <Reveal key={t.title} delay={i * 0.1}>
                  <div className="glass h-full rounded-3xl p-8">
                    <span className="grid size-12 place-items-center rounded-full bg-accent text-on-accent">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-6 text-2xl tracking-tight">{t.title}</h3>
                    <p className="mt-2 text-muted">{t.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Faq eyebrow={d.faq.eyebrow} title={d.faq.title} items={d.faq.items} />

      <CtaBand
        title={dict.home.cta.title}
        subtitle={dict.home.cta.subtitle}
        primary={{ href: `/contact`, label: dict.home.cta.secondary }}
        secondary={{ href: `/devis`, label: dict.home.cta.primary }}
      />
    </>
  );
}
