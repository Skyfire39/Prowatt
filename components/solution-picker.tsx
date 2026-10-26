"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowIcon, BatteryIcon, DropIcon, GridIcon, HomeIcon, ShieldIcon } from "./icons";

type Item = { slug: string; name: string; short: string; href: string };

const icons: Record<string, typeof HomeIcon> = {
  "100-autonome": HomeIcon,
  hybride: BatteryIcon,
  ongrid: GridIcon,
  "anti-delestage": ShieldIcon,
  "acces-a-eau": DropIcon,
};

/**
 * Sélecteur des solutions : cinq panneaux côte à côte. Sur grand écran, le panneau actif
 * s'ouvre (flex) en lime pour révéler sa description ; les autres se replient avec leur titre
 * à la verticale. Défilement automatique tant que le visiteur n'interagit pas.
 * Sur mobile, les cartes sont empilées et toutes ouvertes.
 */
export function SolutionPicker({ title, items, cta }: { title: string; items: Item[]; cta: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % items.length), 3800);
    return () => window.clearTimeout(t);
  }, [active, paused, items.length]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p className="mb-6 text-center text-sm font-medium text-white/70">{title}</p>

      <ul className="flex flex-col gap-3 lg:h-[23rem] lg:flex-row lg:gap-3">
        {items.map((item, i) => {
          const Icon = icons[item.slug];
          const on = i === active;
          return (
            <motion.li
              key={item.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              data-active={on}
              onMouseEnter={() => setActive(i)}
              className={`group relative min-w-0 overflow-hidden rounded-3xl transition-[flex-grow,background-color,box-shadow] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:basis-0 ${
                on
                  ? "bg-lime text-teal shadow-[0_18px_50px_rgb(200_224_162/0.35)] lg:grow-[3.4]"
                  : "bg-white/10 text-white lg:grow-[1] hover:bg-white/[0.16]"
              } max-lg:bg-white/10 max-lg:text-white max-lg:shadow-none`}
            >
              <Link
                href={item.href}
                aria-label={item.name}
                onFocus={() => setActive(i)}
                className="relative flex h-full min-h-[11rem] flex-col justify-between p-6 outline-none focus-visible:ring-4 focus-visible:ring-lime/60 lg:min-h-0"
              >
                {/* Numéro en filigrane */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-5 top-3 text-6xl font-semibold leading-none tracking-tight transition-colors duration-500 ${
                    on ? "text-teal/15" : "text-white/10 lg:opacity-0"
                  } max-lg:text-white/10`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Reflet qui balaie le panneau actif */}
                {on && (
                  <span
                    aria-hidden="true"
                    className="ps-sheen pointer-events-none absolute inset-y-0 -left-1/2 hidden w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent lg:block"
                  />
                )}

                <span
                  className={`relative grid size-12 place-items-center rounded-2xl transition-colors duration-500 ${
                    on ? "animate-pop bg-teal text-lime" : "bg-white/15 text-lime"
                  } max-lg:bg-white/15 max-lg:text-lime`}
                >
                  <Icon className="size-6" />
                </span>

                {/* Titre à la verticale quand le panneau est replié (grand écran) */}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-6 left-6 hidden max-h-[60%] text-xl font-semibold leading-none tracking-tight transition-opacity duration-300 [writing-mode:vertical-rl] rotate-180 lg:block ${
                    on ? "opacity-0" : "opacity-100 delay-300"
                  }`}
                >
                  {item.name}
                </span>

                <span className="relative mt-6 block lg:mt-0">
                  <span
                    className={`block transition-all duration-500 ${
                      on ? "translate-y-0 opacity-100 delay-200" : "lg:pointer-events-none lg:translate-y-3 lg:opacity-0"
                    } max-lg:translate-y-0 max-lg:opacity-100`}
                  >
                    <span className="block text-2xl font-semibold leading-tight tracking-tight">{item.name}</span>
                    <span
                      className={`mt-2 block max-w-xs text-[15px] leading-relaxed ${
                        on ? "text-teal/75" : "text-white/70"
                      } max-lg:text-white/70`}
                    >
                      {item.short}
                    </span>
                    <span
                      className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${
                        on ? "text-teal" : "text-lime"
                      } max-lg:text-lime`}
                    >
                      {cta}
                      <ArrowIcon
                        className={`size-4 transition-transform duration-500 ${on ? "translate-x-1" : ""}`}
                      />
                    </span>
                  </span>
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>

      {/* Indicateurs : suivent le panneau actif */}
      <div className="mt-6 hidden items-center justify-center gap-2 lg:flex" aria-hidden="true">
        {items.map((item, i) => (
          <span
            key={item.slug}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === active ? "w-9 bg-lime" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
