import { useId } from "react";
import type { SVGProps } from "react";

type Pt = [number, number];
const lerp = (a: Pt, b: Pt, t: number): Pt => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

const BL: Pt = [40, 250];
const BR: Pt = [270, 250];
const TL: Pt = [120, 80];
const TR: Pt = [350, 80];
const at = (u: number, v: number): Pt =>
  lerp(lerp(BL, BR, u), lerp(TL, TR, u), v);
const r = (n: number) => Number(n.toFixed(2));
const fmt = ([x, y]: Pt) => `${x.toFixed(1)},${y.toFixed(1)}`;

export function SolarPanelArt(props: SVGProps<SVGSVGElement>) {
  const u = useId().replace(/[^a-zA-Z0-9_]/g, "");
  const cols = 6;
  const rows = 4;
  const lines: string[] = [];
  for (let i = 1; i < cols; i++) lines.push(`M${fmt(at(i / cols, 0))}L${fmt(at(i / cols, 1))}`);
  for (let j = 1; j < rows; j++) lines.push(`M${fmt(at(0, j / rows))}L${fmt(at(1, j / rows))}`);

  return (
    <svg viewBox="0 0 400 300" role="img" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={`sp-panel-${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a8a7d" />
          <stop offset="0.55" stopColor="#175c55" />
          <stop offset="1" stopColor="#0d3a36" />
        </linearGradient>
        <linearGradient id={`sp-shine-${u}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`sp-sun-${u}`}>
          <stop offset="0" stopColor="#f6ffd9" />
          <stop offset="0.5" stopColor="#c8e0a2" />
          <stop offset="1" stopColor="#c8e0a2" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`sp-clip-${u}`}>
          <polygon points={[BL, BR, TR, TL].map(fmt).join(" ")} />
        </clipPath>
      </defs>

      <circle cx="78" cy="58" r="52" fill={`url(#sp-sun-${u})`} />
      <circle cx="78" cy="58" r="22" fill="#e9f6c9" />
      <g stroke="#c8e0a2" strokeWidth="3" strokeLinecap="round" opacity="0.9">
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={r(78 + Math.cos(a) * 34)}
              y1={r(58 + Math.sin(a) * 34)}
              x2={r(78 + Math.cos(a) * 46)}
              y2={r(58 + Math.sin(a) * 46)}
            />
          );
        })}
      </g>

      <path d={`M${fmt(at(0.3, 0))}L170 285M${fmt(at(0.8, 0))}L250 285`} stroke="#175c55" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
      <polygon
        points={[BL, BR, TR, TL].map(fmt).join(" ")}
        fill={`url(#sp-panel-${u})`}
        stroke="#c8e0a2"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <g clipPath={`url(#sp-clip-${u})`}>
        <path d={lines.join("")} stroke="#c8e0a2" strokeOpacity="0.55" strokeWidth="1.6" />
        <polygon points="120,80 190,80 120,250 50,250" fill={`url(#sp-shine-${u})`} transform="translate(120 0)" />
      </g>
    </svg>
  );
}

export function MotoArt(props: SVGProps<SVGSVGElement>) {
  const u = useId().replace(/[^a-zA-Z0-9_]/g, "");
  const wheel = (cx: number) => (
    <g>
      <circle cx={cx} cy="190" r="58" fill="none" stroke="currentColor" strokeWidth="9" />
      <circle cx={cx} cy="190" r="44" fill="none" stroke="#c8e0a2" strokeOpacity="0.5" strokeWidth="2" />
      <circle cx={cx} cy="190" r="10" fill="#c8e0a2" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={r(cx + Math.cos(a) * 10)}
            y1={r(190 + Math.sin(a) * 10)}
            x2={r(cx + Math.cos(a) * 44)}
            y2={r(190 + Math.sin(a) * 44)}
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="2"
          />
        );
      })}
    </g>
  );

  return (
    <svg viewBox="0 0 440 280" role="img" aria-hidden="true" className="text-ink" {...props}>
      <defs>
        <linearGradient id={`mo-body-${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--moto-a, #2a8a7d)" }} />
          <stop offset="1" style={{ stopColor: "var(--moto-b, #175c55)" }} />
        </linearGradient>
        <linearGradient id={`mo-batt-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dff0bd" />
          <stop offset="1" stopColor="#c8e0a2" />
        </linearGradient>
      </defs>

      <ellipse cx="220" cy="256" rx="170" ry="9" fill="currentColor" opacity="0.12" />
      {wheel(100)}
      {wheel(340)}

      {/* bras oscillant + fourche */}
      <path d="M100 190 L180 178" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <path d="M340 190 L300 92" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />

      {/* carénage */}
      <path
        d="M112 142 C140 112 210 104 262 116 L302 98 C322 94 332 102 326 114 L298 142 C262 160 200 170 160 170 C136 170 118 160 112 142 Z"
        fill={`url(#mo-body-${u})`}
      />
      {/* batterie */}
      <rect x="168" y="138" width="92" height="46" rx="12" fill={`url(#mo-batt-${u})`} stroke="#175c55" strokeWidth="3" />
      <path d="M222 146l-14 18h12l-4 14 18-22h-12l4-10z" fill="#175c55" />
      {/* selle */}
      <path d="M96 128 C120 112 168 108 214 112 L214 124 C170 122 130 126 100 140 Z" fill="currentColor" />
      {/* guidon + phare */}
      <path d="M296 90 L286 66 L316 60" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M322 100 l22 -4 l-4 16 l-20 2z" fill="#f6ffd9" stroke="#c8e0a2" strokeWidth="3" strokeLinejoin="round" />
      {/* garde-boue */}
      <path d="M306 128 C330 116 366 120 384 140" stroke="#175c55" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );
}
