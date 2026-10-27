"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { GlassBubble } from "./glass-bubble";
import { ArrowIcon, BatteryIcon, BoltIcon, GaugeIcon, RouteIcon } from "./icons";

type Slide = {
  id: string;
  name: string;
  tagline: string;
  photo: string;
  /** Photo détourée (fond transparent) : posée sur un disque. Sinon, photo avec décor : affichée dans un cadre. */
  cutout?: boolean;
  href: string;
  specs?: { power?: string; speed?: string; range?: string; battery?: string };
};
type Labels = {
  prev: string;
  next: string;
  goTo: string;
  label: string;
  cta: string;
  power: string;
  speed: string;
  range: string;
  battery: string;
  onRequest: string;
  batteryBoth: string;
};

const subscribeDesktop = (cb: () => void) => {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useIsDesktop = () =>
  useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );

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
  battery,
}: {
  slides: Slide[];
  labels: Labels;
  /** Classe de couleur du disque placé derrière la moto. */
  circle?: string;
  interval?: number;
  /** Type de batterie à afficher ; par défaut, les deux technologies proposées. */
  battery?: string;
}) {
  const desktop = useIsDesktop();
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
  const specs = [
    { key: "power", icon: BoltIcon, label: labels.power, value: slide.specs?.power ?? labels.onRequest },
    { key: "speed", icon: GaugeIcon, label: labels.speed, value: slide.specs?.speed ?? labels.onRequest },
    { key: "range", icon: RouteIcon, label: labels.range, value: slide.specs?.range ?? labels.onRequest },
    { key: "battery", icon: BatteryIcon, label: labels.battery, value: slide.specs?.battery ?? battery ?? labels.batteryBoth },
  ];

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
          className="relative mx-auto flex max-w-5xl cursor-grab flex-col items-center gap-3 active:cursor-grabbing md:grid md:min-h-[32rem] md:grid-cols-[1.12fr_1fr] md:items-center md:gap-4"
        >
          {/* La moto, en grand, posée sur un disque */}
          <div className="relative flex w-full justify-center">
            <div
              aria-hidden="true"
              className={`absolute left-1/2 top-1/2 size-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-[22rem] md:size-[25rem] ${circle}`}
            />
            {slide.cutout === false ? (
              <div className="relative aspect-[4/3] w-full max-w-[22rem] overflow-hidden rounded-3xl shadow-[0_24px_40px_-18px_rgb(10_35_32/0.35)] ring-1 ring-white/70 sm:max-w-[28rem] md:max-w-[33rem]">
                <Image
                  src={slide.photo}
                  unoptimized={slide.photo.startsWith("/api/")}
                  alt={slide.name}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 768px) 528px, 90vw"
                  draggable={false}
                  className="select-none object-cover"
                />
              </div>
            ) : (
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-[22rem] sm:max-w-[28rem] md:max-w-[33rem]"
            >
              <Image
                src={slide.photo}
                unoptimized={slide.photo.startsWith("/api/")}
                alt={slide.name}
                width={1100}
                height={1100}
                priority={index === 0}
                sizes="(min-width: 768px) 528px, 90vw"
                draggable={false}
                className="h-auto w-full select-none drop-shadow-[0_28px_28px_rgb(10_35_32/0.28)]"
              />
            </motion.div>
            )}
          </div>

          {/* Une seule carte de verre à droite : identité, caractéristiques, action. Sa pointe désigne la moto. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md md:max-w-none"
          >
            <GlassBubble tail={desktop ? "left" : "top"} tailPos={desktop ? 0.4 : 0.5} radius={32}>
              <div className="p-6 sm:p-7">
                <p className="text-sm font-semibold tabular-nums text-accent">
                  {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </p>
                <h2 className="mt-1 text-4xl leading-none tracking-[-0.04em] md:text-5xl">{slide.name}</h2>
                <p className="mt-3 leading-relaxed text-muted">{slide.tagline}</p>

                <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl bg-white/45 ring-1 ring-white/70">
                  {specs.map((sp, i) => (
                    <motion.div
                      key={sp.key}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.25 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className={`p-4 ${i % 2 === 0 ? "border-r border-ink/10" : ""} ${i < 2 ? "border-b border-ink/10" : ""}`}
                    >
                      <div className="flex items-center gap-2 text-accent">
                        <span className="grid size-7 place-items-center rounded-full bg-accent/10">
                          <sp.icon className="size-3.5" />
                        </span>
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{sp.label}</dt>
                      </div>
                      <dd
                        className={`mt-2 font-semibold leading-tight tracking-tight ${
                          sp.value === labels.onRequest ? "text-sm text-muted" : "text-lg"
                        }`}
                      >
                        {sp.value}
                      </dd>
                    </motion.div>
                  ))}
                </dl>

                <Link
                  href={slide.href}
                  className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-on-accent transition-opacity hover:opacity-85"
                >
                  {labels.cta}
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </GlassBubble>
          </motion.div>
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
