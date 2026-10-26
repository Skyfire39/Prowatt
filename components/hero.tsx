"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Counter } from "./counter";
import { BoltIcon, GlobeIcon, QuoteIcon, UsersIcon } from "./icons";
import { ButtonLink } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;
/** Remplissage (décoratif) de l'anneau de chaque chiffre clé. */
const FILLS = [0.78, 0.9, 0.66];

/** Anneau qui se trace à l'apparition, avec un point lumineux qui orbite lentement. */
function Ring({
  Icon,
  fill,
  delay,
}: {
  Icon: typeof BoltIcon;
  fill: number;
  delay: number;
}) {
  return (
    <span className="relative grid size-11 place-items-center text-accent sm:size-14">
      <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="4" />
        <motion.circle
          cx="28"
          cy="28"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: fill }}
          transition={{ duration: 1.8, ease, delay }}
        />
      </svg>
      <span aria-hidden="true" className="stat-orbit absolute inset-0">
        <span className="absolute left-1/2 top-[2px] size-2 -translate-x-1/2 rounded-full bg-lime shadow-[0_0_10px_2px_var(--brand-lime)]" />
      </span>
      <Icon className="relative size-5 sm:size-6" />
    </span>
  );
}

export function Hero({
  lang,
  dict,
  message,
  statLabels,
}: {
  lang: Locale;
  dict: Dictionary["home"]["hero"];
  message: Dictionary["home"]["message"];
  statLabels: Dictionary["home"]["stats"];
}) {
  const nf = new Intl.NumberFormat(lang);
  const stats = [
    { icon: BoltIcon, value: site.stats.kwc, unit: lang === "fr" ? "kWc" : "kWp" },
    { icon: UsersIcon, value: site.stats.clients, unit: "" },
    { icon: GlobeIcon, value: site.stats.co2, unit: "t" },
  ];

  return (
    <section className="px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto grid max-w-6xl items-stretch gap-5 lg:grid-cols-12">
        <div className="flex flex-col justify-center py-6 lg:col-span-7 lg:py-10 lg:pr-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="glass w-fit rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
          >
            {dict.eyebrow}
          </motion.p>

          <h1 className="mt-7 text-balance text-6xl leading-[1.02] tracking-[-0.045em] sm:text-7xl lg:text-[5.5rem]">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
            >
              {dict.title}
            </motion.span>
            <motion.span
              className="block text-accent"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.2 }}
            >
              {dict.titleAccent}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.35 }}
            className="mt-6 max-w-xl text-xl leading-relaxed text-muted"
          >
            {dict.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.45 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <ButtonLink href={`/${lang}/contact`} variant="lime" arrow>
              {dict.primary}
            </ButtonLink>
            <ButtonLink href={`/${lang}/devis`} variant="glass">
              {dict.secondary}
            </ButtonLink>
          </motion.div>

          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-2.5 sm:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={statLabels[i]}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.7, ease, delay: 0.55 + i * 0.12 }}
                className="glass group relative overflow-hidden rounded-2xl p-3 sm:p-5"
              >
                {/* Reflet qui traverse la carte au survol */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-2/3 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[420%]"
                />
                <Ring Icon={s.icon} fill={FILLS[i]} delay={0.9 + i * 0.15} />
                <dd className="relative mt-3 text-2xl font-medium leading-none tracking-tight tabular-nums sm:mt-4 sm:text-4xl">
                  <Counter value={s.value} display={nf.format(s.value)} locale={lang} />
                  {s.unit && <span className="mt-1 block text-xs text-muted sm:ml-0.5 sm:mt-0 sm:inline sm:text-xl">{s.unit}</span>}
                </dd>
                <dt className="relative mt-1.5 text-[11px] leading-snug text-muted sm:mt-2 sm:text-sm">
                  {statLabels[i]}
                </dt>
              </motion.div>
            ))}
          </dl>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.3 }}
          className="relative flex min-h-[34rem] flex-col overflow-hidden rounded-3xl glass-teal lg:col-span-5"
        >
          <div className="relative z-10 p-8 sm:p-10">
            <QuoteIcon className="size-9 text-lime" />
            <blockquote className="mt-4 text-balance text-2xl font-medium leading-snug tracking-tight">
              {message.quote}
            </blockquote>
            <p className="mt-4 text-sm text-white/65">
              {message.role} {message.author}
            </p>
          </div>
          <Image
            src="/images/dg.png"
            alt={message.author}
            width={587}
            height={713}
            priority
            sizes="(min-width: 1024px) 480px, 90vw"
            className="mt-auto h-auto w-4/5 max-w-sm self-center"
          />
        </motion.aside>
      </div>
    </section>
  );
}
