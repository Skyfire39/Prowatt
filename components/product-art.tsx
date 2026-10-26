"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Illustration d'un montage de panneau sur toit plat (rail, pieds, pince, panneau).
 * Elle se trace à l'apparition, flotte doucement et s'incline légèrement vers le pointeur.
 * `compact` : version sans inclinaison pour les vignettes.
 */
export function ProductArt({ compact = false }: { compact?: boolean }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 18 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (compact || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  const draw = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.1, delay, ease },
  });
  const pop = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
  });

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="grid size-full place-items-center [perspective:900px]"
    >
      <motion.div style={{ rotateX, rotateY }} className="size-full">
        <motion.svg
          viewBox="0 0 480 340"
          role="img"
          aria-hidden="true"
          className="size-full overflow-visible"
          animate={reduce || compact ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Sol / toit plat */}
          <motion.path d="M30 292 H450" stroke="var(--ink)" strokeOpacity="0.28" strokeWidth="3" strokeLinecap="round" fill="none" {...draw(0)} />
          <motion.g {...pop(0.15)}>
            <ellipse cx="240" cy="304" rx="170" ry="9" fill="var(--ink)" opacity="0.12" />
          </motion.g>

          {/* Rail aluminium */}
          <motion.g {...pop(0.25)}>
            <rect x="46" y="244" width="388" height="26" rx="6" fill="#dfe8f2" stroke="var(--brand-teal)" strokeWidth="3" />
            <path d="M60 252 H420 M60 262 H420" stroke="var(--brand-teal)" strokeOpacity="0.28" strokeWidth="2" />
          </motion.g>

          {/* Pieds en L */}
          {[110, 240, 370].map((x, i) => (
            <motion.g key={x} {...pop(0.4 + i * 0.12)}>
              <path d={`M${x - 20} 292 V270 H${x + 20} V292 Z`} fill="#c9d6e6" stroke="var(--brand-teal)" strokeWidth="3" strokeLinejoin="round" />
              <path d={`M${x} 270 V232`} stroke="var(--brand-teal)" strokeWidth="9" strokeLinecap="round" />
            </motion.g>
          ))}

          {/* Pince centrale */}
          <motion.g {...pop(0.85)}>
            <rect x="214" y="204" width="52" height="16" rx="5" fill="var(--brand-lime)" stroke="var(--brand-teal)" strokeWidth="3" />
            <path d="M240 220 V240" stroke="var(--brand-teal)" strokeWidth="6" strokeLinecap="round" />
            <circle cx="240" cy="212" r="3" fill="var(--brand-teal)" />
          </motion.g>

          {/* Panneau solaire */}
          <motion.g {...pop(1)}>
            <rect x="60" y="150" width="360" height="54" rx="8" fill="var(--brand-teal)" />
            <rect x="60" y="150" width="360" height="54" rx="8" fill="none" stroke="var(--brand-lime)" strokeWidth="3" />
            <path d="M120 150 V204 M180 150 V204 M240 150 V204 M300 150 V204 M360 150 V204 M60 177 H420" stroke="var(--brand-lime)" strokeOpacity="0.4" strokeWidth="2" />
          </motion.g>

          {/* Soleil et rayons */}
          <motion.g {...pop(1.2)}>
            <circle cx="394" cy="76" r="26" fill="var(--brand-lime)" />
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const r = (n: number) => Number(n.toFixed(1));
              return (
                <line
                  key={i}
                  x1={r(394 + Math.cos(a) * 38)}
                  y1={r(76 + Math.sin(a) * 38)}
                  x2={r(394 + Math.cos(a) * 52)}
                  y2={r(76 + Math.sin(a) * 52)}
                  stroke="var(--brand-lime)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })}
          </motion.g>
        </motion.svg>
      </motion.div>
    </div>
  );
}
