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
} from "@/components/icons";
import { AdvantagesBanner } from "@/components/advantages-banner";
import { Faq } from "@/components/faq";
import { EquipmentGrid } from "@/components/equipment-grid";
import { Reveal, HoverLift } from "@/components/motion";
import { CtaBand, PageHero, SectionHead } from "@/components/ui";
import { getSettings } from "@/lib/content";
import { loadPage } from "@/lib/page";
import { toSiteInfo } from "@/lib/site-info";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/avantages">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return pageMetadata({ ...dict.seo.avantages, path: "/avantages" });
}

const solIcons = [HomeIcon, BatteryIcon, GridIcon, ShieldIcon, SunIcon, DropIcon];
const benIcons = [BoltIcon, LeafIcon, PanelIcon, ShieldIcon];

export default async function AdvantagesPage({ params }: PageProps<"/[lang]/avantages">) {
  const { dict } = await loadPage(params);
  const d = dict.advantagesPage;
  const site = toSiteInfo(await getSettings());
  const faq = d.faq.items.map((it) => ({ q: it.q, a: it.a.replace("{address}", site.address.fr).replace("{hours}", site.hours.fr.join(" ; ")) }));

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />
      <AdvantagesBanner
        items={d.benefits.map((b, i) => ({ title: b.title, text: b.text, chip: d.banner.chips[i] }))}
        labels={{ kicker: d.banner.kicker, hint: d.banner.hint, stat: d.banner.stat, aria: d.banner.aria, cta: d.banner.cta, devisHref: "/devis" }}
      />

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
            <EquipmentGrid items={d.products.map((name, i) => ({ name, text: d.productsText[i] }))} />
          </div>
        </Reveal>
      </section>

      <Faq eyebrow={d.faq.eyebrow} title={d.faq.title} items={faq} />

      <CtaBand
        title={dict.home.cta.title}
        subtitle={dict.home.cta.subtitle}
        primary={{ href: `/devis`, label: dict.home.cta.primary }}
        secondary={{ href: `/contact`, label: dict.home.cta.secondary }}
      />
    </>
  );
}
