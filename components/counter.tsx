"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * `display` est la valeur finale déjà formatée côté serveur : elle sert au
 * rendu initial (SEO, sans JS). L'animation ne touche au DOM qu'à l'entrée
 * dans le viewport.
 */
export function Counter({
  value,
  display,
  locale,
}: {
  value: number;
  display: string;
  locale: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    const fmt = new Intl.NumberFormat(locale);
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = fmt.format(Math.round(v));
      },
      onComplete: () => {
        el.textContent = display;
      },
    });
    return () => controls.stop();
  }, [inView, value, display, locale]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {display}
    </span>
  );
}
