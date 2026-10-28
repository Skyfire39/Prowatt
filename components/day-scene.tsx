"use client";

import { useId, type ReactNode } from "react";
import { num } from "./scene-parts";

export const TEAL = "#175c55";
export const DEEP = "#123f3a";
export const PIPE = "#4f6f78";
export const WARM = "#ffe9a8";
export const COLD = "#4fc3cc";
export const AQUA = "#9fe8ee";
export const HOT = "#f2c94c";
export const RIM = "#f3f9e6";

/** Vague horizontale qui se répète tous les 80 px : on la fait glisser de 80 px en boucle. */
export const wave = (y: number, amp: number) => {
  let d = `M-80 ${y}`;
  for (let x = -80; x < 1120; x += 80) d += `q20 ${-amp} 40 0 t40 0`;
  return `${d}V450H-80Z`;
};

const star = (x: number, y: number, r: number) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

export function Sparkle({ x, y, r = 9, delay = 0, fill = "#fff6dc" }: { x: number; y: number; r?: number; delay?: number; fill?: string }) {
  return <path d={star(x, y, r)} fill={fill} className="sa-twinkle" style={{ animationDelay: `${delay}s` }} />;
}

/** Touffe de feuilles posée sur l'herbe. */
export function Bush({ x, y, s = 1, tones }: { x: number; y: number; s?: number; tones: [string, string, string] }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="40" ry="10" fill={tones[0]} />
      <g className="sa-sway">
        {[-72, -48, -24, 0, 24, 48, 72].map((a, i) => (
          <path key={a} d="M0 0Q-9 -26 0 -52Q9 -26 0 0Z" fill={tones[i % 3]} transform={`rotate(${a}) scale(${num(1 - Math.abs(a) / 260)})`} />
        ))}
      </g>
    </g>
  );
}

export function Flower({ x, y, h, delay }: { x: number; y: number; h: number; delay: number }) {
  return (
    <g className="sa-sway" style={{ animationDelay: `${delay}s` }}>
      <path d={`M${x} ${y}Q${x - 4} ${y - h / 2} ${x} ${y - h}`} stroke="#3c8f78" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx={x} cy={y - h} r="6" fill="#fff3d6" />
      <circle cx={x} cy={y - h} r="2.6" fill="#f2b84b" />
    </g>
  );
}

export function Baobab({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <path d="M-13 0C-9 -26 -17 -44 -21 -66H21C17 -44 9 -26 13 0Z" />
      <path d="M-18 -64L-34 -84M-8 -66L-12 -94M6 -66L14 -96M18 -64L36 -82" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      <g className="sa-sway">
        <ellipse cx="-34" cy="-88" rx="18" ry="8" />
        <ellipse cx="-12" cy="-98" rx="17" ry="8" />
        <ellipse cx="14" cy="-100" rx="17" ry="8" />
        <ellipse cx="37" cy="-86" rx="17" ry="8" />
      </g>
    </g>
  );
}

export function Chip({ x, y, text, delay = 0 }: { x: number; y: number; text: string; delay?: number }) {
  const w = Math.round(text.length * 8.6 + 44);
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="sa-float" style={{ animationDelay: `${delay}s` }}>
        <rect x={-w / 2} y="-16" width={w} height="32" rx="16" fill="#fff" fillOpacity="0.94" stroke={TEAL} strokeOpacity="0.2" />
        <circle cx={-w / 2 + 17} cy="0" r="4.5" fill={COLD} />
        <text x={-w / 2 + 29} dy="0.35em" fontSize="16" fontWeight="600" fill={DEEP}>
          {text}
        </text>
      </g>
    </g>
  );
}

/**
 * Décor commun des bannières illustrées en plein jour : ciel clair, soleil, nuages, collines, baobabs et coupe de terrain.
 * `children` dessine la scène par-dessus (il reçoit `ref` pour les dégradés et `u` pour les identifiants de cette bannière).
 */
export function DayFrame({
  aria,
  defs,
  children,
}: {
  aria: string;
  defs?: (u: (s: string) => string) => ReactNode;
  children: (ref: (s: string) => string, u: (s: string) => string) => ReactNode;
}) {
  const uid = useId().replace(/\W/g, "");
  const u = (s: string) => `${uid}-${s}`;
  const ref = (s: string) => `url(#${u(s)})`;

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-[0_24px_60px_-24px_rgb(23_92_85/0.5)] ring-1 ring-teal/10 max-sm:h-60 sm:h-[28rem]">
      <svg viewBox="0 0 1000 450" role="img" aria-label={aria} className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={u("sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fd0d6" />
            <stop offset="0.55" stopColor="#c4ebec" />
            <stop offset="1" stopColor="#eef6dd" />
          </linearGradient>
          <radialGradient id={u("glow")} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fffbe0" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#f3f9c8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#c8e0a2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={u("hill")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9cc66a" />
            <stop offset="1" stopColor="#5f9a50" />
          </linearGradient>
          <linearGradient id={u("soil")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e4eec8" />
            <stop offset="1" stopColor="#a9c585" />
          </linearGradient>
          <linearGradient id={u("aqua")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6fd6dc" />
            <stop offset="1" stopColor="#1a7f8e" />
          </linearGradient>
          <linearGradient id={u("panel")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4fd0d6" />
            <stop offset="1" stopColor="#1d7f8c" />
          </linearGradient>
          <linearGradient id={u("heat")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={HOT} stopOpacity="0" />
            <stop offset="1" stopColor={HOT} stopOpacity="0.9" />
          </linearGradient>
          <clipPath id={u("under")}>
            <rect x="0" y="300" width="1000" height="150" />
          </clipPath>
          <filter id={u("grain")} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 0 0.2  0 0 0 0.55 -0.12" />
          </filter>
          {defs?.(u)}
        </defs>

        {/* Ciel */}
        <rect width="1000" height="300" fill={ref("sky")} />
        <circle cx="820" cy="170" r="300" fill={ref("glow")} className="sa-pulse" style={{ animationDuration: "7s" }} />
        <circle cx="820" cy="96" r="32" fill="#ffe9a8" />
        <circle cx="820" cy="96" r="22" fill="#fff6cf" />
        <g className="rb-cloud" fill="#fff" fillOpacity="0.92">
          <ellipse cx="150" cy="70" rx="52" ry="15" />
          <ellipse cx="122" cy="60" rx="24" ry="15" />
          <ellipse cx="178" cy="58" rx="28" ry="17" />
        </g>
        <g className="rb-cloud" fill="#fff" fillOpacity="0.85" style={{ animationDuration: "58s", animationDelay: "-20s" }}>
          <ellipse cx="620" cy="52" rx="44" ry="12" />
          <ellipse cx="598" cy="45" rx="20" ry="12" />
          <ellipse cx="646" cy="44" rx="24" ry="14" />
        </g>
        <g className="rb-cloud" fill="#fff" fillOpacity="0.75" style={{ animationDuration: "70s", animationDelay: "-40s" }}>
          <ellipse cx="930" cy="150" rx="40" ry="11" />
          <ellipse cx="910" cy="143" rx="18" ry="11" />
        </g>
        <Sparkle x={150} y={30} r={7} delay={0.4} />
        <Sparkle x={420} y={60} r={6} delay={1.6} />
        <Sparkle x={930} y={40} r={8} delay={2.3} />

        {/* Collines et baobabs */}
        <path d="M0 262C140 232 280 246 430 226S700 190 1000 170V320H0Z" fill="#b5dcd2" />
        <path d="M0 300C200 266 380 292 560 270S860 258 1000 276V320H0Z" fill={ref("hill")} />
        <path d="M0 300C200 266 380 292 560 270S860 258 1000 276" fill="none" stroke={RIM} strokeOpacity="0.8" strokeWidth="2" />
        <Baobab x={92} y={288} s={1} color={DEEP} />
        <Baobab x={920} y={278} s={0.85} color={DEEP} />

        {/* Coupe de terrain : couches et cailloux */}
        <rect x="0" y="300" width="1000" height="150" fill={ref("soil")} />
        <rect x="0" y="296" width="1000" height="9" fill="#4f9a55" />
        <path d="M0 296H1000" stroke={RIM} strokeOpacity="0.6" strokeWidth="2" />
        <path d="M0 332C150 322 300 342 460 330S760 336 1000 326M0 366C200 358 360 374 560 362S860 368 1000 360" fill="none" stroke={TEAL} strokeOpacity="0.2" strokeWidth="2" />
        {[
          [80, 335, 9],
          [160, 372, 7],
          [610, 330, 8],
          [720, 372, 10],
          [870, 340, 7],
          [940, 372, 8],
        ].map(([x, y, r]) => (
          <ellipse key={`${x}${y}`} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#8fb55a" fillOpacity="0.55" />
        ))}

        {children(ref, u)}

        {/* Grain de papier */}
        <rect width="1000" height="450" filter={ref("grain")} opacity="0.3" />
      </svg>
    </div>
  );
}
