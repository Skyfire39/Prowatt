import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { ecooters, partners, slugs, testimonials, tr } from "@/lib/data";
import type { Slug } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { ModelSlider } from "./model-slider";
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
  MapPinIcon,
  PanelIcon,
  ShieldIcon,
  WrenchIcon,
} from "./icons";
import { HoverLift, Reveal } from "./motion";
import { ButtonLink, Photo, SectionHead } from "./ui";

type Home = Dictionary["home"];

const blockIcons = [BoltIcon, DropIcon, WrenchIcon];
// Trois cadrages différents de la même photo, un par pilier.
const blockCrops = [
  { pos: "10% 40%", zoom: 1.9 },
  { pos: "90% 80%", zoom: 2 },
  { pos: "50% 5%", zoom: 2.2 },
];
const typeIcons: Record<Slug, typeof BoltIcon> = {
  "100-autonome": HomeIcon,
  hybride: BatteryIcon,
  ongrid: GridIcon,
  "anti-delestage": ShieldIcon,
  "acces-a-eau": DropIcon,
};

/** Bande teal pleine largeur : « Nos solutions sur mesure ». */
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
    <section className="px-4 py-12 sm:px-6 sm:py-20">
      <div className="glass-teal mx-auto max-w-6xl rounded-3xl px-5 py-16 sm:px-12 sm:py-24">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} subtitle={dict.subtitle} tone="dark" />

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {dict.blocks.map((b, i) => {
            const Icon = blockIcons[i];
            return (
              <Reveal key={b.title} delay={i * 0.08}>
                <HoverLift className="glass-on-teal flex h-full flex-col overflow-hidden rounded-3xl">
                  <Photo {...blockCrops[i]} className="h-56" sizes="(min-width: 768px) 380px, 100vw" />
                  <div className="flex flex-1 flex-col p-8">
                    <span className="grid size-11 place-items-center rounded-full bg-lime text-teal">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-2xl leading-tight tracking-tight">{b.title}</h3>
                    <p className="mt-2 leading-relaxed text-white/75">{b.text}</p>
                  </div>
                </HoverLift>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-14">
          <p className="mb-5 text-center text-sm font-medium text-white/70">{dict.typesTitle}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {slugs.map((slug) => {
              const Icon = typeIcons[slug];
              const c = categories[slug];
              return (
                <Link
                  key={slug}
                  href={`/${lang}/realisations/${slug}`}
                  className="glass-on-teal group flex flex-col rounded-2xl p-5 transition-colors hover:bg-white/20"
                >
                  <Icon className="size-6 text-lime" />
                  <span className="mt-4 font-semibold leading-snug">{c.name}</span>
                  <span className="mt-1.5 flex-1 text-sm leading-relaxed text-white/70">{c.short}</span>
                  <ArrowIcon className="mt-4 size-4 text-lime transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Bande noire façon page produit Apple : titre centré, visuel XXL. */
export function EcooterTeaser({
  lang,
  dict,
  models,
}: {
  lang: Locale;
  dict: Home["ecooter"];
  models: Dictionary["ecooter"];
}) {
  const slides = ecooters.map((m) => ({
    id: m.id,
    name: m.name,
    tagline: tr(m.tagline, lang),
    photo: m.photo,
    href: `/${lang}/ecooter`,
  }));
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20">
      <div className="glass-lime mx-auto max-w-6xl rounded-3xl px-5 pb-10 pt-16 sm:px-12 sm:pt-24">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} subtitle={dict.subtitle} tone="lime" />
        <Reveal className="mt-8 flex justify-center">
          <ButtonLink href={`/${lang}/ecooter`} variant="teal" arrow>
            {dict.cta}
          </ButtonLink>
        </Reveal>
        <Reveal y={40} delay={0.1} className="mx-auto mt-14 max-w-5xl">
          <ModelSlider slides={slides} labels={{ ...models.slider, cta: dict.cta }} />
        </Reveal>
      </div>
    </section>
  );
}

/** Méthode en 5 étapes sur fond tuile. */
export function Steps({ dict }: { dict: Home["steps"] }) {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {dict.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="glass flex h-full flex-col rounded-3xl p-6">
                <span className="grid size-10 place-items-center rounded-full bg-accent text-lg font-semibold text-on-accent">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-xl leading-snug tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const advIcons = [ShieldIcon, BoltIcon, BatteryIcon, PanelIcon];

/** Grande tuile photo avec quatre cartes blanches, comme l'ancien site. */
export function SolarAdvantages({ dict }: { dict: Home["advantages"] }) {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative isolate overflow-hidden rounded-3xl px-5 py-20 text-white sm:px-10 sm:py-28">
          <Photo pos="50% 40%" className="absolute inset-0 -z-20" />
          <div className="absolute inset-0 -z-10 bg-teal/70" />
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow !text-lime">{dict.eyebrow}</p>
            <h2 className="mt-3 text-balance text-5xl leading-[1.04] tracking-[-0.04em] sm:text-7xl">
              {dict.title}
            </h2>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dict.items.map((item, i) => {
              const Icon = advIcons[i];
              return (
                <div key={item.title} className="glass-on-teal rounded-2xl p-7">
                  <span className="grid size-12 place-items-center rounded-full bg-lime text-teal">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-6 text-xl leading-snug tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const audIcons = [HomeIcon, BuildingIcon, FactoryIcon];
const audCrops = [
  { pos: "0% 15%", zoom: 2.1 },
  { pos: "55% 55%", zoom: 2.4 },
  { pos: "100% 90%", zoom: 2.1 },
];

export function Audiences({ dict }: { dict: Home["audiences"] }) {
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {dict.items.map((item, i) => {
            const Icon = audIcons[i];
            return (
              <Reveal key={item.title} delay={i * 0.1}>
                <HoverLift className="glass h-full overflow-hidden rounded-3xl">
                  <Photo {...audCrops[i]} className="h-48" sizes="(min-width: 768px) 380px, 100vw" />
                  <div className="p-8">
                    <span className="-mt-14 mb-5 grid size-12 place-items-center rounded-full bg-lime text-teal ring-4 ring-white/70 relative dark:ring-white/15">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="text-2xl tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-muted">{item.text}</p>
                  </div>
                </HoverLift>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Bande lime pleine largeur avec les portraits des clients. */
export function Testimonials({ lang, dict }: { lang: Locale; dict: Home["testimonials"] }) {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20">
      <div className="glass-lime mx-auto max-w-6xl rounded-3xl px-5 py-16 sm:px-12 sm:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow !text-teal">{dict.eyebrow}</p>
          <h2 className="mt-3 text-balance text-5xl leading-[1.04] tracking-[-0.04em] text-teal sm:text-6xl lg:text-7xl">
            {dict.title}
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="glass-teal flex h-full flex-col rounded-3xl p-7">
                <div className="flex items-center gap-3">
                  <Image
                    src={t.photo}
                    alt={t.name}
                    width={96}
                    height={96}
                    className="size-12 rounded-full object-cover"
                  />
                  <figcaption className="text-sm font-semibold">{t.name}</figcaption>
                </div>
                <blockquote className="mt-6 flex-1 text-lg leading-snug tracking-tight">
                  {tr(t.text, lang)}
                </blockquote>
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
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <Reveal className="mt-12 flex flex-wrap justify-center gap-3">
          {partners.map((p) => (
            <span key={p} className="glass rounded-full px-7 py-3.5 text-lg font-semibold tracking-tight">
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
    <section className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dict.items.map((item, i) => {
            const Icon = whyIcons[i];
            return (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="glass flex h-full flex-col rounded-3xl p-8">
                  <span className="grid size-12 place-items-center rounded-full bg-accent text-on-accent">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-6 text-2xl leading-snug tracking-tight">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
