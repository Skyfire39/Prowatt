"use client";

import type { ReactNode } from "react";
import { SceneBanner } from "./scene-banner";
import { BODY, Battery, DEEP, Flow, LIME, MID, Panel, SceneFrame, WARM, WATER, Window } from "./scene-parts";

export type BannerItem = { slug: string; name: string; chip: string; scene: string; count: number };
type Labels = { kicker: string; hint: string; project: string; projects: string; explore: string; aria: string };

const CX = [600, 725, 848, 968, 1090] as const;

const zones = (panel: string): ReactNode[] => [
  /* 1 · 100 % autonome : maison, panneau sur le toit, batterie */
  <g key="autonome">
    <rect x="-36" y="-54" width="72" height="54" rx="3" fill={BODY} />
    <rect x="-41" y="-59" width="82" height="7" rx="3" fill={LIME} />
    <Panel a={[-26, -59]} b={[26, -59]} c={[38, -84]} d={[-14, -84]} cols={4} rows={2} fill={panel} />
    <Window x={-30} y={-42} />
    <Window x={16} y={-42} />
    <rect x="-8" y="-28" width="16" height="28" rx="2" fill={MID} />
    <Battery x={46} y={-30} />
    <Flow d="M32 -66 C54 -66 56 -52 56 -36" color={WARM} />
  </g>,
  /* 2 · Hybride : panneau + groupe électrogène vers une armoire de batteries */
  <g key="hybride">
    <path d="M-58 0V-30" stroke={LIME} strokeWidth="3" strokeLinecap="round" />
    <Panel a={[-74, -30]} b={[-44, -30]} c={[-38, -50]} d={[-68, -50]} cols={3} rows={2} fill={panel} />
    <rect x="-18" y="-68" width="36" height="68" rx="6" fill={LIME} />
    <rect x="-12" y="-60" width="24" height="16" rx="3" fill={DEEP} />
    <path d="M2 -58 L-5 -50 H0 L-2 -45 L6 -54 H1 Z" fill={WARM} className="sa-blink" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x="-12" y={-36 + i * 10} width="24" height="6" rx="2" fill={DEEP} className="sa-blink" style={{ animationDelay: `${i * 0.5}s` }} />
    ))}
    <rect x="34" y="-28" width="34" height="28" rx="5" fill="#e6efd2" />
    <path d="M40 -20H62M40 -14H62M40 -8H62" stroke={MID} strokeWidth="2" strokeLinecap="round" />
    <rect x="58" y="-40" width="4.5" height="12" rx="1.5" fill={MID} />
    {[0, 1.4, 2.8].map((d) => (
      <circle key={d} cx="60" cy="-44" r="4" fill="#fff" fillOpacity="0.6" className="sa-smoke" style={{ animationDelay: `${d}s` }} />
    ))}
    <Flow d="M-46 -34 C-34 -30 -30 -24 -18 -24" color={WARM} />
    <Flow d="M34 -14 C26 -14 24 -16 18 -16" color={WARM} />
  </g>,
  /* 3 · On-grid : pylône du réseau et commerce avec panneaux sur le toit */
  <g key="ongrid">
    <g stroke={LIME} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M-54 0L-42 -102L-30 0" />
      <path d="M-60 -84H-24M-55 -66H-29" />
      <path d="M-52 -4L-32 -36M-32 -4L-52 -36M-47 -36L-37 -64M-37 -36L-47 -64" strokeWidth="1.8" />
      <path d="M-42 -102V-110" />
    </g>
    {[-60, -24].map((x) => (
      <circle key={x} cx={x} cy="-84" r="2.8" fill="#fff" />
    ))}
    <rect x="0" y="-52" width="64" height="52" rx="3" fill={BODY} />
    <rect x="-4" y="-57" width="72" height="6" rx="3" fill={LIME} />
    {[0, 22, 44].map((o) => (
      <Panel key={o} a={[4 + o, -57]} b={[20 + o, -57]} c={[26 + o, -73]} d={[10 + o, -73]} cols={2} rows={2} fill={panel} />
    ))}
    {[8, 26, 44].map((x) => (
      <Window key={x} x={x} y={-42} w={12} h={12} glow={false} />
    ))}
    <rect x="26" y="-22" width="12" height="22" rx="2" fill={MID} />
    <path d="M-24 -84 Q-4 -76 4 -57M-29 -66 Q-8 -62 2 -50" fill="none" stroke={LIME} strokeOpacity="0.5" strokeWidth="1.4" />
    <Flow d="M-24 -84 Q-4 -76 4 -57" color={WARM} width={2} />
    <Flow d="M-29 -66 Q-8 -62 2 -50" color={WARM} width={2} />
  </g>,
  /* 4 · Anti-délestage : le réseau coupe, la batterie garde la maison allumée */
  <g key="anti">
    <path d="M-56 0V-72M-65 -68H-47" stroke={LIME} strokeWidth="3" strokeLinecap="round" />
    <path d="M-47 -68 Q-40 -64 -35 -58" fill="none" stroke={LIME} strokeOpacity="0.55" strokeWidth="1.6" />
    <path d="M-33 -56 L-28 -61 L-26 -54 L-21 -59" fill="none" stroke={WARM} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="sa-blink" />
    <rect x="-24" y="-48" width="60" height="48" rx="3" fill={BODY} />
    <polygon points="-31,-48 6,-78 43,-48" fill={MID} />
    <Window x={-16} y={-36} w={16} h={14} />
    <Window x={10} y={-36} w={16} h={14} />
    <rect x="-3" y="-24" width="14" height="24" rx="2" fill={LIME} />
    <Battery x={48} y={-30} />
    <Flow d="M48 -14 L38 -14" color={WARM} />
    <g transform="translate(6 0)" className="sa-float">
      <path d="M0 -134L20 -126V-110C20 -98 11 -91 0 -87C-11 -91 -20 -98 -20 -110V-126Z" fill={LIME} stroke="#fff" strokeOpacity="0.85" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M-8 -111L-2 -104L9 -118" pathLength="1" fill="none" stroke={DEEP} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" className="sa-draw" />
    </g>
  </g>,
  /* 5 · Accès à l'eau : pompe solaire, château d'eau, robinet */
  <g key="eau">
    <path d="M-62 0V-30" stroke={LIME} strokeWidth="3" strokeLinecap="round" />
    <Panel a={[-76, -30]} b={[-48, -30]} c={[-42, -50]} d={[-70, -50]} cols={3} rows={2} fill={panel} />
    <rect x="-36" y="-14" width="26" height="14" rx="3" fill="#e6efd2" />
    <rect x="-28" y="-36" width="10" height="23" rx="2" fill={LIME} />
    <g stroke={LIME} strokeWidth="2.4" strokeLinecap="round" fill="none">
      <path d="M18 0L21 -52M46 0L43 -52M20 -8L44 -40M44 -8L20 -40" />
    </g>
    <rect x="10" y="-98" width="44" height="48" rx="9" fill={BODY} stroke={LIME} strokeWidth="2" />
    <rect x="14" y="-80" width="36" height="26" rx="6" fill={WATER} className="sa-float" style={{ animationDuration: "3s" }} />
    <path d="M17 -74C24 -78 30 -70 37 -74S46 -78 47 -74" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <Flow d="M-23 -34 C-10 -34 -6 -70 10 -70" color={WATER} width={3} />
    <path d="M54 -62H68V-30" fill="none" stroke={LIME} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    {[0, 0.9].map((d) => (
      <circle key={d} cx="68" cy="-28" r="2.6" fill={WATER} className="rb-drop" style={{ animationDelay: `${d}s` }} />
    ))}
    <ellipse cx="68" cy="-4" rx="19" ry="5.5" fill={WATER} fillOpacity="0.85" />
    <ellipse cx="68" cy="-4" rx="15" ry="4" fill="none" stroke="#fff" strokeWidth="1.4" className="sa-ripple" />
  </g>,
];

/**
 * Bannière « Réalisations » : une scène SVG animée qui raconte les cinq solutions affichées en dessous
 * (maison autonome, hybride, raccordée au réseau, anti-délestage, accès à l'eau).
 */
export function RealisationsBanner({ items, labels, total }: { items: BannerItem[]; labels: Labels; total: number }) {
  return (
    <SceneBanner
      kicker={labels.kicker}
      hint={labels.hint}
      stat={{ value: total, label: total > 1 ? labels.projects : labels.project }}
      items={items.map((it) => ({
        key: it.slug,
        name: it.name,
        chip: it.chip,
        text: it.scene,
        badge: String(it.count),
        meta: `${it.count} ${it.count > 1 ? labels.projects : labels.project} · ${labels.explore}`,
        href: `/realisations/${it.slug}`,
      }))}
      scene={(active, onPick) => (
        <SceneFrame
          cx={CX}
          active={active}
          aria={labels.aria}
          keys={items.map((it) => it.slug)}
          zones={zones}
          pin={(i, on) => (
            <text textAnchor="middle" dy="0.36em" fontSize="16" fontWeight="700" fill={on ? DEEP : "#fff"} style={{ transition: "fill .4s" }}>
              {items[i].count}
            </text>
          )}
          onPick={onPick}
        />
      )}
    />
  );
}
