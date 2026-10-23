import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { MotoArt } from "./art";
import {
  ArrowIcon,
  BatteryIcon,
  BoltIcon,
  LampIcon,
  LeafIcon,
  PanelIcon,
  HomeIcon,
  ShieldIcon,
  WrenchIcon,
  MapPinIcon,
} from "./icons";
import { HoverLift, Reveal } from "./motion";

function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h2 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-lg leading-relaxed text-muted">{subtitle}</p>
      )}
    </Reveal>
  );
}

const solarIcons = [HomeIcon, PanelIcon, BatteryIcon, LampIcon];

export function Solar({ dict }: { dict: Dictionary["solar"] }) {
  return (
    <section id="solaire" className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} subtitle={dict.subtitle} />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.items.map((item, i) => {
            const Icon = solarIcons[i];
            return (
              <Reveal key={item.title} delay={i * 0.08}>
                <HoverLift className="glass group relative h-full overflow-hidden rounded-[2rem] p-7">
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 size-36 rounded-full bg-lime/60 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-lime/20"
                  />
                  <span className="relative grid size-12 place-items-center rounded-2xl bg-accent text-on-accent">
                    <Icon className="size-6" />
                  </span>
                  <p className="relative mt-6 text-xs font-semibold uppercase tracking-widest text-muted">
                    {item.tag}
                  </p>
                  <h3 className="relative mt-1 text-xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="relative mt-3 leading-relaxed text-muted">{item.text}</p>
                </HoverLift>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Moto({ lang, dict }: { lang: Locale; dict: Dictionary["moto"] }) {
  return (
    <section id="moto" className="px-4 py-12 sm:px-6">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-teal p-8 text-white sm:p-14 dark:bg-[#0c3a35]">
          <div
            aria-hidden="true"
            className="absolute -left-24 -top-24 size-96 rounded-full bg-lime/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 right-0 size-96 rounded-full bg-lime/20 blur-3xl"
          />
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-lime">
                {dict.eyebrow}
              </p>
              <h2 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                {dict.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/75">{dict.subtitle}</p>

              <ul className="mt-9 grid gap-3 sm:grid-cols-2">
                {dict.points.map((p) => (
                  <li
                    key={p.title}
                    className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl"
                  >
                    <h3 className="font-semibold text-lime">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">{p.text}</p>
                  </li>
                ))}
              </ul>

              <Link
                href={`/${lang}#contact`}
                className="group mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-lime px-7 text-[15px] font-medium text-teal transition-transform hover:scale-[1.03] active:scale-95"
              >
                {dict.cta}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
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

const whyIcons = [MapPinIcon, ShieldIcon, BoltIcon, WrenchIcon];

export function Why({ dict }: { dict: Dictionary["why"] }) {
  return (
    <section id="pourquoi" className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-16 grid gap-5 md:grid-cols-2">
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

export function Steps({ dict }: { dict: Dictionary["steps"] }) {
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={dict.eyebrow} title={dict.title} />
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {dict.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.12}>
              <div className="glass relative h-full overflow-hidden rounded-[2rem] p-8">
                <span
                  aria-hidden="true"
                  className="text-gradient absolute -right-2 -top-4 text-[9rem] font-semibold leading-none opacity-30"
                >
                  {i + 1}
                </span>
                <LeafIcon className="relative size-7 text-accent" />
                <h3 className="relative mt-6 text-2xl font-semibold tracking-tight">{item.title}</h3>
                <p className="relative mt-2 leading-relaxed text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
