"use client";

import { BODY, Battery, Flow, LIME, Panel } from "./scene-parts";
import { AQUA, Bush, Chip, DayFrame, DEEP, Flower, HOT, PIPE, RIM, Sparkle, TEAL, WARM } from "./day-scene";

export type HybScene = { aria: string; grid: string; gen: string; sun: string; hub: string; home: string };

const GRID = "M215 300V338H510V300";
const GEN = "M297 300V322H500V300";
const SUN = "M414 300V310H490V300";

/**
 * Bannière « Hybride » : le soleil, le réseau et le groupe électrogène alimentent un boîtier qui choisit tout seul la source
 * (le soleil en continu, les deux autres à tour de rôle), charge les batteries et garde la maison alimentée.
 */
export function HybrideBanner({ labels }: { labels: HybScene }) {
  return (
    <DayFrame aria={labels.aria}>
      {(ref) => (
        <>
          {/* Câbles enterrés vers le boîtier de gestion */}
          <path d={`${GRID}${GEN}${SUN}`} fill="none" stroke={TEAL} strokeOpacity="0.3" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <Flow d={SUN} color={WARM} width={3} dash="2 8" />
          <g className="sa-blink" style={{ animationDuration: "6s" }}>
            <Flow d={GRID} color={AQUA} width={3} dash="2 8" />
          </g>
          <g className="sa-blink" style={{ animationDuration: "6s", animationDelay: "-3s" }}>
            <Flow d={GEN} color={HOT} width={3} dash="2 8" />
          </g>

          {/* Pylône du réseau */}
          <g stroke={TEAL} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M190 300L208 168M240 300L222 168M196 262H234M200 236H230M196 262L230 236M234 262L200 236M208 168H222M215 168V156M186 184H244M196 210H234" />
          </g>
          <circle cx="186" cy="184" r="3.5" fill="#fff" />
          <circle cx="244" cy="184" r="3.5" fill="#fff" />
          <path d="M186 184Q110 198 30 190M186 210Q110 224 30 216" fill="none" stroke={TEAL} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />

          {/* Groupe électrogène */}
          <g transform="translate(262 300)">
            <g className="sa-bounce" style={{ animationDuration: "0.45s" }}>
              <rect x="0" y="-46" width="70" height="40" rx="7" fill={LIME} stroke={TEAL} strokeWidth="2.5" />
              <rect x="8" y="-38" width="32" height="24" rx="4" fill={BODY} />
              <path d="M13 -26H35M13 -20H35" stroke={TEAL} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
              <circle cx="54" cy="-30" r="7" fill={BODY} stroke={TEAL} strokeWidth="2" />
              <path d="M52 -36L56 -30L52 -30L56 -24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 -46V-54H64V-46" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <rect x="4" y="-6" width="62" height="6" rx="2" fill={TEAL} />
            <path d="M62 -46V-70H72" fill="none" stroke={PIPE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {[0, 1.3, 2.6].map((d) => (
              <circle key={d} cx="76" cy="-76" r="5" fill="#fff" fillOpacity="0.8" className="sa-smoke" style={{ animationDelay: `${d}s` }} />
            ))}
          </g>

          {/* Panneaux au sol */}
          <g stroke={PIPE} strokeWidth="5" strokeLinecap="round">
            <path d="M378 268V300M440 268V300" />
          </g>
          <Panel a={[350, 266]} b={[406, 266]} c={[417, 230]} d={[361, 230]} cols={3} rows={2} fill={ref("panel")} />
          <Panel a={[412, 266]} b={[468, 266]} c={[479, 230]} d={[423, 230]} cols={3} rows={2} fill={ref("panel")} />
          <Sparkle x={366} y={226} r={9} delay={0} />
          <Sparkle x={470} y={224} r={8} delay={1.4} />

          {/* Boîtier de gestion automatique des sources */}
          <rect x="486" y="214" width="58" height="86" rx="8" fill={BODY} stroke={TEAL} strokeWidth="3" />
          <rect x="494" y="222" width="42" height="26" rx="3" fill={DEEP} />
          <rect x="499" y="236" width="7" height="8" rx="1.5" fill={WARM} className="sa-blink" style={{ animationDelay: "0s" }} />
          <rect x="510" y="230" width="7" height="14" rx="1.5" fill={AQUA} className="sa-blink" style={{ animationDelay: "0.9s" }} />
          <rect x="521" y="226" width="7" height="18" rx="1.5" fill={HOT} className="sa-blink" style={{ animationDelay: "1.8s" }} />
          <path d="M498 266H530M524 261L530 266L524 271M532 280H500M506 275L500 280L506 285" fill="none" stroke={TEAL} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="sa-blink" style={{ animationDuration: "2.4s" }} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={500 + i * 14} cy="294" r="2.6" fill={LIME} stroke={TEAL} strokeWidth="1" className="sa-blink" style={{ animationDelay: `${i * 0.6}s` }} />
          ))}

          {/* Batteries et alimentation de la maison */}
          <Flow d="M544 270H558" color={WARM} width={3} dash="2 5" />
          <rect x="558" y="248" width="40" height="52" rx="7" fill={BODY} stroke={TEAL} strokeWidth="3" />
          <Battery x={567} y={254} w={22} h={38} />
          <Flow d="M598 270H630" color={WARM} width={3} dash="2 6" />

          <g transform="translate(630 300)">
            <rect x="0" y="-92" width="150" height="92" fill={BODY} stroke={TEAL} strokeWidth="3" />
            <rect x="6" y="-86" width="138" height="80" fill="#e4f0c8" />
            <polygon points="-10,-92 75,-136 160,-92" fill={TEAL} />
            <path d="M-10 -92L75 -136L160 -92" fill="none" stroke={RIM} strokeOpacity="0.7" strokeWidth="2" strokeLinejoin="round" />
            <path d="M40 -86V-78" stroke={TEAL} strokeWidth="2" />
            <circle cx="40" cy="-68" r="18" fill={WARM} fillOpacity="0.55" className="sa-pulse" />
            <circle cx="40" cy="-68" r="6" fill={WARM} />
            <rect x="62" y="-52" width="40" height="28" rx="3" fill={DEEP} />
            <rect x="65" y="-49" width="34" height="22" rx="2" fill={AQUA} className="sa-blink" style={{ animationDuration: "3.2s" }} />
            <rect x="76" y="-24" width="14" height="4" fill={DEEP} />
            <rect x="112" y="-70" width="22" height="66" rx="4" fill="#fff" stroke={TEAL} strokeWidth="2" />
            <path d="M112 -46H134M117 -62V-52M117 -40V-32" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />
            <Flow d="M0 -30H20V-60H40V-74" color={WARM} width={2.6} dash="2 7" />
            <Flow d="M20 -30H62" color={WARM} width={2.6} dash="2 7" />
            <Flow d="M102 -38H112" color={WARM} width={2.6} dash="2 5" />
          </g>

          <Bush x={48} y={300} s={0.9} tones={["#0f3a35", "#1f6b62", "#3fa68f"]} />
          <Bush x={868} y={300} s={0.9} tones={["#0f3a35", "#1f6b62", "#4fb59c"]} />
          <Flower x={110} y={300} h={30} delay={0.4} />
          <Flower x={832} y={300} h={34} delay={0.9} />

          {/* Étiquettes */}
          <path d="M290 134L246 182M520 136V210" stroke={TEAL} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
          <Chip x={300} y={118} text={labels.grid} delay={0} />
          <Chip x={390} y={190} text={labels.sun} delay={0.6} />
          <Chip x={560} y={120} text={labels.hub} delay={1.2} />
          <Chip x={330} y={392} text={labels.gen} delay={1.8} />
          <Chip x={690} y={392} text={labels.home} delay={2.4} />
        </>
      )}
    </DayFrame>
  );
}
