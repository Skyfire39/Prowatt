"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ArrowIcon } from "./icons";

type Slide = { id: string; name: string; tagline: string; photo: string; href: string };
type Labels = { prev: string; next: string; goTo: string; label: string; cta: string };

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 70 : -70, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -70 : 70, opacity: 0 }),
};

/** Carrousel des modèles Ecooter : flèches, points, glisser du doigt et lecture automatique. */
export function ModelSlider({
  slides,
  labels,
  interval = 6000,
}: {
  slides: Slide[];
  labels: Labels;
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
      className="glass relative overflow-hidden rounded-3xl"
    >
      <AnimatePresence initial={false} custom={dir} mode="wait">
        <motion.div
          key={slide.id}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, { offset, velocity }) => {
            if (offset.x < -80 || velocity.x < -500) next();
            else if (offset.x > 80 || velocity.x > 500) prev();
          }}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} / ${count}`}
          className="grid min-h-[27rem] cursor-grab items-center gap-6 p-6 pb-24 active:cursor-grabbing sm:p-10 sm:pb-24 md:grid-cols-2 md:pb-10"
        >
          <div className="order-2 md:order-1">
            <p className="text-sm font-semibold tabular-nums text-accent">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
            <h2 className="mt-3 text-6xl leading-none tracking-[-0.04em] sm:text-7xl">{slide.name}</h2>
            <p className="mt-4 max-w-md text-xl leading-relaxed text-muted">{slide.tagline}</p>
            <Link
              href={slide.href}
              className="group mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-medium text-on-accent transition-opacity hover:opacity-85"
            >
              {labels.cta}
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="order-1 md:order-2">
            <div className="mx-auto max-w-md overflow-hidden rounded-2xl bg-white">
              <Image
                src={slide.photo}
                alt={slide.name}
                width={1100}
                height={1100}
                priority={index === 0}
                sizes="(min-width: 768px) 420px, 80vw"
                draggable={false}
                className="h-auto w-full select-none"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-5 flex items-center justify-between px-6 sm:px-10">
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
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={labels.prev}
            onClick={prev}
            className="glass-chip grid size-11 place-items-center rounded-full transition-opacity hover:opacity-70"
          >
            <ArrowIcon className="size-5 rotate-180" />
          </button>
          <button
            type="button"
            aria-label={labels.next}
            onClick={next}
            className="glass-chip grid size-11 place-items-center rounded-full transition-opacity hover:opacity-70"
          >
            <ArrowIcon className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
