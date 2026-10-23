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
        <div className="grid divide-y divide-white/15 rounded-3xl bg-teal text-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {values.map((v, i) => (
            <div key={labels[i]} className="px-8 py-10 sm:py-14">
              <p className="text-7xl leading-none tracking-tight tabular-nums text-lime sm:text-8xl" style={{ fontFamily: "var(--font-display)" }}>
                <Counter value={v} display={nf.format(v)} locale={lang} />
              </p>
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.14em] text-white/70">{labels[i]}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export function Mission({ dict }: { dict: Home["message"] }) {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-36">
      <Reveal className="mx-auto max-w-5xl">
        <p className="eyebrow">{dict.eyebrow}</p>
        <blockquote className="mt-8 text-balance text-4xl italic leading-[1.1] tracking-tight sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
          « {dict.quote} »
        </blockquote>
        <p className="mt-10 flex items-center gap-4 text-sm">
          <span className="h-px w-10 bg-ink/40" />
          <span>
            <span className="font-semibold">{dict.author}</span>
            <span className="text-muted"> · {dict.role}</span>
          </span>
        </p>
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
                <HoverLift className="glass relative h-full overflow-hidden rounded-2xl p-8">
                  <span className="relative grid size-12 place-items-center rounded-2xl bg-accent text-on-accent">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="relative mt-6 text-2xl tracking-tight">{b.title}</h3>
                  <p className="relative mt-2 leading-relaxed text-muted">{b.text}</p>
                </HoverLift>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-16">
          <p className="eyebrow">{dict.typesTitle}</p>
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
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-teal p-8 text-white sm:p-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow !text-lime">{dict.eyebrow}</p>
            <h2 className="mt-5 text-balance text-5xl leading-[1] tracking-tight sm:text-6xl">{dict.title}</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">{dict.subtitle}</p>
            <div className="mt-9">
              <ButtonLink href={`/${lang}/ecooter`} variant="lime" arrow>
                {dict.cta}
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-2xl bg-white/[0.07] p-6 sm:p-10">
            <MotoArt className="w-full [--moto-a:#c8e0a2] [--moto-b:#f6f8f0] [--moto-line:#f6f8f0]" />
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
              <div className="glass relative h-full overflow-hidden rounded-2xl p-6">
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-2 font-display text-[5.5rem] leading-none text-accent opacity-25"
                >
                  {i + 1}
                </span>
                <LeafIcon className="relative size-6 text-accent" />
                <h3 className="relative mt-5 text-2xl leading-snug tracking-tight">
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
                <div className="glass flex h-full gap-5 rounded-2xl p-7">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="text-2xl tracking-tight">{item.title}</h3>
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
                <HoverLift className="glass h-full rounded-2xl p-8 text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-on-accent">
                    <Icon className="size-7" />
                  </span>
                  <h3 className="mt-6 text-2xl tracking-tight">{item.title}</h3>
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
              <figure className="glass flex h-full flex-col rounded-2xl p-7">
                <QuoteIcon className="size-7 text-accent" />
                <blockquote className="mt-4 flex-1 font-display text-2xl leading-snug">{tr(t.text, lang)}</blockquote>
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
                <div className="glass flex h-full gap-5 rounded-2xl p-7">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="text-2xl tracking-tight">{item.title}</h3>
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
