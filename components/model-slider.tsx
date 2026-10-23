"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ArrowIcon } from "./icons";

type Slide = { id: string; name: string; tagline: string; photo: string; href: string };
type Labels = { prev: string; next: string; goTo: string; label: string; cta: string };

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
};

/**
 * Carrousel des modèles Ecooter, sans carte : la moto détourée au centre, en grand,
 * et une bulle de message qui pointe vers elle. Flèches, points, glisser du doigt
 * et lecture automatique.
 */
export function ModelSlider({
  slides,
  labels,
  circle = "bg-lime/60",
  interval = 6000,
}: {
  slides: Slide[];
  labels: Labels;
  /** Classe de couleur du disque placé derrière la moto. */
  circle?: string;
  interval?: number;
}) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (to: number, d: number) => setState([((to % count) + count) % count, d]),
    [count],
  );
  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const prev = useCallback(() => go(index - 1, -1), [go, index]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(next, interval);
    return () => window.clearTimeout(t);
  }, [index, paused, next, interval]);

  const slide = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative"
    >
      <AnimatePresence initial={false} custom={dir} mode="wait">
        <motion.div
          key={slide.id}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, { offset, velocity }) => {
            if (offset.x < -80 || velocity.x < -500) next();
            else if (offset.x > 80 || velocity.x > 500) prev();
          }}
          role="group"
          aria-roledescription="slide"
          aria-label={`${slide.name} — ${index + 1} / ${count}`}
          className="relative mx-auto flex max-w-5xl cursor-grab flex-col items-center active:cursor-grabbing md:block md:min-h-[34rem]"
        >
          {/* Disque d'ancrage derrière la moto */}
          <div
            aria-hidden="true"
            className={`absolute left-1/2 top-[3%] size-[17rem] -translate-x-1/2 rounded-full sm:size-[24rem] md:top-[5%] md:size-[27rem] ${circle}`}
          />

          {/* La moto : seule, grande, centrée */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto w-full max-w-[22rem] sm:max-w-[30rem] md:max-w-[36rem]"
          >
            <Image
              src={slide.photo}
              alt={slide.name}
              width={1100}
              height={1100}
              priority={index === 0}
              sizes="(min-width: 768px) 576px, 90vw"
              draggable={false}
              className="h-auto w-full select-none drop-shadow-[0_28px_28px_rgb(10_35_32/0.28)]"
            />
          </motion.div>

          {/* Bulle de message : sa pointe désigne la moto */}
          <div className="relative mt-3 w-full max-w-sm md:absolute md:left-0 md:top-12 md:mt-0 md:w-[19rem]">
            <span
              aria-hidden="true"
              className="bg-white/85 backdrop-blur-xl dark:bg-[#0f2825]/85 absolute -top-4 left-1/2 h-5 w-10 -translate-x-1/2 [clip-path:polygon(50%_0,100%_100%,0_100%)] md:-right-6 md:left-auto md:top-[46%] md:h-11 md:w-7 md:translate-x-0 md:-translate-y-1/2 md:[clip-path:polygon(0_0,100%_50%,0_100%)]"
            />
            <div className="bg-white/85 backdrop-blur-xl dark:bg-[#0f2825]/85 relative rounded-3xl border border-white/80 p-6 shadow-[0_14px_36px_rgb(23_92_85/0.2)] dark:border-white/15 dark:shadow-[0_14px_36px_rgb(0_0_0/0.45)]">
              <p className="text-sm font-semibold tabular-nums text-accent">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </p>
              <h2 className="mt-1 text-4xl leading-none tracking-[-0.04em]">{slide.name}</h2>
              <p className="mt-3 leading-relaxed text-muted">{slide.tagline}</p>
              <Link
                href={slide.href}
                className="group mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition-opacity hover:opacity-85"
              >
                {labels.cta}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label={labels.prev}
          onClick={prev}
          className="glass-chip grid size-11 place-items-center rounded-full transition-opacity hover:opacity-70"
        >
          <ArrowIcon className="size-5 rotate-180" />
        </button>
        <ul className="flex items-center gap-2" aria-label={labels.goTo}>
          {slides.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                aria-label={`${labels.goTo} ${s.name}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i, i > index ? 1 : -1)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-accent" : "w-2 bg-ink/25 hover:bg-ink/50"
                }`}
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          aria-label={labels.next}
          onClick={next}
          className="glass-chip grid size-11 place-items-center rounded-full transition-opacity hover:opacity-70"
        >
          <ArrowIcon className="size-5" />
        </button>
      </div>
    </section>
  );
}
