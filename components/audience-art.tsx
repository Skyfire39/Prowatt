import type { ReactNode } from "react";
import { Bolt, Box, Cylinder, Flow, LIME, makeIso, n, SolarPanel } from "./solution-art";
import type { Iso, Shade, V3 } from "./solution-art";

/*
 * Illustrations 3D en vert foncé des trois publics de l'accueil (« Pour qui ») :
 * 0 particuliers (maison), 1 commerces et bureaux, 2 sites industriels et agricoles.
 * Même projection isométrique que « Nos solutions », en teal profond avec des volumes lime.
 */

const PALE = "#e6f1cf";
const WALL: Shade = { top: PALE, left: LIME, right: "#8fb55a" };
const TEAL: Shade = { top: "#3a9c8e", left: "#237a70", right: "#175c55" };
const NIGHT: Shade = { top: "#1f6f66", left: "#0f3f3a", right: "#0a2f2b" };
const SHADOW = "#04201d";

const shade = (iso: Iso, pts: V3[], o = 0.25) => <polygon points={iso.poly(pts)} fill={SHADOW} fillOpacity={o} />;

const mix = (p: V3, q: V3, t: number): V3 => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];

/** Rectangle de lumière (fenêtre) sur une face : coordonnées locales de la face. */
const Win = ({ x, y, w, h, o = 0.95, delay }: { x: number; y: number; w: number; h: number; o?: number; delay?: number }) => (
  <rect
    x={x}
    y={y}
    width={w}
    height={h}
    rx="1.5"
    fill={PALE}
    fillOpacity={o}
    className={delay === undefined ? undefined : "sa-twinkle"}
    style={delay === undefined ? undefined : { animationDelay: `${delay}s` }}
  />
);

/* ───────────── Particuliers : maison à toit solaire ───────────── */

function Home({ uid }: { uid: string }) {
  const iso = makeIso(183, 60);
  const { P, poly, wall } = iso;
  const roof: V3[] = [[24, 86, 43], [106, 86, 43], [106, 55, 71], [24, 55, 71]];
  const at = (u: number, v: number): V3 => mix(mix(roof[0], roof[1], u), mix(roof[3], roof[2], u), v);
  const [tx, ty] = P([12, 88, 38]);
  return (
    <>
      {/* Soleil */}
      <circle cx="62" cy="58" r="38" fill={LIME} fillOpacity="0.1" className="sa-pulse" />
      <g stroke={LIME} strokeWidth="3" strokeLinecap="round" className="sa-spin">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={n(62 + Math.cos(a) * 31)} y1={n(58 + Math.sin(a) * 31)} x2={n(62 + Math.cos(a) * 41)} y2={n(58 + Math.sin(a) * 41)} />;
        })}
      </g>
      <circle cx="62" cy="58" r="22" fill={`url(#${uid}-sun)`} />

      {shade(iso, [[24, 92, 12], [112, 92, 12], [124, 42, 12], [36, 42, 12]])}
      <Box iso={iso} x={30} y={30} z={12} w={70} d={50} h={34} c={WALL} edge={0.3} />
      <polygon points={poly([[100, 30, 46], [100, 80, 46], [100, 55, 70]])} fill="#8fb55a" />
      <polygon points={poly([[24, 86, 39], [106, 86, 39], [106, 86, 43], [24, 86, 43]])} fill="#0a2f2b" />
      <polygon points={poly([...roof])} fill="#0f3f3a" stroke={LIME} strokeOpacity="0.3" strokeWidth="1" />
      <SolarPanel iso={iso} uid={uid} a={at(0.08, 0.1)} b={at(0.92, 0.1)} c={at(0.92, 0.9)} d={at(0.08, 0.9)} cols={6} rows={2} />

      <g transform={wall(30, 80, 46)}>
        <rect x="9" y="11" width="15" height="23" rx="1.5" fill="#0f3f3a" />
        <circle cx="21" cy="24" r="1.3" fill={LIME} />
        <Win x={34} y={9} w={14} h={12} delay={0} />
        <Win x={54} y={9} w={11} h={12} delay={1.4} />
        <path d="M41 9V21M34 15H48" stroke="#0f3f3a" strokeOpacity="0.35" strokeWidth="0.8" />
      </g>

      {/* Onduleur */}
      <path d={iso.path([[98, 68, 12], [120, 68, 12], [120, 52, 12]])} fill="none" stroke={SHADOW} strokeOpacity="0.25" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Flow d={iso.path([[98, 68, 12], [120, 68, 12], [120, 52, 12]])} color={LIME} />
      <Box iso={iso} x={114} y={38} z={12} w={16} d={14} h={24} c={WALL} edge={0.3} />
      <g transform={wall(114, 52, 36)}>
        <g className="sa-blink">
          <Bolt transform="translate(3.5 3) scale(0.55)" fill="#0f3f3a" />
        </g>
      </g>

      {/* Arbre */}
      <path d={iso.path([[12, 88, 12], [12, 88, 30]])} stroke="#8fb55a" strokeWidth="4" strokeLinecap="round" />
      <circle cx={tx} cy={ty} r="13" fill={`url(#${uid}-sun)`} className="sa-sway" />
    </>
  );
}

/* ───────────── Commerces et bureaux ───────────── */

function Commerce({ uid }: { uid: string }) {
  const iso = makeIso(183, 60);
  const { poly, wall, side } = iso;
  const stripes = Array.from({ length: 8 }, (_, i) => i);
  return (
    <>
      {shade(iso, [[8, 92, 12], [70, 92, 12], [116, 56, 12], [100, 20, 12], [10, 40, 12]], 0.22)}

      {/* Boutique avec auvent et panneaux sur le toit */}
      <Box iso={iso} x={14} y={40} z={12} w={52} d={46} h={28} c={WALL} edge={0.3} />
      <g transform={wall(14, 86, 40)}>
        <rect x="5" y="9" width="30" height="17" rx="1.5" fill="#0f3f3a" />
        <Win x={7} y={11} w={26} h={13} o={0.85} />
        <rect x="40" y="6" width="8" height="20" rx="1.5" fill="#0f3f3a" />
      </g>
      {stripes.map((i) => {
        const x0 = 12 + i * 7.25;
        const x1 = x0 + 7.25;
        return <polygon key={i} points={poly([[x0, 86, 38], [x1, 86, 38], [x1, 97, 31], [x0, 97, 31]])} fill={i % 2 ? "#ffffff" : "#3a9c8e"} />;
      })}
      <polygon points={poly([[12, 97, 31], [70, 97, 31], [70, 97, 28], [12, 97, 28]])} fill="#0a2f2b" />
      <SolarPanel iso={iso} uid={uid} a={[20, 78, 42]} b={[38, 78, 42]} c={[38, 52, 50]} d={[20, 52, 50]} cols={3} rows={3} />
      <SolarPanel iso={iso} uid={uid} a={[42, 78, 42]} b={[60, 78, 42]} c={[60, 52, 50]} d={[42, 52, 50]} cols={3} rows={3} />

      {/* Tour de bureaux */}
      <Box iso={iso} x={76} y={20} z={12} w={36} d={32} h={72} c={TEAL} edge={0.25} />
      <g transform={wall(76, 52, 84)}>
        {[0, 1, 2, 3, 4, 5].flatMap((r) =>
          [0, 1, 2].map((c) => <Win key={`${r}-${c}`} x={4 + c * 11} y={5 + r * 11} w={8} h={7} o={(r + c) % 3 ? 0.9 : 0.35} delay={((r * 3 + c) * 0.73) % 3.4} />),
        )}
      </g>
      <g transform={side(112, 20, 84)}>
        {[0, 1, 2, 3, 4, 5].flatMap((r) =>
          [0, 1, 2].map((c) => <Win key={`${r}-${c}`} x={3 + c * 10} y={5 + r * 11} w={7} h={7} o={(r + c) % 2 ? 0.55 : 0.2} />),
        )}
      </g>
      <Box iso={iso} x={86} y={28} z={84} w={16} d={14} h={6} c={NIGHT} edge={0.2} />
      <path d={iso.path([[94, 35, 90], [94, 35, 106]])} stroke={LIME} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={iso.P([94, 35, 108])[0]} cy={iso.P([94, 35, 108])[1]} r="3.5" fill={LIME} className="sa-blink" />
    </>
  );
}

/* ───────────── Sites industriels et agricoles ───────────── */

function Industry({ uid }: { uid: string }) {
  const iso = makeIso(183, 60);
  const { P, poly, wall } = iso;
  const [sx, sy] = P([66, 34, 66]);
  const rows = Array.from({ length: 8 }, (_, i) => 74 + i * 7);
  return (
    <>
      {/* Champ cultivé */}
      <polygon points={poly([[74, 62, 12], [132, 62, 12], [132, 94, 12], [74, 94, 12]])} fill="#1f6f66" />
      <path d={rows.map((x) => iso.path([[x, 64, 12], [x, 92, 12]])).join("")} stroke={LIME} strokeOpacity="0.6" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1 5" />
      <path d={iso.path([[74, 62, 12], [132, 62, 12], [132, 94, 12], [74, 94, 12], [74, 62, 12]])} fill="none" stroke={LIME} strokeOpacity="0.35" strokeWidth="1" />

      {shade(iso, [[8, 76, 12], [78, 76, 12], [90, 28, 12], [20, 22, 12]], 0.22)}

      {/* Usine */}
      <Box iso={iso} x={14} y={26} z={12} w={60} d={40} h={32} c={WALL} edge={0.3} />
      <g transform={wall(14, 66, 44)}>
        {[0, 1, 2, 3].map((i) => (
          <Win key={i} x={5 + i * 14} y={6} w={10} h={8} o={0.9} delay={i * 0.9} />
        ))}
        <rect x="38" y="19" width="18" height="13" rx="1.5" fill="#0f3f3a" />
        <path d="M41 19V32M47 19V32M53 19V32" stroke={LIME} strokeOpacity="0.4" strokeWidth="0.8" />
      </g>
      <SolarPanel iso={iso} uid={uid} a={[18, 62, 46]} b={[44, 62, 46]} c={[44, 34, 56]} d={[18, 34, 56]} cols={4} rows={3} />
      <SolarPanel iso={iso} uid={uid} a={[48, 62, 46]} b={[60, 62, 46]} c={[60, 34, 56]} d={[48, 34, 56]} cols={2} rows={3} />
      <Cylinder iso={iso} x={68} y={32} z={44} r={5} h={24} uid={uid} />
      {[0, 1.4, 2.8].map((d) => (
        <circle key={d} cx={sx + 3} cy={sy - 8} r="7" fill={LIME} fillOpacity="0.5" className="sa-smoke" style={{ animationDelay: `${d}s` }} />
      ))}

      {/* Silo */}
      <Shadow cx={P([98, 34, 12])[0] + 6} cy={P([98, 34, 12])[1] + 4} rx={26} ry={11} />
      <Cylinder iso={iso} x={98} y={34} z={12} r={13} h={46} uid={uid} />
      <path d={`M${n(P([98, 34, 12])[0] - 16)} ${n(P([98, 34, 12])[1] - 22)}a16 9.2 0 0 0 32 0M${n(P([98, 34, 12])[0] - 16)} ${n(P([98, 34, 12])[1] - 34)}a16 9.2 0 0 0 32 0`} fill="none" stroke="#0f3f3a" strokeOpacity="0.25" strokeWidth="1.2" />
    </>
  );
}

const Shadow = ({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={SHADOW} fillOpacity="0.25" />
);

// Cadrage de chaque scène (translation + échelle) pour qu'elle remplisse la vignette sans plaque de sol.
const FIT: Record<number, string> = {
  0: "translate(4.2 -7.2) scale(1.38)",
  1: "translate(-88.3 -5.9) scale(1.55)",
  2: "translate(-86 -29.8) scale(1.45)",
};

const scenes: Record<number, (uid: string) => ReactNode> = {
  0: (uid) => <Home uid={uid} />,
  1: (uid) => <Commerce uid={uid} />,
  2: (uid) => <Industry uid={uid} />,
};

/** Illustration 3D en vert foncé d'un public : 0 particuliers, 1 commerces et bureaux, 2 sites industriels et agricoles. */
export function AudienceArt({ index, className = "" }: { index: number; className?: string }) {
  const uid = `aa${index}`;
  return (
    <svg viewBox="0 0 400 224" role="img" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a8277" />
          <stop offset="1" stopColor="#123f3a" />
        </linearGradient>
        <linearGradient id={`${uid}-panel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f9486" />
          <stop offset="1" stopColor="#0f3f3a" />
        </linearGradient>
        <linearGradient id={`${uid}-cyl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={PALE} />
          <stop offset="0.45" stopColor={LIME} />
          <stop offset="1" stopColor="#7ea04a" />
        </linearGradient>
        <radialGradient id={`${uid}-sun`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#fbfdf3" />
          <stop offset="0.45" stopColor={LIME} />
          <stop offset="1" stopColor="#8fb55a" />
        </radialGradient>
      </defs>
      <rect width="400" height="224" fill={`url(#${uid}-bg)`} />
      <circle cx="350" cy="0" r="120" fill={LIME} fillOpacity="0.07" />
      <circle cx="20" cy="224" r="90" fill={LIME} fillOpacity="0.06" />
      <g transform={FIT[index]}>
        <g className="sa-breathe">{scenes[index]?.(uid)}</g>
      </g>
    </svg>
  );
}
