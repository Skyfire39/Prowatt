import type { CSSProperties, ReactNode } from "react";

/*
 * Illustrations 3D (projection isométrique) des trois piliers « Nos solutions ».
 * Tout est du SVG dessiné ici : chaque volume est découpé en trois faces (dessus clair,
 * côté gauche moyen, côté droit sombre), comme une source de lumière venant d'en haut à gauche.
 * Palette : blanc et vert clair (lime #c8e0a2 du site).
 */

export const LIME = "#c8e0a2";
export const DEEP = "#6f9a40";

export type Pt = [number, number];
export type V3 = [number, number, number];
export type Shade = { top: string; left: string; right: string };

export const COS = 0.866;
export const n = (v: number) => Number(v.toFixed(2));

// Teintes d'un volume : dessus / face gauche / face droite.
const LIMEBOX: Shade = { top: "#f3f9e6", left: LIME, right: "#8fb55a" };

/** Projection isométrique : x part vers le bas à droite, y vers le bas à gauche, z vers le haut. */
export function makeIso(ox: number, oy: number) {
  const P = ([x, y, z]: V3): Pt => [n(ox + (x - y) * COS), n(oy + (x + y) * 0.5 - z)];
  const poly = (pts: V3[]) => pts.map((v) => P(v).join(",")).join(" ");
  const path = (pts: V3[]) => pts.map((v, i) => `${i ? "L" : "M"}${P(v).join(" ")}`).join("");
  /** Matrice SVG d'un plan horizontal posé à la hauteur z, depuis le point (x, y). */
  const flat = (x: number, y: number, z: number) => `matrix(${COS} 0.5 ${-COS} 0.5 ${P([x, y, z]).join(" ")})`;
  /** Matrice SVG de la face gauche (plan y constant) dont le coin haut gauche est (x, y, z). */
  const wall = (x: number, y: number, z: number) => `matrix(${COS} 0.5 0 1 ${P([x, y, z]).join(" ")})`;
  /** Matrice SVG de la face droite (plan x constant) ; u suit y vers le bas à gauche. */
  const side = (x: number, y: number, z: number) => `matrix(${-COS} 0.5 0 1 ${P([x, y, z]).join(" ")})`;
  return { P, poly, path, flat, wall, side };
}
export type Iso = ReturnType<typeof makeIso>;

export function Box({ iso, x, y, z, w, d, h, c, edge: e = 0.55 }: { iso: Iso; x: number; y: number; z: number; w: number; d: number; h: number; c: Shade; edge?: number }) {
  const { poly } = iso;
  const edge = { stroke: "#fff", strokeOpacity: e, strokeWidth: 0.8, strokeLinejoin: "round" as const };
  return (
    <g {...edge}>
      <polygon points={poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={c.left} />
      <polygon points={poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={c.right} />
      <polygon points={poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={c.top} />
    </g>
  );
}

/** Cylindre debout : corps dégradé, ellipse du dessus. */
export function Cylinder({ iso, x, y, z, r, h, uid, top = "#ffffff" }: { iso: Iso; x: number; y: number; z: number; r: number; h: number; uid: string; top?: string }) {
  const [cx, by] = iso.P([x, y, z]);
  const ty = by - h;
  const rx = n(r * 1.2247);
  const ry = n(r * 0.7071);
  return (
    <g>
      <path d={`M${n(cx - rx)} ${ty}V${by}A${rx} ${ry} 0 0 0 ${n(cx + rx)} ${by}V${ty}Z`} fill={`url(#${uid}-cyl)`} />
      <ellipse cx={cx} cy={ty} rx={rx} ry={ry} fill={top} stroke="#fff" strokeOpacity="0.15" />
    </g>
  );
}

/** Ombre portée douce posée sur le sol. */
const Shadow = ({ cx, cy, rx, ry, o = 0.28 }: { cx: number; cy: number; rx: number; ry: number; o?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#5d7f3a" fillOpacity={o} />
);

/** Panneau solaire incliné : tranche, cellules, reflet. Les quatre coins sont en 3D. */
export function SolarPanel({ iso, a, b, c, d, cols, rows, uid }: { iso: Iso; a: V3; b: V3; c: V3; d: V3; cols: number; rows: number; uid: string }) {
  const mix = (p: V3, q: V3, t: number): V3 => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  const at = (u: number, v: number) => mix(mix(a, b, u), mix(d, c, u), v);
  const lines: string[] = [];
  for (let i = 1; i < cols; i++) lines.push(iso.path([at(i / cols, 0), at(i / cols, 1)]));
  for (let j = 1; j < rows; j++) lines.push(iso.path([at(0, j / rows), at(1, j / rows)]));
  const down = (p: V3, t: number): V3 => [p[0], p[1], p[2] - t];
  return (
    <g strokeLinejoin="round">
      <polygon points={iso.poly([a, b, down(b, 5), down(a, 5)])} fill="#c8e0a2" />
      <polygon points={iso.poly([b, c, down(c, 5), down(b, 5)])} fill="#8fb55a" />
      <polygon points={iso.poly([a, b, c, d])} fill={`url(#${uid}-panel)`} stroke="#6f9a40" strokeWidth="1.5" />
      <path d={lines.join("")} stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" />
      <polygon points={iso.poly([at(0.08, 0.1), at(0.3, 0.1), at(0.62, 0.9), at(0.4, 0.9)])} fill="#fff" fillOpacity="0.28" />
    </g>
  );
}

export const Bolt = ({ transform, fill = DEEP }: { transform?: string; fill?: string }) => (
  <path d="M8 0 L0 16 H6 L3 30 L15 11 H9 Z" transform={transform} fill={fill} strokeLinejoin="round" />
);

/** Flux d'énergie ou d'eau : pointillés qui défilent. */
export function Flow({ d, dash = "2 7", width = 3.5, color = "#6f9a40" }: { d: string; dash?: string; width?: number; color?: string }) {
  const total = dash.split(" ").reduce((s, v) => s + Number(v), 0);
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash}
      className="sa-flow"
      style={{ "--sa-flow": `${-total * 2}px` } as CSSProperties}
    />
  );
}

/* ───────────── Pilier 1 : énergie ───────────── */

function Energy({ uid }: { uid: string }) {
  const iso = makeIso(183, 60);
  const { P, poly } = iso;
  const legs = [[26, 28, 56], [82, 28, 56], [26, 64, 26], [82, 64, 26]] as const;
  return (
    <>
      {/* Soleil : sphère lumineuse et rayons */}
      <circle cx="64" cy="60" r="40" fill="#fff" fillOpacity="0.7" className="sa-pulse" />
      <g stroke="#a9cc70" strokeWidth="3" strokeLinecap="round" className="sa-spin">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={n(64 + Math.cos(a) * 33)} y1={n(60 + Math.sin(a) * 33)} x2={n(64 + Math.cos(a) * 43)} y2={n(60 + Math.sin(a) * 43)} />;
        })}
      </g>
      <circle cx="64" cy="60" r="24" fill={`url(#${uid}-sun)`} />

      {/* Panneau et ses pieds */}
      <polygon points={poly([[8, 72, 12], [96, 72, 12], [112, 36, 12], [24, 36, 12]])} fill="#5d7f3a" fillOpacity="0.22" />
      {legs.map(([x, y, top]) => (
        <path key={`${x}-${y}`} d={iso.path([[x, y, 12], [x, y, top]])} stroke="#8fb55a" strokeWidth="5" strokeLinecap="round" />
      ))}
      <SolarPanel iso={iso} uid={uid} a={[14, 64, 26]} b={[94, 64, 26]} c={[94, 28, 56]} d={[14, 28, 56]} cols={4} rows={3} />

      {/* Batterie */}
      <path d={iso.path([[88, 66, 12], [106, 66, 12], [106, 56, 12], [118, 56, 12]])} fill="none" stroke="#5d7f3a" strokeOpacity="0.2" strokeWidth="6" strokeLinecap="round" />
      <Flow d={iso.path([[88, 66, 12], [106, 66, 12], [106, 56, 12], [118, 56, 12]])} />
      <polygon points={poly([[116, 60, 12], [140, 60, 12], [150, 38, 12], [124, 38, 12]])} fill="#5d7f3a" fillOpacity="0.22" />
      <Box iso={iso} x={118} y={36} z={12} w={20} d={20} h={42} c={LIMEBOX} />
      <Box iso={iso} x={124} y={42} z={54} w={8} d={8} h={5} c={LIMEBOX} />
      <g transform={`matrix(${COS} 0.5 0 1 ${P([118, 56, 54]).join(" ")})`}>
        <g className="sa-blink">
          <Bolt transform="translate(2.5 7)" />
        </g>
        <rect x="3" y="31" width="14" height="3.5" rx="1.75" fill={DEEP} fillOpacity="0.25" />
      </g>
    </>
  );
}

/* ───────────── Pilier 2 : eau ───────────── */

function Water({ uid }: { uid: string }) {
  const iso = makeIso(183, 60);
  const { P, poly } = iso;
  const pipe = iso.path([[22, 58, 44], [22, 58, 70], [84, 58, 70], [84, 58, 62]]);
  const [sx, sy] = P([84, 58, 34]);
  return (
    <>
      {/* Goutte flottante */}
      <ellipse cx="94" cy="124" rx="24" ry="7" fill="#5d7f3a" fillOpacity="0.28" />
      <g className="sa-float">
        <path d="M94 30 C94 30 62 70 62 92 a32 32 0 0 0 64 0 C126 70 94 30 94 30 Z" fill={`url(#${uid}-drop)`} />
        <path d="M78 96 a17 17 0 0 0 12 19" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="82" cy="78" rx="5" ry="9" fill="#fff" fillOpacity="0.28" transform="rotate(24 82 78)" />
      </g>

      {/* Panneau sur mât, relié à la pompe */}
      <polygon points={poly([[92, 34, 12], [134, 34, 12], [140, 20, 12], [98, 20, 12]])} fill="#5d7f3a" fillOpacity="0.22" />
      <path d={iso.path([[113, 24, 12], [113, 24, 36]])} stroke="#8fb55a" strokeWidth="5" strokeLinecap="round" />
      <SolarPanel iso={iso} uid={uid} a={[96, 32, 32]} b={[130, 32, 32]} c={[130, 14, 52]} d={[96, 14, 52]} cols={3} rows={2} />
      <path d={iso.path([[108, 26, 12], [40, 26, 12], [40, 56, 12], [30, 58, 12]])} fill="none" stroke="#5d7f3a" strokeOpacity="0.2" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Flow d={iso.path([[108, 26, 12], [40, 26, 12], [40, 56, 12], [30, 58, 12]])} />

      {/* Bassin */}
      <polygon points={poly([[50, 96, 12], [116, 96, 12], [124, 46, 12], [58, 46, 12]])} fill="#5d7f3a" fillOpacity="0.2" />
      <Box iso={iso} x={56} y={48} z={12} w={56} d={42} h={22} c={LIMEBOX} />
      <polygon points={poly([[61, 53, 34], [107, 53, 34], [107, 85, 34], [61, 85, 34]])} fill={`url(#${uid}-water)`} />
      <polygon points={poly([[61, 53, 34], [107, 53, 34], [107, 56, 34], [61, 56, 34]])} fill="#5d7f3a" fillOpacity="0.16" />
      <ellipse cx={sx} cy={sy} rx="22" ry="12.5" fill="none" stroke="#5fae8a" strokeWidth="2" className="sa-ripple" />
      <ellipse cx={sx} cy={sy} rx="22" ry="12.5" fill="none" stroke="#5fae8a" strokeWidth="2" className="sa-ripple" style={{ animationDelay: "1.3s" }} />
      <ellipse cx={sx} cy={sy} rx="8" ry="4.6" fill="#5fae8a" fillOpacity="0.35" />

      {/* Pompe, tuyau et jet */}
      <Shadow cx={P([22, 58, 12])[0]} cy={P([22, 58, 12])[1] + 3} rx={19} ry={9} />
      <Cylinder iso={iso} x={22} y={58} z={12} r={12} h={34} uid={uid} />
      <g transform={`matrix(${COS} 0.5 0 1 ${P([22, 58, 46])[0] - 7} ${P([22, 58, 46])[1] + 7})`}>
        <Bolt transform="scale(0.55)" />
      </g>
      <path d={pipe} fill="none" stroke="#8fb55a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pipe} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Flow d={iso.path([[84, 58, 62], [84, 58, 36]])} dash="1 8" width={4} color="#5fae8a" />
    </>
  );
}

/* ───────────── Pilier 3 : service client ───────────── */

/** Bulle de discussion flottante avec sa queue. */
function Bubble({ x, y, w, h, fill, tail, delay, children }: { x: number; y: number; w: number; h: number; fill: string; tail: string; delay: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="sa-float" style={{ animationDelay: `${delay}s` }}>
        <path d={tail} fill={fill} />
        <rect width={w} height={h} rx={h / 2.2} fill={fill} stroke="#fff" strokeOpacity="0.8" strokeWidth="1.2" />
        {children}
      </g>
    </g>
  );
}

function Support({ uid }: { uid: string }) {
  const iso = makeIso(183, 60);
  const { P, wall } = iso;
  const [mx, my] = P([28, 66, 33]);
  return (
    <>
      {/* Casque de l'équipe, en suspension */}
      <g transform="translate(112 62)">
        <g className="sa-float">
          <path d="M-19 4 C-19 -24 19 -24 19 4" fill="none" stroke="#8fb55a" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M-19 4 C-19 -22 19 -22 19 4" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="-26" y="-1" width="13" height="22" rx="6" fill="#c8e0a2" stroke="#fff" strokeOpacity="0.8" strokeWidth="1" />
          <rect x="13" y="-1" width="13" height="22" rx="6" fill="#a9cc70" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" />
          <rect x="-23" y="3" width="4" height="14" rx="2" fill="#fff" fillOpacity="0.7" />
          <path d="M-20 20 C-20 34 -2 36 10 33" fill="none" stroke="#8fb55a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="12" cy="33" r="4" fill="#6f9a40" />
        </g>
      </g>

      {/* Bureau du conseiller */}
      <polygon points={iso.poly([[14, 84, 12], [126, 84, 12], [132, 40, 12], [20, 30, 12]])} fill="#5d7f3a" fillOpacity="0.2" />
      {[[27, 43], [113, 43], [27, 69], [113, 69]].map(([x, y]) => (
        <path key={`${x}-${y}`} d={iso.path([[x, y, 12], [x, y, 28]])} stroke="#8fb55a" strokeWidth="4.5" strokeLinecap="round" />
      ))}
      <Box iso={iso} x={20} y={36} z={28} w={100} d={40} h={5} c={LIMEBOX} />
      <Cylinder iso={iso} x={28} y={66} z={33} r={5} h={10} uid={uid} top="#f3f9e6" />
      <ellipse cx={mx} cy={my - 8} rx="5.5" ry="3.2" fill="#8fb55a" />

      {/* Écran de discussion */}
      <Box iso={iso} x={64} y={48} z={33} w={22} d={14} h={3} c={LIMEBOX} />
      <Box iso={iso} x={72} y={52} z={36} w={6} d={6} h={7} c={LIMEBOX} />
      <Box iso={iso} x={38} y={58} z={42} w={76} d={5} h={46} c={{ top: "#c8e0a2", left: "#9cc267", right: "#7aa545" }} />
      <g transform={`${wall(38, 63, 88)} scale(1.15)`}>
        <rect x="4" y="4" width="58" height="32" rx="2.5" fill="#ffffff" />
        <rect x="4" y="4" width="58" height="6.5" rx="2.5" fill="#e2eecd" />
        <circle cx="9" cy="7.2" r="2" fill="#8fb55a" />
        <rect x="13" y="6" width="14" height="2.4" rx="1.2" fill="#8fb55a" fillOpacity="0.6" />
        <g className="sa-pop">
          <rect x="7" y="12.5" width="30" height="6.5" rx="3.2" fill="#e2eecd" />
          <rect x="10" y="14.6" width="18" height="2.2" rx="1.1" fill="#8fb55a" fillOpacity="0.55" />
        </g>
        <g className="sa-pop" style={{ animationDelay: "1.4s" }}>
          <rect x="27" y="20.5" width="32" height="6.5" rx="3.2" fill="#8fb55a" />
          <rect x="30" y="22.6" width="20" height="2.2" rx="1.1" fill="#fff" fillOpacity="0.85" />
        </g>
        <g className="sa-pop" style={{ animationDelay: "2.8s" }}>
          <rect x="7" y="28.5" width="17" height="6" rx="3" fill="#e2eecd" />
          {[11.5, 15.5, 19.5].map((cx, i) => (
            <circle key={cx} cx={cx} cy="31.5" r="1.2" fill="#6f9a40" className="sa-bounce" style={{ animationDelay: `${2.8 + i * 0.18}s` }} />
          ))}
        </g>
      </g>

      {/* Bulles de réponse */}
      <Bubble x={262} y={38} w={58} h={32} fill="#ffffff" tail="M13 30 L7 41 L22 31 Z" delay={0}>
        {[18, 29, 40].map((cx, i) => (
          <circle key={cx} cx={cx} cy="16" r="3.4" fill="#8fb55a" className="sa-bounce" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </Bubble>
      <Bubble x={304} y={84} w={44} h={28} fill="#c8e0a2" tail="M33 26 L40 36 L24 27 Z" delay={0.9}>
        <path d="M13 14 L19.5 20 L31.5 8" pathLength="1" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" className="sa-draw" />
      </Bubble>
    </>
  );
}

// Cadrage de chaque scène (translation + échelle) pour qu'elle remplisse la vignette sans plaque de sol.
const FIT: Record<number, string> = {
  0: "translate(18.6 13.6) scale(1.28)",
  1: "translate(-53 -25.4) scale(1.45)",
  2: "translate(-86.4 -6.2) scale(1.32)",
};

const scenes: Record<number, (uid: string) => ReactNode> = {
  0: (uid) => <Energy uid={uid} />,
  1: (uid) => <Water uid={uid} />,
  2: (uid) => <Support uid={uid} />,
};

/**
 * Illustration 3D d'un pilier « Nos solutions » : 0 énergie, 1 eau, 2 service client.
 * Prend toute la largeur de la carte, sans recadrage.
 */
export function SolutionArt({ index, className = "" }: { index: number; className?: string }) {
  const uid = `sa${index}`;
  return (
    <svg viewBox="0 0 400 224" role="img" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7fbee" />
          <stop offset="1" stopColor="#d3e7ae" />
        </linearGradient>
        <linearGradient id={`${uid}-panel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bcd98c" />
          <stop offset="1" stopColor="#82a94d" />
        </linearGradient>
        <linearGradient id={`${uid}-cyl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor={LIME} />
          <stop offset="1" stopColor="#8fb55a" />
        </linearGradient>
        <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4fbe6" />
          <stop offset="1" stopColor="#9fd3a8" />
        </linearGradient>
        <radialGradient id={`${uid}-sun`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#fbfdf3" />
          <stop offset="0.45" stopColor={LIME} />
          <stop offset="1" stopColor="#8fb55a" />
        </radialGradient>
        <radialGradient id={`${uid}-drop`} cx="0.35" cy="0.55" r="0.75">
          <stop offset="0" stopColor="#f4faea" />
          <stop offset="0.5" stopColor={LIME} />
          <stop offset="1" stopColor="#8fb55a" />
        </radialGradient>
      </defs>
      <rect width="400" height="224" fill={`url(#${uid}-bg)`} />
      <circle cx="350" cy="0" r="120" fill="#fff" fillOpacity="0.6" />
      <circle cx="20" cy="224" r="90" fill={LIME} fillOpacity="0.35" />
      <g transform={FIT[index]}>
        <g className="sa-breathe">{scenes[index]?.(uid)}</g>
      </g>
    </svg>
  );
}
