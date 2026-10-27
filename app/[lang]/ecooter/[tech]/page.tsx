import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowIcon, BatteryIcon, BoltIcon, ClockIcon, LeafIcon, ShieldIcon } from "@/components/icons";
import { ModelCard } from "@/components/model-card";
import { ModelSlider } from "@/components/model-slider";
import { Reveal } from "@/components/motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { getEcooters } from "@/lib/content";
import { isTech, modelHref, techs, tr } from "@/lib/data";
import type { Tech } from "@/lib/data";
import { hasLocale, locales } from "@/lib/i18n";
import { loadPage } from "@/lib/page";
import { getDictionary } from "../../dictionaries";

export function generateStaticParams() {
  return locales.flatMap((lang) => techs.map((tech) => ({ lang, tech })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/ecooter/[tech]">): Promise<Metadata> {
  const { lang, tech } = await params;
  if (!hasLocale(lang) || !isTech(tech)) return {};
  const { ecooter } = await getDictionary(lang);
  return { title: ecooter.techs[tech].title, description: ecooter.techs[tech].intro };
}

export default function TechPage({ params }: PageProps<"/[lang]/ecooter/[tech]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <TechContent params={params} />
    </Suspense>
  );
}

// Icônes des quatre avantages propres à chaque technologie.
const benefitIcons: Record<Tech, (typeof BoltIcon)[]> = {
  lithium: [LeafIcon, ShieldIcon, BoltIcon, ClockIcon],
  graphene: [BoltIcon, LeafIcon, ShieldIcon, BatteryIcon],
};

async function TechContent({ params }: { params: PageProps<"/[lang]/ecooter/[tech]">["params"] }) {
  const { tech } = await params;
  if (!isTech(tech)) notFound();
  const { lang, dict } = await loadPage(params);
  const d = dict.ecooter;
  const t = d.techs[tech];
  const other = techs.find((x) => x !== tech)!;
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
      <PageHero eyebrow={`${d.eyebrow} · ${d.battery}`} title={t.title} subtitle={t.intro}>
        <Link
          href={`/ecooter/${other}`}
          className="glass inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium transition-opacity hover:opacity-85"
        >
          {d.otherTech} : {d.techs[other].name}
          <ArrowIcon className="size-4" />
        </Link>
      </PageHero>

      <section className="px-4 pb-12 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <ModelSlider slides={slides} labels={{ ...d.slider, cta: d.model.view }} battery={t.name} />
        </Reveal>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={t.name} title={t.benefitsTitle} subtitle={t.tagline} />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.benefits.map((b, i) => {
              const Icon = benefitIcons[tech][i];
              return (
                <Reveal key={b.title} delay={i * 0.08}>
                  <div className="glass h-full rounded-3xl p-8">
                    <span className="grid size-12 place-items-center rounded-full bg-accent text-on-accent">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-6 text-2xl leading-snug tracking-tight">{b.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{b.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={`${d.battery} ${t.name}`} title={d.models} subtitle={d.note} />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ecooters.map((m, i) => (
              <ModelCard key={m.id} model={m} lang={lang} dict={d} index={i} active={tech} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={dict.home.cta.title}
        subtitle={dict.home.cta.subtitle}
        primary={{ href: `/contact`, label: dict.home.cta.secondary }}
        secondary={{ href: `/ecooter`, label: d.allModels }}
      />
    </>
  );
}
