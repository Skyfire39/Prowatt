"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BoltIcon, QuoteIcon, SearchIcon, ShieldIcon, WrenchIcon } from "./icons";

const icons = [SearchIcon, QuoteIcon, WrenchIcon, BoltIcon, ShieldIcon];
const STEP_MS = 3400;

const subscribe = (notify: () => void) => {
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", notify);
  return () => m.removeEventListener("change", notify);
};
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * « Notre méthode » en frise animée : un courant lumineux avance d'étape en étape sur une ligne, chaque étape
 * s'allume à son passage et son détail s'affiche en grand. La frise avance seule quand elle est à l'écran, s'arrête
 * au survol, et chaque étape se choisit d'un clic. Sur téléphone, la même frise est verticale.
 */
export function StepsJourney({ items }: { items: { title: string; text: string }[] }) {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const visible = useInView(box, { amount: 0.4 });
  const reduce = useSyncExternalStore(subscribe, reducedMotion, () => false);
  const last = items.length - 1;
  const progress = last > 0 ? active / last : 1;
  const playing = visible && !hold && !reduce;

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setActive((a) => (a >= last ? 0 : a + 1)), active === last ? STEP_MS * 1.6 : STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, active, last]);

  const current = items[active];
  const Icon = icons[active % icons.length];

  return (
    <div
      ref={box}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
      className="glass-teal relative isolate mt-14 overflow-hidden rounded-[2rem] px-5 py-8 sm:px-10 sm:py-12"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="sa-float absolute -left-24 -top-24 size-80 rounded-full bg-lime/20 blur-3xl" style={{ animationDuration: "11s" }} />
        <span className="sa-float absolute -bottom-28 right-0 size-96 rounded-full bg-[#5fd0a0]/20 blur-3xl" style={{ animationDuration: "14s", animationDelay: "-5s" }} />
      </div>

      {/* Frise horizontale (ordinateur) */}
      <div className="relative hidden lg:block">
        <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-7 h-1.5 rounded-full bg-white/15" />
        <div
          aria-hidden="true"
          className="absolute left-[10%] top-7 h-1.5 rounded-full bg-gradient-to-r from-lime to-[#5fd0a0] shadow-[0_0_18px_rgb(200_224_162/0.7)] transition-[width] duration-700 ease-out"
          style={{ width: `${progress * 80}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute top-[18px] -ml-2.5 size-5 rounded-full bg-white shadow-[0_0_0_6px_rgb(200_224_162/0.35),0_0_24px_rgb(255_255_255/0.9)] transition-[left] duration-700 ease-out"
          style={{ left: `${10 + progress * 80}%` }}
        />
        <ol className="relative grid grid-cols-5">
          {items.map((it, i) => {
            const StepIcon = icons[i % icons.length];
            const lit = i <= active;
            return (
              <li key={it.title} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={i === active ? "step" : undefined}
                  className="group grid justify-items-center gap-3 text-center"
                >
                  <span
                    className={`relative grid size-14 place-items-center rounded-full border-2 transition-all duration-500 ${
                      lit ? "border-lime bg-lime text-teal" : "border-white/25 bg-teal text-white/60 group-hover:border-white/60"
                    } ${i === active ? "scale-110 shadow-[0_0_0_8px_rgb(200_224_162/0.18),0_10px_30px_rgb(0_0_0/0.25)]" : ""}`}
                  >
                    {i === active && !reduce && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full border-2 border-lime/60" />}
                    <StepIcon className="size-6" />
                  </span>
                  <span className={`text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${lit ? "text-lime" : "text-white/45"}`}>Étape {i + 1}</span>
                  <span className={`max-w-[11rem] text-balance text-base font-medium leading-snug transition-colors ${i === active ? "text-white" : "text-white/60 group-hover:text-white/85"}`}>
                    {it.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Détail de l'étape en cours (ordinateur) */}
      <div className="relative mt-10 hidden min-h-48 overflow-hidden rounded-3xl bg-white/[0.07] p-8 ring-1 ring-white/10 lg:block" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-[auto_1fr] items-center gap-10"
          >
            <span aria-hidden="true" className="text-[8.5rem] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:2px_rgb(200_224_162/0.55)]">
              {String(active + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-lime">
                <Icon className="size-4" />
                Étape {active + 1} sur {items.length}
              </p>
              <h3 className="mt-2 text-4xl leading-tight tracking-tight text-white">{current.title}</h3>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/75">{current.text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
        {playing && <span key={`p${active}`} aria-hidden="true" className="rb-progress absolute inset-x-0 bottom-0 h-1 origin-left bg-lime/70" style={{ animationDuration: `${active === last ? STEP_MS * 1.6 : STEP_MS}ms` }} />}
      </div>

      {/* Frise verticale (téléphone et tablette) */}
      <ol className="relative grid gap-7 lg:hidden">
        <span aria-hidden="true" className="absolute bottom-7 left-7 top-7 w-1 -translate-x-1/2 rounded-full bg-white/15" />
        <span
          aria-hidden="true"
          className="absolute left-7 top-7 w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-lime to-[#5fd0a0] shadow-[0_0_14px_rgb(200_224_162/0.7)] transition-[height] duration-700 ease-out"
          style={{ height: `calc((100% - 3.5rem) * ${progress})` }}
        />
        {items.map((it, i) => {
          const StepIcon = icons[i % icons.length];
          const lit = i <= active;
          return (
            <li key={it.title} className="relative">
              <button type="button" onClick={() => setActive(i)} aria-current={i === active ? "step" : undefined} className="flex w-full gap-4 text-left">
                <span
                  className={`relative grid size-14 shrink-0 place-items-center rounded-full border-2 transition-all duration-500 ${
                    lit ? "border-lime bg-lime text-teal" : "border-white/25 bg-teal text-white/60"
                  } ${i === active ? "shadow-[0_0_0_7px_rgb(200_224_162/0.18)]" : ""}`}
                >
                  <StepIcon className="size-6" />
                </span>
                <span className="pt-1">
                  <span className={`block text-xs font-semibold uppercase tracking-[0.16em] ${lit ? "text-lime" : "text-white/45"}`}>Étape {i + 1}</span>
                  <span className={`mt-1 block text-xl leading-snug tracking-tight ${i === active ? "text-white" : "text-white/75"}`}>{it.title}</span>
                  <span className={`mt-1.5 block leading-relaxed transition-colors ${i === active ? "text-white/80" : "text-white/55"}`}>{it.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
