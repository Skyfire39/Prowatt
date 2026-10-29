"use client";

import { BODY, Battery, Flow, Panel } from "./scene-parts";
import { AQUA, Bush, Chip, DayFrame, DEEP, Flower, RIM, Sparkle, TEAL, WARM, PIPE } from "./day-scene";

export type AutoScene = { aria: string; sun: string; battery: string; home: string; grid: string };

const IN = "M308 300V332H396V300";
const OUT = "M432 300V348H549V300";

/**
 * Bannière « 100 % autonome » : les panneaux chargent les batteries en plein jour, la maison reste éclairée la nuit
 * (fenêtre sur le ciel étoilé) et le pylône du réseau, barré, ne sert plus à rien.
 */
export function AutonomeBanner({ labels }: { labels: AutoScene }) {
  return (
    <DayFrame aria={labels.aria}>
      {(ref) => (
        <>
          {/* Câbles enterrés : panneaux → batteries → maison */}
          <path d={`${IN}M432 300V348H549V300`} fill="none" stroke={TEAL} strokeOpacity="0.3" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <Flow d={IN} color={WARM} width={3} dash="2 8" />
          <Flow d={OUT} color={WARM} width={3} dash="2 8" />

          {/* Panneaux au sol */}
          <g stroke={PIPE} strokeWidth="5" strokeLinecap="round">
            <path d="M237 268V300M308 268V300" />
          </g>
          <Panel a={[205, 266]} b={[270, 266]} c={[282, 228]} d={[217, 228]} cols={3} rows={2} fill={ref("panel")} />
          <Panel a={[276, 266]} b={[341, 266]} c={[353, 228]} d={[288, 228]} cols={3} rows={2} fill={ref("panel")} />
          <Sparkle x={222} y={224} r={9} delay={0} />
          <Sparkle x={318} y={222} r={9} delay={1.4} />

          {/* Armoire de batteries lithium */}
          <rect x="384" y="236" width="60" height="64" rx="8" fill={BODY} stroke={TEAL} strokeWidth="3" />
          <rect x="392" y="244" width="44" height="48" rx="5" fill="#e4f0c8" />
          <Battery x={402} y={250} w={24} h={36} />

          {/* La maison, la nuit vue par la fenêtre */}
          <g transform="translate(520 300)">
            <rect x="0" y="-92" width="170" height="92" fill={BODY} stroke={TEAL} strokeWidth="3" />
            <rect x="6" y="-86" width="158" height="80" fill="#e4f0c8" />
            <polygon points="-10,-92 85,-138 180,-92" fill={TEAL} />
            <path d="M-10 -92L85 -138L180 -92" fill="none" stroke={RIM} strokeOpacity="0.7" strokeWidth="2" strokeLinejoin="round" />

            <rect x="14" y="-50" width="30" height="46" rx="6" fill={BODY} stroke={TEAL} strokeWidth="2" />
            <rect x="19" y="-44" width="20" height="12" rx="2" fill={AQUA} />
            <path d="M20 -24H38M33 -29L38 -24L33 -19M38 -14H20M25 -19L20 -14L25 -9" fill="none" stroke={TEAL} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="sa-blink" style={{ animationDuration: "2.4s" }} />

            <path d="M62 -86V-78" stroke={TEAL} strokeWidth="2" />
            <circle cx="62" cy="-68" r="18" fill={WARM} fillOpacity="0.55" className="sa-pulse" />
            <circle cx="62" cy="-68" r="6" fill={WARM} />

            <rect x="84" y="-84" width="44" height="32" rx="4" fill={DEEP} stroke={TEAL} strokeWidth="2" />
            <circle cx="98" cy="-68" r="8" fill={WARM} />
            <circle cx="102" cy="-71" r="7" fill={DEEP} />
            <Sparkle x={116} y={-74} r={4} delay={0.3} fill={WARM} />
            <Sparkle x={119} y={-62} r={3.4} delay={1.2} fill={WARM} />

            <rect x="84" y="-42" width="44" height="28" rx="3" fill={DEEP} />
            <rect x="87" y="-39" width="38" height="22" rx="2" fill={AQUA} className="sa-blink" style={{ animationDuration: "3.2s" }} />
            <rect x="98" y="-14" width="16" height="4" fill={DEEP} />

            <rect x="140" y="-70" width="22" height="66" rx="4" fill="#fff" stroke={TEAL} strokeWidth="2" />
            <path d="M140 -46H162M145 -62V-52M145 -40V-32" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />

            <Flow d="M29 -50V-80H62V-76" color={WARM} width={2.6} dash="2 7" />
            <Flow d="M44 -26H84" color={WARM} width={3} dash="2 6" />
            <Flow d="M128 -28H140" color={WARM} width={3} dash="2 5" />
          </g>

          {/* Le pylône du réseau, barré : plus de raccordement */}
          <g opacity="0.4" stroke={TEAL} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M765 300L783 168M815 300L797 168M771 262H809M775 236H805M771 262L805 236M809 262L775 236M783 168H797M790 168V156M761 184H819M771 210H809" />
          </g>
          <circle cx="790" cy="228" r="24" fill="#fff" fillOpacity="0.92" stroke={TEAL} strokeWidth="3.5" />
          <path d="M773 245L807 211" stroke={TEAL} strokeWidth="3.5" strokeLinecap="round" />

          <Bush x={48} y={300} s={0.9} tones={["#0f3a35", "#1f6b62", "#3fa68f"]} />
          <Bush x={166} y={300} s={0.7} tones={["#0f3a35", "#2b8a7a", "#4fb59c"]} />
          <Bush x={868} y={300} s={0.9} tones={["#0f3a35", "#1f6b62", "#4fb59c"]} />
          <Flower x={110} y={300} h={30} delay={0.4} />
          <Flower x={716} y={300} h={26} delay={0.9} />
          <Flower x={832} y={300} h={34} delay={1.5} />

          {/* Étiquettes */}
          <path d="M605 126V150M772 376L786 306" stroke={TEAL} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
          <Chip x={300} y={180} text={labels.sun} delay={0} />
          <Chip x={605} y={110} text={labels.home} delay={0.6} />
          <Chip x={440} y={392} text={labels.battery} delay={1.2} />
          <Chip x={745} y={392} text={labels.grid} delay={1.8} />
        </>
      )}
    </DayFrame>
  );
}
