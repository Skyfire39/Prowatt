"use client";

import { BODY, Battery, Flow, LIME, Panel } from "./scene-parts";
import { AQUA, Chip, DayFrame, DEEP, HOT, RIM, Sparkle, TEAL, WARM } from "./day-scene";

export type AntiScene = { aria: string; cut: string; switch: string; battery: string; home: string; business: string };

const GRID = "M215 300V338H344V300";
const FEED_SHOP = "M379 300V352H690V300";
const FEED_FACTORY = "M690 352H872V300";

/**
 * Bannière « Anti-délestage » : le réseau est coupé (fils sectionnés, étincelle), mais la batterie de la maison bascule
 * toute seule, garde le frigo, la télé et la lumière en marche, et alimente aussi le commerce et l'usine voisins.
 */
export function AntiDelestageBanner({ labels }: { labels: AntiScene }) {
  return (
    <DayFrame aria={labels.aria}>
      {(ref) => (
        <>
          {/* Câbles enterrés : le réseau (coupé) et les batteries (actives) */}
          <path d={GRID} fill="none" stroke={TEAL} strokeOpacity="0.3" strokeWidth="4" strokeDasharray="4 7" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`${FEED_SHOP}M690 352H872V300`} fill="none" stroke={TEAL} strokeOpacity="0.3" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <Flow d={FEED_SHOP} color={WARM} width={3} dash="2 8" />
          <Flow d={FEED_FACTORY} color={WARM} width={3} dash="2 8" />

          {/* Pylône du réseau : fils sectionnés */}
          <g stroke={TEAL} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M190 300L208 168M240 300L222 168M196 262H234M200 236H230M196 262L230 236M234 262L200 236M208 168H222M215 168V156" />
            <path d="M186 184H244M196 210H234" />
            <path d="M312 300V204M300 208H324" strokeWidth="5" />
          </g>
          <circle cx="186" cy="184" r="3.5" fill="#fff" />
          <circle cx="244" cy="184" r="3.5" fill="#fff" />
          <path d="M186 184Q110 198 30 190M244 184Q254 208 262 220M300 208Q294 220 290 230M324 208Q330 222 342 236" fill="none" stroke={TEAL} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
          <path d="M277 204L269 222H276L272 238L285 216H277Z" fill={HOT} stroke={RIM} strokeWidth="1" strokeLinejoin="round" className="sa-blink" />
          <Sparkle x={262} y={214} r={9} delay={0.2} fill={HOT} />
          <Sparkle x={292} y={222} r={8} delay={1} fill={HOT} />

          {/* La maison, en coupe : batterie, onduleur qui bascule, équipements en marche */}
          <g transform="translate(350 300)">
            <rect x="-14" y="-64" width="12" height="16" rx="2" fill="#fff" stroke={TEAL} strokeWidth="1.6" />
            <circle cx="-8" cy="-56" r="2.2" fill="#b8c9c4" />
            <rect x="0" y="-92" width="180" height="92" fill={BODY} stroke={TEAL} strokeWidth="3" />
            <rect x="6" y="-86" width="168" height="80" fill="#e4f0c8" />
            <polygon points="-10,-92 90,-140 190,-92" fill={TEAL} />
            <path d="M-10 -92L90 -140L190 -92" fill="none" stroke={RIM} strokeOpacity="0.7" strokeWidth="2" strokeLinejoin="round" />
            <Panel a={[14, -101]} b={[74, -129]} c={[68, -142]} d={[8, -114]} cols={3} rows={1} fill={ref("panel")} />
            <Panel a={[96, -137]} b={[170, -101]} c={[176, -114]} d={[102, -150]} cols={3} rows={1} fill={ref("panel")} />
            <Sparkle x={40} y={-142} r={8} delay={0.5} />
            <Sparkle x={140} y={-146} r={7} delay={1.8} />

            <Battery x={14} y={-60} w={30} h={56} />
            <rect x="52" y="-50" width="30" height="46" rx="6" fill={BODY} stroke={TEAL} strokeWidth="2" />
            <rect x="57" y="-44" width="20" height="12" rx="2" fill={AQUA} />
            <path d="M58 -24H76M71 -29L76 -24L71 -19M76 -14H58M63 -19L58 -14L63 -9" fill="none" stroke={TEAL} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="sa-blink" style={{ animationDuration: "2.4s" }} />
            <rect x="92" y="-50" width="36" height="24" rx="3" fill={DEEP} />
            <rect x="95" y="-47" width="30" height="18" rx="2" fill={AQUA} className="sa-blink" style={{ animationDuration: "3.2s" }} />
            <rect x="104" y="-26" width="12" height="5" fill={DEEP} />
            <rect x="140" y="-66" width="26" height="62" rx="4" fill="#fff" stroke={TEAL} strokeWidth="2" />
            <path d="M140 -42H166M145 -58V-48M145 -38V-30" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />
            <path d="M110 -86V-74" stroke={TEAL} strokeWidth="2" />
            <circle cx="110" cy="-68" r="18" fill={WARM} fillOpacity="0.55" className="sa-pulse" />
            <circle cx="110" cy="-68" r="6" fill={WARM} />

            <Flow d="M18 -101V-80H29V-62" color={WARM} width={2.6} dash="2 7" />
            <Flow d="M44 -30H52" color={WARM} width={3} dash="2 5" />
            <Flow d="M82 -30H92" color={WARM} width={3} dash="2 5" />
            <Flow d="M128 -30H140" color={WARM} width={3} dash="2 5" />
            <Flow d="M67 -50V-78H110V-74" color={WARM} width={2.6} dash="2 7" />
          </g>

          {/* Le commerce voisin */}
          <g transform="translate(575 300)">
            <rect x="-4" y="-70" width="100" height="8" rx="3" fill={TEAL} />
            <rect x="0" y="-62" width="92" height="62" fill={BODY} />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x={i * 18.4} y="-62" width="18.4" height="14" fill={i % 2 ? BODY : TEAL} />
                <circle cx={i * 18.4 + 9.2} cy="-48" r="9.2" fill={i % 2 ? BODY : TEAL} />
              </g>
            ))}
            <rect x="10" y="-36" width="50" height="30" rx="3" fill={AQUA} fillOpacity="0.55" stroke={TEAL} strokeWidth="2" />
            <circle cx="35" cy="-22" r="13" fill={WARM} fillOpacity="0.7" className="sa-pulse" />
            <path d="M14 -20H56" stroke={TEAL} strokeOpacity="0.5" strokeWidth="1.6" />
            <rect x="66" y="-34" width="18" height="34" rx="2" fill={TEAL} />
            <Battery x={104} y={-40} w={22} h={40} />
            <Flow d="M104 -14H92" color={WARM} width={2.6} dash="2 6" />
          </g>

          {/* L'usine */}
          <g transform="translate(735 300)">
            <rect x="88" y="-112" width="14" height="44" rx="2" fill="#d5e6b0" stroke={TEAL} strokeWidth="2" />
            <rect x="88" y="-112" width="14" height="6" fill={TEAL} />
            {[0, 1.3, 2.6].map((d) => (
              <circle key={d} cx="95" cy="-118" r="5" fill="#fff" fillOpacity="0.8" className="sa-smoke" style={{ animationDelay: `${d}s` }} />
            ))}
            <rect x="0" y="-54" width="104" height="54" fill={BODY} />
            <path d="M-4 -54V-78L24 -54V-78L52 -54V-78L80 -54V-78L108 -54Z" fill={TEAL} />
            {[10, 36, 62].map((x) => (
              <rect key={x} x={x} y="-40" width="18" height="12" rx="2" fill={WARM} />
            ))}
            <rect x="82" y="-30" width="16" height="30" rx="2" fill={TEAL} />
            <rect x="114" y="-46" width="46" height="46" rx="5" fill={LIME} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x="120" y={-38 + i * 9} width="34" height="5" rx="2" fill={DEEP} className="sa-blink" style={{ animationDelay: `${i * 0.4}s` }} />
            ))}
          </g>

          {/* Étiquettes */}
          <path d="M284 144L277 200M440 108V154M650 166V230" stroke={TEAL} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
          <Chip x={292} y={128} text={labels.cut} delay={0} />
          <Chip x={440} y={92} text={labels.switch} delay={0.6} />
          <Chip x={650} y={150} text={labels.home} delay={1.2} />
          <Chip x={440} y={392} text={labels.battery} delay={1.8} />
          <Chip x={680} y={392} text={labels.business} delay={2.4} />
        </>
      )}
    </DayFrame>
  );
}
