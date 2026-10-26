"use client";

import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type BubbleTail = "left" | "right" | "top" | "bottom" | "none";

const TAIL = 16; // profondeur de la pointe
const TAIL_W = 26; // largeur de sa base

/** Contour d'une bulle (rectangle arrondi + pointe sur un côté), dans un cadre de w × h pixels. */
function bubblePath(w: number, h: number, radius: number, tail: BubbleTail, pos: number) {
  const x0 = tail === "left" ? TAIL : 0;
  const x1 = w - (tail === "right" ? TAIL : 0);
  const y0 = tail === "top" ? TAIL : 0;
  const y1 = h - (tail === "bottom" ? TAIL : 0);
  const r = Math.max(0, Math.min(radius, (x1 - x0) / 2, (y1 - y0) / 2));
  const cx = x0 + (x1 - x0) * pos;
  const cy = y0 + (y1 - y0) * pos;
  const hw = TAIL_W / 2;
  const f = (n: number) => Number(n.toFixed(1));

  const d: (string | number)[] = [`M${f(x0 + r)} ${f(y0)}`];
  if (tail === "top") d.push(`L${f(cx - hw)} ${f(y0)} L${f(cx)} 0 L${f(cx + hw)} ${f(y0)}`);
  d.push(`H${f(x1 - r)} A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y0 + r)}`);
  if (tail === "right") d.push(`V${f(cy - hw)} L${f(w)} ${f(cy)} L${f(x1)} ${f(cy + hw)}`);
  d.push(`V${f(y1 - r)} A${f(r)} ${f(r)} 0 0 1 ${f(x1 - r)} ${f(y1)}`);
  if (tail === "bottom") d.push(`H${f(cx + hw)} L${f(cx)} ${f(h)} L${f(cx - hw)} ${f(y1)}`);
  d.push(`H${f(x0 + r)} A${f(r)} ${f(r)} 0 0 1 ${f(x0)} ${f(y1 - r)}`);
  if (tail === "left") d.push(`V${f(cy + hw)} L0 ${f(cy)} L${f(x0)} ${f(cy - hw)}`);
  d.push(`V${f(y0 + r)} A${f(r)} ${f(r)} 0 0 1 ${f(x0 + r)} ${f(y0)} Z`);
  return d.join(" ");
}

/**
 * Bulle d'information en verre dépoli : le contour (avec sa pointe) est tracé en SVG à la taille
 * réelle du contenu ; le flou d'arrière-plan et la teinte sont découpés dans cette même forme,
 * puis un trait dégradé et un reflet marquent l'arête du verre.
 */
export function GlassBubble({
  children,
  tail = "none",
  tailPos = 0.5,
  radius = 28,
  tone = "light",
  className = "",
  style,
}: {
  children: ReactNode;
  tail?: BubbleTail;
  /** Position de la pointe le long du côté, de 0 à 1. */
  tailPos?: number;
  radius?: number;
  tone?: "light" | "teal";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const uid = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const d = size ? bubblePath(size.w, size.h, radius, tail, tailPos) : undefined;
  const pad = {
    paddingLeft: tail === "left" ? TAIL : 0,
    paddingRight: tail === "right" ? TAIL : 0,
    paddingTop: tail === "top" ? TAIL : 0,
    paddingBottom: tail === "bottom" ? TAIL : 0,
  };
  const teal = tone === "teal";

  return (
    <div ref={ref} className={`relative ${className}`} style={{ ...pad, ...style }}>
      {d && size && (
        <>
          {/* Ombre portée, sous le verre */}
          <svg
            aria-hidden="true"
            width={size.w}
            height={size.h}
            className="pointer-events-none absolute inset-0 overflow-visible"
          >
            <defs>
              <filter id={`soft-${uid}`} x="-30%" y="-30%" width="160%" height="180%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
            </defs>
            <path d={d} fill="#175c55" opacity="0.2" filter={`url(#soft-${uid})`} transform="translate(0 14)" />
          </svg>
          {/* Verre : flou et teinte découpés dans la forme */}
          <div
            aria-hidden="true"
            className="absolute inset-0 backdrop-blur-xl backdrop-saturate-150"
            style={{
              clipPath: `path("${d}")`,
              background: teal
                ? "linear-gradient(145deg, rgb(23 92 85 / 0.88), rgb(23 92 85 / 0.7))"
                : "linear-gradient(145deg, rgb(255 255 255 / 0.78), rgb(255 255 255 / 0.4) 55%, rgb(200 224 162 / 0.34))",
            }}
          />
          <svg
            aria-hidden="true"
            width={size.w}
            height={size.h}
            viewBox={`0 0 ${size.w} ${size.h}`}
            className="pointer-events-none absolute inset-0 overflow-visible"
          >
            <defs>
              <linearGradient id={`edge-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity={teal ? 0.5 : 0.95} />
                <stop offset="0.5" stopColor="#fff" stopOpacity={teal ? 0.12 : 0.3} />
                <stop offset="1" stopColor="#fff" stopOpacity={teal ? 0.3 : 0.65} />
              </linearGradient>
              <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity={teal ? 0.2 : 0.55} />
                <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={d} fill={`url(#sheen-${uid})`} />
            <path d={d} fill="none" stroke={`url(#edge-${uid})`} strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
