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
const at = (u: number, v: number): Pt => lerp(lerp(BL, BR, u), lerp(TL, TR, u), v);
const r = (n: number) => Number(n.toFixed(2));
const fmt = ([x, y]: Pt) => `${r(x)},${r(y)}`;

/** Panneau solaire en aplats. Pensé pour un fond teal : trait lime, corps teal foncé. */
export function SolarPanelArt(props: SVGProps<SVGSVGElement>) {
  const cols = 6;
  const rows = 4;
  const lines: string[] = [];
  for (let i = 1; i < cols; i++) lines.push(`M${fmt(at(i / cols, 0))}L${fmt(at(i / cols, 1))}`);
  for (let j = 1; j < rows; j++) lines.push(`M${fmt(at(0, j / rows))}L${fmt(at(1, j / rows))}`);

  return (
    <svg viewBox="0 0 400 300" role="img" aria-hidden="true" {...props}>
      <circle cx="78" cy="58" r="26" fill="#c8e0a2" />
      <g stroke="#c8e0a2" strokeWidth="3" strokeLinecap="round">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={r(78 + Math.cos(a) * 38)}
              y1={r(58 + Math.sin(a) * 38)}
              x2={r(78 + Math.cos(a) * 50)}
              y2={r(58 + Math.sin(a) * 50)}
            />
          );
        })}
      </g>
      <path
        d={`M${fmt(at(0.3, 0))}L170 288M${fmt(at(0.8, 0))}L250 288`}
        stroke="#c8e0a2"
        strokeOpacity="0.55"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <polygon
        points={[BL, BR, TR, TL].map(fmt).join(" ")}
        fill="#0d3b36"
        stroke="#c8e0a2"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d={lines.join("")} stroke="#c8e0a2" strokeOpacity="0.45" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Scooter électrique en aplats. Couleurs pilotées par des variables CSS :
 * --moto-a corps, --moto-b batterie, --moto-line roues et cadre (currentColor par défaut).
 */
export function MotoArt(props: SVGProps<SVGSVGElement>) {
  const line = "var(--moto-line, currentColor)";
  const wheel = (cx: number) => (
    <g>
      <circle cx={cx} cy="190" r="56" fill="none" stroke={line} strokeWidth="8" />
      <circle cx={cx} cy="190" r="9" fill="var(--moto-b, #c8e0a2)" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={r(cx + Math.cos(a) * 9)}
            y1={r(190 + Math.sin(a) * 9)}
            x2={r(cx + Math.cos(a) * 48)}
            y2={r(190 + Math.sin(a) * 48)}
            stroke={line}
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
        );
      })}
    </g>
  );

  return (
    <svg viewBox="0 0 440 280" role="img" aria-hidden="true" className="text-ink" {...props}>
      <line x1="40" y1="250" x2="400" y2="250" stroke={line} strokeOpacity="0.25" strokeWidth="2" />
      {wheel(100)}
      {wheel(340)}
      <path d="M100 190 L180 178" stroke={line} strokeWidth="8" strokeLinecap="round" />
      <path d="M340 190 L300 92" stroke={line} strokeWidth="8" strokeLinecap="round" />
      <path
        d="M112 142 C140 112 210 104 262 116 L302 98 C322 94 332 102 326 114 L298 142 C262 160 200 170 160 170 C136 170 118 160 112 142 Z"
        fill="var(--moto-a, #175c55)"
      />
      <rect x="168" y="138" width="92" height="46" rx="10" fill="var(--moto-b, #c8e0a2)" />
      <path d="M222 146l-14 18h12l-4 14 18-22h-12l4-10z" fill="var(--moto-a, #175c55)" />
      <path d="M96 128 C120 112 168 108 214 112 L214 124 C170 122 130 126 100 140 Z" fill={line} />
      <path d="M296 90 L286 66 L316 60" stroke={line} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M322 100 l22 -4 l-4 16 l-20 2z" fill="var(--moto-b, #c8e0a2)" />
      <path d="M306 128 C330 116 366 120 384 140" stroke="var(--moto-a, #175c55)" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );
}
