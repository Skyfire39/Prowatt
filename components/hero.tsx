"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { MotoArt, SolarPanelArt } from "./art";
import { ArrowIcon, BoltIcon, LeafIcon, SunIcon } from "./icons";

const ease = [0.22, 1, 0.36, 1] as const;
const chipIcons = [BoltIcon, SunIcon, LeafIcon];

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary["hero"] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const stageY = useTransform(smooth, [0, 1], [0, -80]);
  const stageScale = useTransform(smooth, [0, 1], [1, 0.92]);
  const textY = useTransform(smooth, [0, 1], [0, 90]);
  const textOpacity = useTransform(smooth, [0, 0.7], [1, 0]);
  const solarY = useTransform(smooth, [0, 1], [0, -50]);
  const motoY = useTransform(smooth, [0, 1], [0, 40]);

  return (
    <section ref={ref} className="relative px-4 pb-24 pt-32 sm:px-6 sm:pt-40">
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="mx-auto flex max-w-4xl flex-col items-center text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-accent"
        >
          <span className="size-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          {dict.eyebrow}
        </motion.span>

        <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight sm:text-7xl lg:text-[5.5rem]">
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}
          >
            {dict.title}
          </motion.span>
          <motion.span
            className="text-gradient block pb-2"
            initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease, delay: 0.35 }}
          >
            {dict.titleAccent}
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.55 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl"
        >
          {dict.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.7 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href={`/${lang}#solaire`}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-medium text-on-accent shadow-lg shadow-teal/25 transition-transform hover:scale-[1.03] active:scale-95"
          >
            {dict.primary}
            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href={`/${lang}#contact`}
            className="glass inline-flex h-12 items-center rounded-full px-7 text-[15px] font-medium transition-transform hover:scale-[1.03] active:scale-95"
          >
            {dict.secondary}
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: stageY, scale: stageScale }}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, ease, delay: 0.5 }}
        className="relative mx-auto mt-16 max-w-5xl"
      >
        <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-6 sm:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-lime/50 blur-3xl dark:bg-lime/15"
          />
          <div className="relative grid items-center gap-6 sm:grid-cols-2">
            <motion.div style={{ y: solarY }}>
              <SolarPanelArt className="mx-auto w-full max-w-sm drop-shadow-2xl" />
            </motion.div>
            <motion.div style={{ y: motoY }}>
              <MotoArt className="mx-auto w-full max-w-sm drop-shadow-2xl" />
            </motion.div>
          </div>

          <ul className="relative mt-8 flex flex-wrap justify-center gap-3">
            {dict.chips.map((chip, i) => {
              const Icon = chipIcons[i];
              return (
                <motion.li
                  key={chip}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease, delay: 1 + i * 0.12 }}
                  className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                >
                  <Icon className="size-4 text-accent" />
                  {chip}
                </motion.li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
