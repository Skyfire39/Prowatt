"use client";

import { useId, type ReactNode } from "react";
import { SceneBanner } from "./scene-banner";
import { Flow, Panel, num } from "./scene-parts";

type Labels = { kicker: string; hint: string; stat: string; aria: string; cta: string; devisHref: string };
export type AdvantageItem = { title: string; text: string; chip: string };

const TEAL = "#175c55";
const DEEP = "#0f4a44";
const LIME = "#c8e0a2";
const FRESH = "#9cc75f";
const C = 240;
const ORBIT = 165;
const R = 46;
/** Les quatre avantages en croix sur l'orbite : haut gauche, haut droit, bas droit, bas gauche. */
const SATS = [-135, -45, 45, 135].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return { x: num(C + Math.cos(a) * ORBIT), y: num(C + Math.sin(a) * ORBIT) };
});

/** Petit dessin de chaque avantage, centré sur (0, 0) dans une bulle de rayon 46. */
const graphics: ReactNode[] = [
  /* Économies : les barres de la facture baissent */
  <g key="eco">
    {[30, 22, 15, 9].map((h, i) => (
      <rect key={h} x={-27 + i * 14} y={24 - h} width="10" height={h} rx="2.5" fill={i === 3 ? TEAL : FRESH} className="rb-grow" style={{ animationDelay: `${i * 0.28}s` }} />
    ))}
    <path d="M-26 -18L12 6M12 6L3 4M12 6L9 -3" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="sa-draw" />
  </g>,
  /* Énergie propre : éolienne et feuille */
  <g key="clean">
    <path d="M-34 25Q-18 15 0 21T34 23" fill="none" stroke={FRESH} strokeWidth="3" strokeLinecap="round" />
    <path d="M0 22L0 -4" stroke={TEAL} strokeWidth="3" strokeLinecap="round" />
    <g transform="translate(0 -8)">
      <g className="sa-spin" style={{ animationDuration: "5s" }}>
        <circle r="22" fill="none" />
        {[0, 120, 240].map((a) => (
          <ellipse key={a} cy="-11" rx="2.8" ry="11" fill={TEAL} transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r="3.6" fill={LIME} stroke={TEAL} strokeWidth="1.6" />
    </g>
    <path d="M0 0C5 -5 11 -5 15 0C10 5 5 5 0 0Z" fill={FRESH} transform="translate(-30 6)" className="sa-float" />
  </g>,
  /* Bien valorisé : la maison prend de la valeur */
  <g key="value">
    <rect x="-18" y="-3" width="36" height="26" rx="2" fill="#e9f3d4" stroke={TEAL} strokeWidth="2" />
    <polygon points="-23,-3 0,-21 23,-3" fill={TEAL} />
    <rect x="-5" y="9" width="10" height="14" rx="1.5" fill={TEAL} />
    <path d="M25 -4V-24M25 -24L19 -18M25 -24L31 -18" fill="none" stroke="#6f9a40" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" className="sa-bounce" />
  </g>,
  /* Indépendance : un bouclier en orbite autour de lui-même */
  <g key="free">
    <g className="sa-spin" style={{ animationDuration: "10s" }}>
      <circle r="31" fill="none" stroke={TEAL} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="3 6" />
      <circle cx="31" r="4.5" fill={LIME} stroke={TEAL} strokeWidth="1.6" />
    </g>
    <path d="M0 -18L14 -12V-1C14 9 8 14 0 18C-8 14 -14 9 -14 -1V-12Z" fill={LIME} stroke={TEAL} strokeWidth="2" strokeLinejoin="round" />
    <path d="M-6 -1L-1 5L7 -6" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="sa-draw" />
  </g>,
];

function OrbitScene({ active, aria, onPick }: { active: number; aria: string; onPick: (i: number) => void }) {
  const uid = useId().replace(/\W/g, "");
  const u = (s: string) => `${uid}-${s}`;
  const ref = (s: string) => `url(#${u(s)})`;

  return (
    <svg viewBox="0 0 480 480" role="img" aria-label={aria} className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id={u("halo")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={LIME} stopOpacity="0.85" />
          <stop offset="1" stopColor={LIME} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={u("hub")} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#2b8a7d" />
          <stop offset="1" stopColor={DEEP} />
        </radialGradient>
        <linearGradient id={u("bubble")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef6dd" />
        </linearGradient>
        <linearGradient id={u("panel")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#35bcc4" />
          <stop offset="1" stopColor="#1d8a92" />
        </linearGradient>
        <pattern id={u("dots")} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill={TEAL} fillOpacity="0.16" />
        </pattern>
        <radialGradient id={u("fade")} cx="50%" cy="50%" r="50%">
          <stop offset="0.35" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={u("mask")}>
          <rect width="480" height="480" fill={ref("fade")} />
        </mask>
        <filter id={u("blur")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Fond : trame de points qui s'estompe, halo lime */}
      <rect width="480" height="480" fill={ref("dots")} mask={`url(#${u("mask")})`} />
      <circle cx={C} cy={C} r="200" fill={ref("halo")} className="sa-pulse" />

      {/* Orbites */}
      <circle cx={C} cy={C} r="116" fill="none" stroke={TEAL} strokeOpacity="0.1" strokeWidth="1.5" />
      <circle cx={C} cy={C} r={ORBIT} fill="none" stroke={TEAL} strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />
      <g className="sa-spin" style={{ animationDuration: "70s" }}>
        <circle cx={C} cy={C} r="214" fill="none" stroke={TEAL} strokeOpacity="0.16" strokeWidth="1.5" strokeDasharray="1 9" strokeLinecap="round" />
        {[0, 120, 240].map((a) => (
          <circle key={a} cx={C} cy={C - 214} r="3.5" fill={TEAL} fillOpacity="0.35" transform={`rotate(${a} ${C} ${C})`} />
        ))}
      </g>
      <g className="sa-spin" style={{ animationDuration: "26s" }}>
        <circle cx={C} cy={C} r={ORBIT} fill="none" />
        {[0, 90, 180, 270].map((a) => (
          <circle key={a} cx={C} cy={C - ORBIT} r="4" fill={FRESH} stroke="#fff" strokeWidth="1.5" transform={`rotate(${a + 45} ${C} ${C})`} />
        ))}
      </g>

      {/* Liaisons : l'énergie du centre vers chaque avantage */}
      {SATS.map((p, i) => (
        <g key={i}>
          <path d={`M${C} ${C}L${p.x} ${p.y}`} stroke={TEAL} strokeOpacity="0.1" strokeWidth="2.5" />
          <Flow d={`M${C} ${C}L${p.x} ${p.y}`} color={i === active ? TEAL : "#6f9a40"} width={i === active ? 3.4 : 2} opacity={i === active ? 0.95 : 0.35} />
        </g>
      ))}

      {/* Centre : le soleil et son panneau */}
      <g transform={`translate(${C} ${C})`}>
        <circle r="92" fill={LIME} fillOpacity="0.4" className="sa-pulse" />
        <circle r="68" fill={ref("hub")} stroke="#fff" strokeOpacity="0.55" strokeWidth="3" />
        <g transform="translate(0 -18)">
          <g className="sa-spin" stroke={LIME} strokeWidth="3" strokeLinecap="round" style={{ animationDuration: "30s" }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <line key={i} x1={num(Math.cos(a) * 24)} y1={num(Math.sin(a) * 24)} x2={num(Math.cos(a) * 31)} y2={num(Math.sin(a) * 31)} />;
            })}
          </g>
          <circle r="17" fill="#fff" />
          <circle r="12" fill={LIME} />
        </g>
        <Panel a={[-30, 24]} b={[30, 24]} c={[38, 50]} d={[-38, 50]} cols={4} rows={2} fill={ref("panel")} />
      </g>

      {/* Les quatre avantages */}
      {SATS.map((p, i) => {
        const on = i === active;
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})`} onPointerEnter={(e) => e.pointerType === "mouse" && onPick(i)} onClick={() => onPick(i)} style={{ cursor: "pointer" }}>
            <circle r="66" fill={LIME} fillOpacity={on ? 0.9 : 0} filter={ref("blur")} style={{ transition: "fill-opacity .5s" }} />
            {on && <circle r={R + 6} fill="none" stroke={TEAL} strokeOpacity="0.6" strokeWidth="1.6" className="sa-ripple" />}
            <g className="rb-pin" style={{ transform: on ? "scale(1.16)" : "scale(1)", opacity: on ? 1 : 0.85 }}>
              <circle r={R} fill={ref("bubble")} stroke={TEAL} strokeOpacity={on ? 1 : 0.22} strokeWidth={on ? 3 : 1.5} style={{ transition: "stroke-opacity .4s" }} />
              {graphics[i]}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Bannière « Avantages » : un schéma orbital clair. Le soleil est au centre, les quatre avantages du solaire
 * (économies, énergie propre, bien valorisé, indépendance) tournent autour, chacun avec son petit dessin animé.
 */
export function AdvantagesBanner({ items, labels }: { items: AdvantageItem[]; labels: Labels }) {
  return (
    <SceneBanner
      variant="light"
      kicker={labels.kicker}
      hint={labels.hint}
      stat={{ value: items.length, label: labels.stat }}
      items={items.map((it, i) => ({ key: `a${i}`, name: it.title, chip: it.chip, text: it.text, meta: labels.cta, href: labels.devisHref }))}
      scene={(active, onPick) => <OrbitScene active={active} aria={labels.aria} onPick={onPick} />}
    />
  );
}
