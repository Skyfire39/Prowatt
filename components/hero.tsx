"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { MotoArt, SolarPanelArt } from "./art";
import { CheckIcon } from "./icons";
import { ButtonLink } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary["home"]["hero"] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const panelY = useTransform(smooth, [0, 1], [0, -60]);
  const solarY = useTransform(smooth, [0, 1], [0, -36]);
  const motoY = useTransform(smooth, [0, 1], [0, 28]);

  return (
    <section ref={ref} className="px-4 pb-20 pt-32 sm:px-6 sm:pt-40">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="eyebrow"
        >
          {dict.eyebrow}
        </motion.p>

        <h1 className="mt-6 text-balance text-6xl leading-[0.94] tracking-tight sm:text-8xl lg:text-[8.5rem]">
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
          >
            {dict.title}
          </motion.span>
          <motion.span
            className="block italic text-accent"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.25 }}
          >
            {dict.titleAccent}
          </motion.span>
        </h1>

        <div className="mt-14 grid items-stretch gap-10 border-t border-line pt-10 lg:grid-cols-12 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.45 }}
            className="flex flex-col justify-between lg:col-span-5"
          >
            <div>
              <p className="max-w-md text-lg leading-relaxed text-muted sm:text-xl">{dict.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={`/${lang}/devis`} arrow>
                  {dict.primary}
                </ButtonLink>
                <ButtonLink href={`/${lang}/realisations`} variant="glass">
                  {dict.secondary}
                </ButtonLink>
              </div>
            </div>
            <ul className="mt-12 divide-y divide-line border-y border-line">
              {dict.chips.map((chip) => (
                <li key={chip} className="flex items-center gap-3 py-3.5 text-[15px] font-medium">
                  <CheckIcon className="size-4 text-accent" />
                  {chip}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            style={{ y: panelY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease, delay: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="grid h-full items-center gap-4 rounded-3xl bg-teal p-6 sm:grid-cols-2 sm:p-10">
              <motion.div style={{ y: solarY }}>
                <SolarPanelArt className="mx-auto w-full max-w-xs" />
              </motion.div>
              <motion.div style={{ y: motoY }}>
                <MotoArt className="mx-auto w-full max-w-xs [--moto-a:#c8e0a2] [--moto-b:#f6f8f0] [--moto-line:#f6f8f0]" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
