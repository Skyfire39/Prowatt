"use client";

import { useId, type CSSProperties, type ReactNode } from "react";

export const LIME = "#c8e0a2";
export const MID = "#8fb55a";
export const DEEP = "#0f4a44";
export const BODY = "#f3f9e6";
export const WARM = "#ffe9a8";
export const WATER = "#7fd0d6";
export const BASE = 372;
export const SUN = { x: 548, y: 134 };

export const num = (v: number) => Number(v.toFixed(1));

/** Panneau solaire en 2D : a, b = bord bas (gauche, droite), d, c = bord haut (gauche, droite). */
export function Panel({ a, b, c, d, cols = 3, rows = 2, fill }: { a: [number, number]; b: [number, number]; c: [number, number]; d: [number, number]; cols?: number; rows?: number; fill: string }) {
  const mix = (p: [number, number], q: [number, number], t: number): [number, number] => [num(p[0] + (q[0] - p[0]) * t), num(p[1] + (q[1] - p[1]) * t)];
  const at = (u: number, v: number) => mix(mix(a, b, u), mix(d, c, u), v);
  const lines: string[] = [];
  for (let i = 1; i < cols; i++) lines.push(`M${at(i / cols, 0).join(" ")}L${at(i / cols, 1).join(" ")}`);
  for (let j = 1; j < rows; j++) lines.push(`M${at(0, j / rows).join(" ")}L${at(1, j / rows).join(" ")}`);
  return (
    <g>
      <polygon points={[a, b, c, d].map((p) => p.join(",")).join(" ")} fill={fill} stroke="#e6f6f4" strokeWidth="1.2" strokeLinejoin="round" />
      <path d={lines.join("")} stroke="#e6f6f4" strokeOpacity="0.7" strokeWidth="0.9" />
      <polygon points={[at(0.08, 0.12), at(0.3, 0.12), at(0.5, 0.88), at(0.28, 0.88)].map((p) => p.join(",")).join(" ")} fill="#fff" fillOpacity="0.2" />
    </g>
  );
}

/** Flux d'énergie ou d'eau : pointillés qui défilent le long du tracé (du premier au dernier point). */
export function Flow({ d, color = LIME, width = 2.4, dash = "2 7", opacity = 1 }: { d: string; color?: string; width?: number; dash?: string; opacity?: number }) {
  const total = dash.split(" ").reduce((s, v) => s + Number(v), 0);
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash}
      strokeOpacity={opacity}
      className="sa-flow"
      style={{ "--sa-flow": `${-total * 2}px`, transition: "stroke-opacity .5s" } as CSSProperties}
    />
  );
}

export const Battery = ({ x, y, w = 20, h = 30 }: { x: number; y: number; w?: number; h?: number }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="4" fill={LIME} />
    <rect x={x + w / 2 - 4} y={y - 4} width="8" height="5" rx="1.5" fill={MID} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x + 4} y={y + h - 9 - i * 8} width={w - 8} height="4.5" rx="1.5" fill={DEEP} className="sa-blink" style={{ animationDelay: `${i * 0.45}s` }} />
    ))}
  </g>
);

export const Window = ({ x, y, w = 14, h = 14, glow = true }: { x: number; y: number; w?: number; h?: number; glow?: boolean }) => (
  <g>
    {glow && <circle cx={x + w / 2} cy={y + h / 2} r={w * 1.15} fill={WARM} fillOpacity="0.28" className="sa-pulse" />}
    <rect x={x} y={y} width={w} height={h} rx="2.5" fill={WARM} />
  </g>
);

/**
 * Décor commun des bannières animées : ciel étoilé, soleil, collines, baobabs, flux du soleil vers chaque
 * installation et pastilles. `zones` dessine chaque installation (repère local : sol à y = 0, centre à x = 0).
 */
export function SceneFrame({
  cx,
  active,
  aria,
  keys,
  zones,
  pin,
  onPick,
}: {
  cx: readonly number[];
  active: number;
  aria: string;
  keys: string[];
  zones: (panelFill: string) => ReactNode[];
  /** Contenu de la pastille au-dessus de chaque installation. */
  pin: (i: number, on: boolean) => ReactNode;
  onPick: (i: number) => void;
}) {
  const uid = useId().replace(/\W/g, "");
  const u = (s: string) => `${uid}-${s}`;
  const ref = (s: string) => `url(#${u(s)})`;
  const list = zones(ref("panel"));
  const CX = cx;

  return (
    <svg
      viewBox="0 50 1200 410"
      role="img"
      aria-label={aria}
      className="absolute bottom-0 right-0 h-full w-full max-w-none xl:h-[90%] xl:w-auto"
      style={{ aspectRatio: "1200 / 410" }}
      preserveAspectRatio="xMaxYMax slice"
    >
      <defs>
        <linearGradient id={u("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b3f3a" />
          <stop offset="0.55" stopColor="#14594f" />
          <stop offset="1" stopColor="#3b8d78" />
        </linearGradient>
        <radialGradient id={u("sun")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor="#f7fcea" />
          <stop offset="1" stopColor={LIME} />
        </radialGradient>
        <radialGradient id={u("halo")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={LIME} stopOpacity="0.55" />
          <stop offset="1" stopColor={LIME} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={u("ground")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fa64a" />
          <stop offset="1" stopColor="#3f6b37" />
        </linearGradient>
        <linearGradient id={u("panel")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2aa6b0" />
          <stop offset="1" stopColor="#176b73" />
        </linearGradient>
        <filter id={u("blur")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <rect y="50" width="1200" height="410" fill={ref("sky")} />

      {/* Étoiles et nuages */}
      <g fill="#fff">
        {Array.from({ length: 26 }).map((_, i) => (
          <circle key={i} cx={num(30 + ((i * 197) % 1140))} cy={num(58 + ((i * 83) % 100))} r={i % 4 === 0 ? 1.8 : 1.1} fillOpacity="0.8" className="sa-twinkle" style={{ animationDelay: `${(i % 7) * 0.5}s` }} />
        ))}
      </g>
      {[
        { x: 700, y: 62, s: 1, d: "0s" },
        { x: 1010, y: 100, s: 0.75, d: "-12s" },
        { x: 860, y: 78, s: 0.6, d: "-24s" },
      ].map((c) => (
        <g key={c.x} transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
          <g className="rb-cloud" style={{ animationDelay: c.d }} fill="#fff" fillOpacity="0.11">
            <ellipse cx="0" cy="0" rx="46" ry="12" />
            <ellipse cx="-16" cy="-9" rx="22" ry="12" />
            <ellipse cx="14" cy="-12" rx="26" ry="14" />
          </g>
        </g>
      ))}

      {/* Soleil */}
      <circle cx={SUN.x} cy={SUN.y} r="130" fill={ref("halo")} className="sa-pulse" />
      <g stroke="#e4f2c6" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" className="sa-spin">
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r1 = i % 2 ? 56 : 54;
          const r2 = i % 2 ? 66 : 76;
          return <line key={i} x1={num(SUN.x + Math.cos(a) * r1)} y1={num(SUN.y + Math.sin(a) * r1)} x2={num(SUN.x + Math.cos(a) * r2)} y2={num(SUN.y + Math.sin(a) * r2)} />;
        })}
      </g>
      <circle cx={SUN.x} cy={SUN.y} r="44" fill={ref("sun")} />

      {/* Collines et baobabs */}
      <path d="M0 292C140 250 290 288 440 268S740 232 890 258S1120 250 1200 268V460H0Z" fill="#1d6b5e" />
      {[
        { x: 470, y: 272, k: 1.2 },
        { x: 786, y: 246, k: 0.62 },
        { x: 1170, y: 262, k: 0.95 },
      ].map((b) => (
        <g key={b.x} transform={`translate(${b.x} ${b.y}) scale(${b.k})`} fill="#14564d">
          <path d="M-8 4C-13 -12 -10 -32 -5 -46H5C10 -32 13 -12 8 4Z" />
          <path d="M0 -44L-16 -58M0 -44L15 -60M0 -46V-62" stroke="#14564d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="-18" cy="-60" rx="13" ry="5" />
          <ellipse cx="17" cy="-62" rx="14" ry="5" />
          <ellipse cx="0" cy="-65" rx="12" ry="5" />
        </g>
      ))}
      <path d="M0 336C200 298 380 342 560 320S900 300 1060 328S1160 322 1200 320V460H0Z" fill="#2d8068" />
      <path d="M0 392C250 372 520 398 760 384S1080 372 1200 386V460H0Z" fill={ref("ground")} />

      {/* Flux du soleil vers chaque solution */}
      {CX.map((x, i) => (
        <Flow key={x} d={`M${SUN.x + 38} ${SUN.y + 30} Q${num((SUN.x + x) / 2 + 20)} ${86} ${x} 180`} color="#e9f6c9" width={i === active ? 3 : 1.6} opacity={i === active ? 0.95 : 0.22} />
      ))}

      {/* Les cinq solutions */}
      {CX.map((x, i) => {
        const on = i === active;
        return (
          <g key={keys[i]} onPointerEnter={(e) => e.pointerType === "mouse" && onPick(i)} onClick={() => onPick(i)} style={{ cursor: "pointer" }}>
            <ellipse cx={x} cy={BASE + 4} rx="84" ry="16" fill={LIME} fillOpacity={on ? 0.55 : 0} filter={ref("blur")} style={{ transition: "fill-opacity .5s" }} />
            <ellipse cx={x} cy={BASE + 4} rx="70" ry="10" fill="#a9cc70" fillOpacity={on ? 0.9 : 0.4} style={{ transition: "fill-opacity .5s" }} />
            {on && <ellipse cx={x} cy={BASE + 4} rx="70" ry="10" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.4" className="sa-ripple" />}
            <g transform={`translate(${x} ${BASE})`} style={{ opacity: on ? 1 : 0.72, transition: "opacity .5s" }}>
              {list[i]}
            </g>
            <path d={`M${x} 212V250`} stroke="#fff" strokeOpacity={on ? 0.7 : 0.18} strokeDasharray="2 5" strokeLinecap="round" strokeWidth="1.6" style={{ transition: "stroke-opacity .5s" }} />
            <g transform={`translate(${x} 194)`}>
              <g className="rb-pin" style={{ transform: on ? "scale(1.22)" : "scale(1)" }}>
                <circle r="18" fill={on ? LIME : "#0f4a44"} fillOpacity={on ? 1 : 0.7} stroke="#fff" strokeOpacity={on ? 0.95 : 0.4} strokeWidth="1.6" style={{ transition: "fill .4s" }} />
                {pin(i, on)}
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
