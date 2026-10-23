import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { partners, slugs, testimonials, tr } from "@/lib/data";
import type { Slug } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { MotoArt } from "./art";
import { Counter } from "./counter";
import {
  ArrowIcon,
  BatteryIcon,
  BoltIcon,
  BuildingIcon,
  DropIcon,
  FactoryIcon,
  GridIcon,
  HomeIcon,
  LampIcon,
  LeafIcon,
  PanelIcon,
  QuoteIcon,
  ShieldIcon,
  WrenchIcon,
  MapPinIcon,
} from "./icons";
import { HoverLift, Reveal } from "./motion";
import { ButtonLink, SectionHead } from "./ui";

type Home = Dictionary["home"];

export function Stats({ lang, labels }: { lang: Locale; labels: Home["stats"] }) {
  const values = [site.stats.kwc, site.stats.clients, site.stats.co2];
  const nf = new Intl.NumberFormat(lang);
  return (
    <section className="px-4 py-6 sm:px-6">
      <Reveal className="mx-auto max-w-6xl">
        <div className="glass-strong grid divide-y divide-line rounded-[2.5rem] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {values.map((v, i) => (
            <div key={labels[i]} className="px-6 py-8 text-center sm:py-10">
              <p className="text-gradient text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                <Counter value={v} display={nf.format(v)} locale={lang} />
              </p>
              <p className="mt-2 text-sm font-medium text-muted">{labels[i]}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export function Mission({ dict }: { dict: Home["message"] }) {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="mx-auto max-w-4xl text-center">
        <QuoteIcon className="mx-auto size-10 text-accent" />
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          {dict.eyebrow}
        </p>
        <blockquote className="mt-5 text-balance text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
          « {dict.quote} »
        </blockquote>
        <p className="mt-6 font-medium">{dict.author}</p>
        <p className="text-sm text-muted">{dict.role}</p>
      </Reveal>
    </section>
  );
}

const blockIcons = [BoltIcon, DropIcon, WrenchIcon];
const typeIcons: Record<Slug, typeof BoltIcon> = {
  "100-autonome": HomeIcon,
  hybride: BatteryIcon,
  ongrid: GridIcon,
  "anti-delestage": ShieldIcon,
  "acces-a-eau": DropIcon,
};

export function Solutions({
  lang,
  dict,
  categories,
}: {
  lang: Locale;
  dict: Home["solutions"];
  categories: Dictionary["categories"];
}) {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} subtitle={dict.subtitle} />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {dict.blocks.map((b, i) => {
            const Icon = blockIcons[i];
            return (
              <Reveal key={b.title} delay={i * 0.08}>
                <HoverLift className="glass relative h-full overflow-hidden rounded-[2rem] p-8">
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 size-36 rounded-full bg-lime/60 blur-2xl dark:bg-lime/20"
                  />
                  <span className="relative grid size-12 place-items-center rounded-2xl bg-accent text-on-accent">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="relative mt-6 text-xl font-semibold tracking-tight">{b.title}</h3>
                  <p className="relative mt-2 leading-relaxed text-muted">{b.text}</p>
                </HoverLift>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-16">
          <h3 className="text-center text-lg font-semibold text-muted">{dict.typesTitle}</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {slugs.map((slug) => {
              const Icon = typeIcons[slug];
              const c = categories[slug];
              return (
                <Link
                  key={slug}
                  href={`/${lang}/realisations/${slug}`}
                  className="glass group flex flex-col rounded-3xl p-5 transition-transform hover:-translate-y-1"
                >
                  <Icon className="size-6 text-accent" />
                  <span className="mt-4 font-semibold leading-snug">{c.name}</span>
                  <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{c.short}</span>
                  <ArrowIcon className="mt-4 size-4 text-accent transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function EcooterTeaser({ lang, dict }: { lang: Locale; dict: Home["ecooter"] }) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-teal p-8 text-white sm:p-14 dark:bg-[#0c3a35]">
          <div aria-hidden="true" className="absolute -left-24 -top-24 size-96 rounded-full bg-lime/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-32 right-0 size-96 rounded-full bg-lime/20 blur-3xl" />
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-lime">
                {dict.eyebrow}
              </p>
              <h2 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                {dict.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/75">{dict.subtitle}</p>
              <div className="mt-9">
                <ButtonLink href={`/${lang}/ecooter`} variant="lime" arrow>
                  {dict.cta}
                </ButtonLink>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-6 rounded-full bg-lime/25 blur-3xl" aria-hidden="true" />
              <div className="relative rounded-[2.25rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                <MotoArt className="w-full text-white [--moto-a:#6fd0bd] [--moto-b:#3aa592]" />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Steps({ dict }: { dict: Home["steps"] }) {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {dict.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="glass relative h-full overflow-hidden rounded-[2rem] p-6">
                <span
                  aria-hidden="true"
                  className="text-gradient absolute -right-1 -top-3 text-[7rem] font-semibold leading-none opacity-30"
                >
                  {i + 1}
                </span>
                <LeafIcon className="relative size-6 text-accent" />
                <h3 className="relative mt-5 text-lg font-semibold leading-snug tracking-tight">
                  {item.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const advIcons = [ShieldIcon, BoltIcon, BatteryIcon, PanelIcon];

export function SolarAdvantages({ dict }: { dict: Home["advantages"] }) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {dict.items.map((item, i) => {
            const Icon = advIcons[i];
            return (
              <Reveal key={item.title} delay={(i % 2) * 0.1}>
                <div className="glass flex h-full gap-5 rounded-[2rem] p-7">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const audIcons = [HomeIcon, BuildingIcon, FactoryIcon];

export function Audiences({ dict }: { dict: Home["audiences"] }) {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {dict.items.map((item, i) => {
            const Icon = audIcons[i];
            return (
              <Reveal key={item.title} delay={i * 0.1}>
                <HoverLift className="glass h-full rounded-[2rem] p-8 text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-on-accent">
                    <Icon className="size-7" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-muted">{item.text}</p>
                </HoverLift>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ lang, dict }: { lang: Locale; dict: Home["testimonials"] }) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="glass flex h-full flex-col rounded-[2rem] p-7">
                <QuoteIcon className="size-7 text-accent" />
                <blockquote className="mt-4 flex-1 leading-relaxed">{tr(t.text, lang)}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-semibold text-on-accent">
                    {t.name[0]}
                  </span>
                  <span className="text-sm font-medium">{t.name}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners({ dict }: { dict: Home["partners"] }) {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          {partners.map((p) => (
            <span key={p} className="glass rounded-full px-6 py-3 text-[15px] font-semibold">
              {p}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

const whyIcons = [WrenchIcon, ShieldIcon, LampIcon, MapPinIcon];

export function Why({ dict }: { dict: Home["why"] }) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {dict.items.map((item, i) => {
            const Icon = whyIcons[i];
            return (
              <Reveal key={item.title} delay={(i % 2) * 0.1}>
                <div className="glass flex h-full gap-5 rounded-[2rem] p-7">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
