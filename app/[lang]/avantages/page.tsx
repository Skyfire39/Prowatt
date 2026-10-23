import type { Metadata } from "next";
import {
  BatteryIcon,
  DropIcon,
  GridIcon,
  HomeIcon,
  LeafIcon,
  PanelIcon,
  ShieldIcon,
  SunIcon,
  BoltIcon,
  CheckIcon,
} from "@/components/icons";
import { Reveal, HoverLift } from "@/components/motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { loadPage } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/avantages">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.nav.advantages, description: dict.advantagesPage.subtitle };
}

const solIcons = [HomeIcon, BatteryIcon, GridIcon, ShieldIcon, SunIcon, DropIcon];
const benIcons = [BoltIcon, LeafIcon, PanelIcon, ShieldIcon];

export default async function AdvantagesPage({ params }: PageProps<"/[lang]/avantages">) {
  const { lang, dict } = await loadPage(params);
  const d = dict.advantagesPage;

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={d.eyebrow} title={d.solutionsTitle} />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {d.solutions.map((s, i) => {
              const Icon = solIcons[i];
              return (
                <Reveal key={s.title} delay={(i % 3) * 0.08}>
                  <HoverLift className="glass relative h-full overflow-hidden rounded-2xl p-8">
                    <span className="relative grid size-12 place-items-center rounded-2xl bg-accent text-on-accent">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="relative mt-6 text-2xl tracking-tight">{s.title}</h3>
                    <p className="relative mt-2 leading-relaxed text-muted">{s.text}</p>
                  </HoverLift>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={d.eyebrow} title={d.benefitsTitle} />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {d.benefits.map((b, i) => {
              const Icon = benIcons[i];
              return (
                <Reveal key={b.title} delay={(i % 2) * 0.1}>
                  <div className="glass flex h-full gap-5 rounded-2xl p-7">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                      <Icon className="size-6" />
                    </span>
                    <div>
                      <h3 className="text-2xl tracking-tight">{b.title}</h3>
                      <p className="mt-2 leading-relaxed text-muted">{b.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <div className="glass-strong rounded-3xl p-8 text-center sm:p-12">
            <h2 className="text-3xl tracking-tight sm:text-3xl">{d.productsTitle}</h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {d.products.map((p) => (
                <li key={p} className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium">
                  <CheckIcon className="size-4 text-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <CtaBand
        title={dict.home.cta.title}
        subtitle={dict.home.cta.subtitle}
        primary={{ href: `/${lang}/devis`, label: dict.home.cta.primary }}
        secondary={{ href: `/${lang}/contact`, label: dict.home.cta.secondary }}
      />
    </>
  );
}
