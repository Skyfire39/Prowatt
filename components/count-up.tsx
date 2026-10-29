"use client";

import { useEffect, useRef } from "react";

/**
 * Compteur qui monte de 0 à `value` une fois affiché. Le HTML contient déjà la valeur finale (visible sans JavaScript ou
 * si l'animation est désactivée) ; le texte est animé directement dans le DOM, sans rendu React à chaque image.
 */
export function CountUp({ value, duration = 1400, delay = 700 }: { value: number; duration?: number; delay?: number }) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    node.textContent = "0";
    const timer = window.setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        node.textContent = String(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [value, duration, delay]);

  return (
    <span ref={el} className="tabular-nums">
      {value}
    </span>
  );
}
