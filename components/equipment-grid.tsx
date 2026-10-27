import type { ReactNode } from "react";
import { Reveal } from "./motion";

const TEAL = "#175c55";
const LIME = "#c8e0a2";
const MID = "#8fb55a";
const WARM = "#ffe9a8";
const CYAN = "#2aa6b0";

/*
 * Pictogrammes animés des équipements : panneau (reflet qui balaie), batterie (barres qui se chargent),
 * câblage (courant dans le câble), convertisseur (continu → alternatif). Un seul exemplaire de chacun par page.
 */

function PanelIcon() {
  return (
    <svg viewBox="0 0 96 96" className="size-full" fill="none" aria-hidden="true">
      <defs>
        <clipPath id="eq-panel-clip">
          <polygon points="20,66 66,66 80,38 34,38" />
        </clipPath>
      </defs>
      <circle cx="22" cy="24" r="16" fill={WARM} fillOpacity="0.55" className="sa-pulse" />
      <g stroke={MID} strokeWidth="2.6" strokeLinecap="round" className="sa-spin" style={{ animationDuration: "18s" }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={22 + Math.cos(a) * 12} y1={24 + Math.sin(a) * 12} x2={22 + Math.cos(a) * 17} y2={24 + Math.sin(a) * 17} />;
        })}
      </g>
      <circle cx="22" cy="24" r="8" fill={WARM} stroke={MID} strokeWidth="2" />
      <path d="M43 66V82M57 66V82M36 82H64" stroke={TEAL} strokeWidth="3.4" strokeLinecap="round" />
      <polygon points="20,66 66,66 80,38 34,38" fill={CYAN} stroke={TEAL} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M31.5 52H73M43 38 31 66M57 38 48.5 66M71 38 66 66" stroke="#e6f6f4" strokeOpacity="0.75" strokeWidth="1.4" />
      <g clipPath="url(#eq-panel-clip)">
        <rect x="14" y="30" width="14" height="44" fill="#fff" fillOpacity="0.55" transform="skewX(-22)" className="eq-glint" />
      </g>
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 96 96" className="size-full" fill="none" aria-hidden="true">
      <rect x="22" y="26" width="52" height="46" rx="9" fill="#fff" stroke={TEAL} strokeWidth="3" />
      <rect x="40" y="19" width="16" height="9" rx="3" fill={TEAL} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={29 + i * 14.5} y="36" width="10" height="26" rx="3" fill={i === 2 ? MID : LIME} stroke={TEAL} strokeWidth="1.6" className="eq-charge" style={{ animationDelay: `${i * 0.55}s` }} />
      ))}
      <path d="M52 8L44 20H50L47 30L58 16H52Z" fill={WARM} stroke={TEAL} strokeWidth="1.6" strokeLinejoin="round" className="sa-blink" />
      <path d="M26 82H70" stroke={LIME} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function CableIcon() {
  const wave = "M14 66C32 66 30 36 48 36S64 66 82 66";
  const wave2 = "M14 76C32 76 30 46 48 46S64 76 82 76";
  return (
    <svg viewBox="0 0 96 96" className="size-full" fill="none" aria-hidden="true">
      <path d={wave2} stroke={MID} strokeWidth="6.5" strokeLinecap="round" />
      <path d={wave} stroke={TEAL} strokeWidth="6.5" strokeLinecap="round" />
      <path d={wave} stroke={LIME} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="2 8" className="sa-flow" style={{ "--sa-flow": "-20px" } as React.CSSProperties} />
      <path d={wave2} stroke="#fff" strokeOpacity="0.8" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="2 8" className="sa-flow" style={{ "--sa-flow": "-20px", animationDelay: "-0.6s" } as React.CSSProperties} />
      {[66, 76].map((y, i) => (
        <g key={y}>
          <rect x="6" y={y - 6} width="11" height="12" rx="3" fill={i ? MID : TEAL} stroke="#fff" strokeWidth="1.5" />
          <rect x="79" y={y - 6} width="11" height="12" rx="3" fill={i ? MID : TEAL} stroke="#fff" strokeWidth="1.5" />
        </g>
      ))}
      <circle cx="48" cy="22" r="6" fill={WARM} stroke={TEAL} strokeWidth="1.8" className="sa-pop" />
    </svg>
  );
}

function ConverterIcon() {
  return (
    <svg viewBox="0 0 96 96" className="size-full" fill="none" aria-hidden="true">
      <rect x="16" y="26" width="64" height="46" rx="9" fill={TEAL} />
      <path d="M26 20V26M38 20V26M50 20V26M62 20V26M74 20V26" stroke={MID} strokeWidth="3" strokeLinecap="round" />
      <rect x="24" y="34" width="48" height="26" rx="5" fill="#0f4a44" />
      <path d="M28 51H40" stroke={WARM} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M40 51Q44 40 48 51T56 51T64 51T68 51" stroke={LIME} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" className="sa-flow" style={{ "--sa-flow": "-16px" } as React.CSSProperties} />
      <circle cx="30" cy="66" r="2.6" fill={WARM} className="sa-blink" />
      <circle cx="40" cy="66" r="2.6" fill={LIME} className="sa-blink" style={{ animationDelay: "0.6s" }} />
      <path d="M26 72V80M70 72V80" stroke={TEAL} strokeWidth="5" strokeLinecap="round" />
      <path d="M16 86H80" stroke={LIME} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

const icons: ReactNode[] = [<PanelIcon key="p" />, <BatteryIcon key="b" />, <CableIcon key="c" />, <ConverterIcon key="v" />];

/** Équipements proposés : une carte par équipement, avec son pictogramme animé et ce qu'il fait dans l'installation. */
export function EquipmentGrid({ items }: { items: { name: string; text: string }[] }) {
  return (
    <div role="list" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => (
        <Reveal key={it.name} delay={i * 0.08}>
          <div role="listitem" className="glass group relative flex h-full flex-col items-center overflow-hidden rounded-3xl p-6 text-center transition-transform duration-500 hover:-translate-y-1.5">
            <span aria-hidden="true" className="absolute -top-10 left-1/2 size-40 -translate-x-1/2 rounded-full bg-accent-soft/70 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
            <span className="relative grid size-32 place-items-center rounded-full bg-accent-soft/80 p-3 ring-1 ring-white/80">
              <span aria-hidden="true" className="sa-ripple absolute inset-0 rounded-full border border-accent/30" style={{ animationDelay: `${i * 0.5}s` }} />
              {icons[i]}
            </span>
            <h3 className="relative mt-5 text-xl tracking-tight">{it.name}</h3>
            <p className="relative mt-1.5 text-sm leading-relaxed text-muted">{it.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
