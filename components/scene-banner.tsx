"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Counter } from "./counter";
import { ArrowIcon } from "./icons";

export type ShellItem = { key: string; name: string; chip: string; text: string; badge?: string; meta: string; href: string };

const CYCLE_MS = 4600;

const subscribeMotion = (notify: () => void) => {
  const q = window.matchMedia("(prefers-reduced-motion: reduce)");
  q.addEventListener("change", notify);
  return () => q.removeEventListener("change", notify);
};
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Coque des bannières animées : la scène SVG à droite, le texte à gauche. Un élément est mis en lumière à la fois,
 * en boucle, ou au survol / au toucher d'une pastille ; le texte suit l'élément actif.
 */
export function SceneBanner({
  items,
  kicker,
  hint,
  stat,
  scene,
  variant = "dark",
}: {
  items: ShellItem[];
  kicker: string;
  hint: string;
  stat?: { value: number; label: string };
  scene: (active: number, onPick: (i: number) => void) => ReactNode;
  /** « dark » : paysage nocturne, texte à gauche. « light » : fond lime clair, scène à gauche, texte à droite. */
  variant?: "dark" | "light";
}) {
  const light = variant === "light";
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const reduce = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const current = items[active];

  useEffect(() => {
    if (hold || reduce) return;
    const t = setInterval(() => setActive((a) => (a + 1) % items.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [hold, reduce, items.length, active]);

  return (
    <section className="px-4 pb-12 sm:px-6">
      <div
        className={`relative isolate mx-auto flex max-w-6xl flex-col overflow-hidden rounded-3xl xl:block xl:min-h-[31rem] ${
          light
            ? "bg-[linear-gradient(125deg,#d9ebb9_0%,#eef6dd_48%,#ffffff_100%)] text-teal shadow-[0_24px_60px_-24px_rgb(23_92_85/0.35)] ring-1 ring-teal/10"
            : "bg-[#0b3f3a] text-white shadow-[0_24px_60px_-20px_rgb(11_63_58/0.55)] ring-1 ring-white/10"
        }`}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
        onPointerLeave={() => setHold(false)}
        onFocus={() => setHold(true)}
        onBlur={() => setHold(false)}
      >
        {/* Scène */}
        <div className={`relative overflow-hidden ${light ? "h-80 sm:h-[26rem] xl:absolute xl:inset-y-0 xl:left-0 xl:h-auto xl:w-[48%]" : "h-52 sm:h-72 xl:absolute xl:inset-0 xl:h-auto"}`}>
          {scene(active, setActive)}
          {!light && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0b3f3a] to-transparent xl:hidden" />}
          {!light && <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#0b3f3a] via-[#0b3f3a]/55 to-transparent xl:block xl:w-[50%]" />}
        </div>

        {/* Texte */}
        <div className={`relative z-10 grid gap-6 p-6 sm:p-9 xl:py-12 ${light ? "xl:ml-auto xl:max-w-[52%] xl:pl-6 xl:pr-14" : "xl:max-w-[42%] xl:pl-12"}`}>
          <div>
            <p className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ring-1 ${light ? "bg-white/70 text-teal ring-teal/15" : "bg-white/10 text-lime ring-white/15"}`}>
              <span className={`size-1.5 rounded-full sa-blink ${light ? "bg-teal" : "bg-lime"}`} />
              {kicker}
            </p>
            {stat && (
              <p className="mt-4 flex items-baseline gap-3">
                <span className="text-6xl font-semibold leading-none tracking-[-0.05em] tabular-nums sm:text-7xl">
                  <Counter value={stat.value} display={String(stat.value)} locale="fr" />
                </span>
                <span className={`text-lg ${light ? "text-muted" : "text-white/70"}`}>{stat.label}</span>
              </p>
            )}
          </div>

          <div aria-live="polite" className="min-h-[7.5rem]">
            <div key={current.key} className="rb-in">
              <p className={`text-xs font-semibold tabular-nums tracking-[0.18em] ${light ? "text-teal/60" : "text-lime/80"}`}>
                {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </p>
              <h2 className="mt-1.5 text-3xl leading-tight tracking-tight sm:text-4xl">{current.name}</h2>
              <p className={`mt-2 max-w-md leading-relaxed ${light ? "text-muted" : "text-white/75"}`}>{current.text}</p>
              <Link href={current.href} className={`group mt-3 inline-flex items-center gap-2 text-sm font-semibold ${light ? "text-teal" : "text-lime"}`}>
                {current.meta}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div>
            <div role="group" aria-label={hint} className="flex flex-wrap gap-2">
              {items.map((it, i) => (
                <button
                  key={it.key}
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  className={`relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-full px-3.5 text-sm font-semibold transition-colors ${
                    light
                      ? i === active
                        ? "bg-teal text-white"
                        : "bg-white/70 text-teal ring-1 ring-teal/15 hover:bg-white"
                      : i === active
                        ? "bg-lime text-teal"
                        : "bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/20"
                  }`}
                >
                  {it.chip}
                  {it.badge && <span className={`text-xs tabular-nums ${i === active ? (light ? "text-white/70" : "text-teal/70") : light ? "text-teal/50" : "text-white/50"}`}>{it.badge}</span>}
                  {i === active && !reduce && (
                    <span
                      key={`${active}-${hold}`}
                      aria-hidden="true"
                      className={`rb-progress absolute inset-x-0 bottom-0 h-[3px] origin-left ${light ? "bg-lime" : "bg-teal/60"}`}
                      style={{ animationDuration: `${CYCLE_MS}ms`, animationPlayState: hold ? "paused" : "running" }}
                    />
                  )}
                </button>
              ))}
            </div>
            <p className={`mt-3 text-xs ${light ? "text-muted" : "text-white/50"}`}>{hint}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

