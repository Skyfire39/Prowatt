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
            className="w-fit rounded-full bg-panel px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
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

          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.55 }}
            className="mt-12 grid max-w-xl grid-cols-3 gap-4"
          >
            {stats.map((s, i) => (
              <div key={statLabels[i]}>
                <s.icon className="size-7 text-accent" />
                <dd className="mt-3 text-3xl font-medium tracking-tight tabular-nums sm:text-4xl">
                  <Counter value={s.value} display={nf.format(s.value)} locale={lang} />
                  {s.unit && <span className="ml-0.5 text-lg text-muted sm:text-xl">{s.unit}</span>}
                </dd>
                <dt className="mt-1 text-xs leading-snug text-muted sm:text-sm">{statLabels[i]}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.3 }}
          className="relative flex min-h-[34rem] flex-col overflow-hidden rounded-3xl bg-teal text-white lg:col-span-5"
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
