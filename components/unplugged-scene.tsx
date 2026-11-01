import type { CSSProperties } from "react";
import { Sparkle } from "./day-scene";

const INK = "#12413c";
const TEAL = "#175c55";
const LIME = "#c8e0a2";
const HOT = "#f2c94c";

/** Direction (en degrés) et longueur des traits d'étincelle qui jaillissent du point de contact. */
const rays = [
  { a: -150, from: 62, len: 30 },
  { a: -118, from: 70, len: 38 },
  { a: -84, from: 66, len: 34 },
  { a: -52, from: 70, len: 38 },
  { a: -24, from: 60, len: 28 },
  { a: 28, from: 60, len: 28 },
  { a: 58, from: 70, len: 38 },
  { a: 92, from: 66, len: 34 },
  { a: 124, from: 70, len: 38 },
  { a: 152, from: 62, len: 30 },
];
const CX = 500;
const CY = 218;
const r1 = (v: number) => Math.round(v * 10) / 10;

/** Traits de contour communs : épais et arrondis comme sur un dessin au trait. */
const line = { stroke: INK, strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/**
 * Illustration de la page 404 : la prise est débranchée. Les deux fiches, reliées à leur câble, s'approchent et
 * s'écartent sans jamais se toucher ; des étincelles jaillissent du vide, un arc électrique grésille entre les deux
 * et un grand « 404 » en filigrane se cache derrière.
 */
export function UnpluggedScene({ label }: { label: string }) {
  return (
    <div className="relative h-64 w-full overflow-hidden sm:h-[28rem]">
      {/* L'illustration garde ses proportions au centre ; les câbles, eux, débordent du dessin jusqu'aux bords de la page. */}
      <svg viewBox="0 0 1000 450" role="img" aria-label={label} className="absolute left-1/2 top-0 h-full w-full min-w-[680px] -translate-x-1/2 overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="pu-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff7c9" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#f3f9c8" stopOpacity="0.45" />
            <stop offset="1" stopColor={LIME} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pu-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#f1f8e6" />
            <stop offset="1" stopColor={LIME} />
          </linearGradient>
        </defs>

        {/* 404 en filigrane, le « 0 » encadre le point de contact */}
        <text
          x="500"
          y="336"
          textAnchor="middle"
          fill={LIME}
          fillOpacity="0.5"
          stroke={TEAL}
          strokeOpacity="0.14"
          strokeWidth="2"
          style={{ fontFamily: "var(--font-reddit), sans-serif", fontSize: 340, fontWeight: 800, letterSpacing: "-0.04em" }}
        >
          404
        </text>

        <circle cx={CX} cy={CY} r="190" fill="url(#pu-glow)" className="sa-pulse" style={{ animationDuration: "3.4s" }} />

        {/* Câbles : ils partent des bords et rejoignent l'arrière de chaque fiche */}
        <g fill="none" {...line}>
          <path d="M-4000 318H-10C60 318 96 150 168 170S214 292 262 256S296 236 323 235" />
          <path d="M-4000 318H-10C60 318 96 150 168 170S214 292 262 256S296 236 323 235" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" transform="translate(0 -1.5)" />
          <path d="M704 237C748 214 770 118 836 132S890 292 952 266S980 252 1010 252H5000" />
          <path d="M704 237C748 214 770 118 836 132S890 292 952 266S980 252 1010 252H5000" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" transform="translate(0 -1.5)" />
        </g>

        {/* Fiche femelle (gauche) : glisse vers la droite puis recule */}
        <g className="pu-left">
          <g transform="translate(446 220) rotate(-7)">
            <rect x="-142" y="-9" width="46" height="18" rx="6" fill="#dcefe6" {...line} />
            <rect x="-96" y="-22" width="30" height="44" rx="8" fill="#dcefe6" {...line} />
            <path d="M-66 -34Q-66 -40 -58 -40H-14Q-8 -40 -6 -34L-3 34Q-5 40 -12 40H-58Q-66 40 -66 34Z" fill="url(#pu-body)" {...line} />
            <path d="M-56 18H-12" stroke={TEAL} strokeOpacity="0.28" strokeWidth="3" strokeLinecap="round" />
            <rect x="-9" y="-46" width="16" height="92" rx="7" fill="#fff" {...line} />
            <ellipse cx="2" cy="0" rx="4.5" ry="34" fill="#cdeaf0" stroke={INK} strokeWidth="3.5" />
            <ellipse cx="2" cy="-12" rx="1.8" ry="4" fill={INK} />
            <ellipse cx="2" cy="12" rx="1.8" ry="4" fill={INK} />
          </g>
        </g>

        {/* Fiche mâle (droite) : glisse vers la gauche puis recule */}
        <g className="pu-right">
          <g transform="translate(556 216) rotate(8)">
            <rect x="0" y="-22" width="46" height="9" rx="4" fill="#fff" {...line} />
            <rect x="0" y="13" width="46" height="9" rx="4" fill="#fff" {...line} />
            <rect x="8" y="-18" width="32" height="3.5" rx="1.5" fill={HOT} />
            <rect x="40" y="-12" width="14" height="24" rx="5" fill="#fff" {...line} />
            <path d="M54 -44H112Q130 -44 130 -26V26Q130 44 112 44H54Z" fill="url(#pu-body)" {...line} />
            <path d="M64 24H118" stroke={TEAL} strokeOpacity="0.28" strokeWidth="3" strokeLinecap="round" />
            <rect x="118" y="-52" width="16" height="104" rx="7" fill="#fff" {...line} />
            <rect x="134" y="-11" width="40" height="22" rx="7" fill="#dcefe6" {...line} />
          </g>
        </g>

        {/* Arc électrique entre les deux fiches */}
        <path d="M486 214l10 -9 8 14 9 -16 9 12" fill="none" stroke={HOT} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="pc-flicker" />

        {/* Étincelles qui jaillissent du vide */}
        {rays.map((r, i) => {
          const rad = (r.a * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          return (
            <line
              key={i}
              x1={r1(CX + cos * r.from)}
              y1={r1(CY + sin * r.from)}
              x2={r1(CX + cos * (r.from + r.len))}
              y2={r1(CY + sin * (r.from + r.len))}
              stroke={i % 3 === 0 ? HOT : INK}
              strokeWidth="5"
              strokeLinecap="round"
              className="pu-burst"
              style={{ "--dx": `${r1(cos * 14)}px`, "--dy": `${r1(sin * 14)}px`, animationDelay: `${(i % 5) * 0.16}s` } as CSSProperties}
            />
          );
        })}
        <Sparkle x={420} y={150} r={11} delay={0.3} fill="#fff" />
        <Sparkle x={590} y={142} r={9} delay={1.1} fill={HOT} />
        <Sparkle x={540} y={300} r={10} delay={1.9} fill="#fff" />
        <Sparkle x={455} y={296} r={8} delay={0.7} fill={HOT} />

        {/* Poussières lumineuses */}
        {[
          [120, 96, 0],
          [250, 64, 1.1],
          [760, 70, 0.5],
          [880, 110, 1.7],
          [180, 380, 2.2],
          [820, 360, 0.9],
        ].map(([x, y, d]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="3.2" fill={TEAL} fillOpacity="0.35" className="sa-float" style={{ animationDelay: `${d}s`, animationDuration: "5s" }} />
        ))}
      </svg>
    </div>
  );
}
