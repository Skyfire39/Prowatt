"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type Item = { name: string; photo: string; text: string };
type Labels = { prev: string; next: string; goTo: string; label: string };

/**
 * Avis clients en carrousel : défilement tactile natif avec accroche, flèches, points, et lecture
 * automatique (une carte toutes les ~5 s) qui se met en pause au survol, au focus, hors écran ou
 * avec « réduire les animations ».
 */
export function TestimonialSlider({ items, labels, interval = 5000 }: { items: Item[]; labels: Labels; interval?: number }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [stops, setStops] = useState(items.length);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  const step = useCallback(() => {
    const el = track.current;
    const card = el?.children[0] as HTMLElement | undefined;
    if (!el || !card) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return card.offsetWidth + gap;
  }, []);

  const measure = useCallback(() => {
    const el = track.current;
    const s = step();
    if (!el || !s) return;
    const max = el.scrollWidth - el.clientWidth;
    setStops(Math.max(1, Math.round(max / s) + 1));
    setIndex(Math.min(Math.round(el.scrollLeft / s), Math.round(max / s)));
  }, [step]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [measure]);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      el.scrollTo({ left: Math.max(0, Math.min(i * step(), max)), behavior: "smooth" });
    },
    [step],
  );

  const move = useCallback(
    (dir: 1 | -1) => {
      const el = track.current;
      const s = step();
      if (!el || !s) return;
      goTo(Math.round(el.scrollLeft / s) + dir);
    },
    [goTo, step],
  );

  // Lecture automatique : on revient au début après la dernière position.
  useEffect(() => {
    if (paused || !visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => goTo(index + 1 >= stops ? 0 : index + 1), interval);
    return () => window.clearInterval(id);
  }, [paused, visible, index, stops, interval, goTo]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <ul
        ref={track}
        onScroll={measure}
        className="flex snap-xsnap-proximity gap-4 overflow-x-auto scroll-smooth overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((t, i) => (
          <motion.li
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${items.length}`}
            className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
          >
            <figure className="glass-teal relative flex h-full flex-col overflow-hidden rounded-3xl p-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]">
              <span aria-hidden="true" className="pointer-events-none absolute -right-1 -top-6 select-none text-[7rem] leading-none text-lime/20">
                ”
              </span>
              <div className="relative flex items-center gap-3">
                <Image src={t.photo} alt="" width={96} height={96} className="size-12 rounded-full object-cover ring-2 ring-lime/40" />
                <figcaption className="text-sm font-semibold">{t.name}</figcaption>
              </div>
              <blockquote className="relative mt-6 flex-1 text-lg leading-snug tracking-tight">{t.text}</blockquote>
            </figure>
          </motion.li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={index <= 0}
          aria-label={labels.prev}
          className="glass-chip grid size-11 place-items-center rounded-full text-teal transition-opacity enabled:hover:opacity-70 disabled:opacity-35"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: stops }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={labels.goTo.replace("{n}", String(i + 1))}
              aria-current={i === index}
              className="grid h-6 place-items-center px-0.5"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-teal" : "w-2 bg-teal/30"}`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={index >= stops - 1}
          aria-label={labels.next}
          className="glass-chip grid size-11 place-items-center rounded-full text-teal transition-opacity enabled:hover:opacity-70 disabled:opacity-35"
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
