"use client";

import { BODY, Flow, LIME, Panel } from "./scene-parts";
import { AQUA, Bush, Chip, COLD, DayFrame, DEEP, Flower, HOT, PIPE, Sparkle, TEAL, WARM } from "./day-scene";

export type GridScene = { aria: string; roof: string; meter: string; grid: string; bill: string };

const TO_GRID = "M583 300V348H215V300";
const FROM_GRID = "M215 300V348H583V300";

/**
 * Bannière « On-grid » : les panneaux du toit alimentent d'abord le commerce, le compteur intelligent envoie le surplus au
 * réseau et complète au besoin, et la facture (carte flottante) ne cesse de baisser.
 */
export function OngridBanner({ labels }: { labels: GridScene }) {
  return (
    <DayFrame aria={labels.aria}>
      {(ref) => (
        <>
          {/* Câble enterré entre le commerce, le compteur et le réseau, dans les deux sens */}
          <path d={`${TO_GRID}M312 300V348`} fill="none" stroke={TEAL} strokeOpacity="0.3" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <Flow d={TO_GRID} color={WARM} width={3} dash="2 8" />
          <g className="sa-blink" style={{ animationDuration: "6s" }}>
            <Flow d={FROM_GRID} color={COLD} width={3} dash="2 12" />
          </g>

          {/* Pylône du réseau */}
          <g stroke={TEAL} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M190 300L208 168M240 300L222 168M196 262H234M200 236H230M196 262L230 236M234 262L200 236M208 168H222M215 168V156M186 184H244M196 210H234" />
          </g>
          <circle cx="186" cy="184" r="3.5" fill="#fff" />
          <circle cx="244" cy="184" r="3.5" fill="#fff" />
          <path d="M186 184Q110 198 30 190M186 210Q110 224 30 216" fill="none" stroke={TEAL} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />

          {/* Compteur intelligent bidirectionnel */}
          <rect x="290" y="252" width="44" height="48" rx="6" fill={BODY} stroke={TEAL} strokeWidth="3" />
          <rect x="298" y="259" width="28" height="14" rx="2" fill={DEEP} />
          <rect x="301" y="262" width="22" height="8" rx="1.5" fill={AQUA} className="sa-blink" style={{ animationDuration: "3s" }} />
          <path d="M299 282H325M319 277L325 282L319 287M325 292H299M305 287L299 292L305 297" fill="none" stroke={TEAL} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="sa-blink" style={{ animationDuration: "2.4s" }} />

          {/* Le commerce, panneaux sur le toit */}
          <g transform="translate(380 300)">
            <rect x="-6" y="-128" width="242" height="8" rx="3" fill={TEAL} />
            <rect x="0" y="-120" width="230" height="120" fill={BODY} stroke={TEAL} strokeWidth="3" />
            <rect x="6" y="-114" width="218" height="108" fill="#e4f0c8" />
            <path d="M0 -60H230" stroke={TEAL} strokeOpacity="0.4" strokeWidth="2" />

            <g stroke={PIPE} strokeWidth="4" strokeLinecap="round">
              <path d="M46 -128V-122M164 -128V-122" />
            </g>
            <Panel a={[16, -130]} b={[96, -130]} c={[110, -164]} d={[30, -164]} cols={4} rows={2} fill={ref("panel")} />
            <Panel a={[112, -130]} b={[192, -130]} c={[206, -164]} d={[126, -164]} cols={4} rows={2} fill={ref("panel")} />
            <Sparkle x={34} y={-170} r={9} delay={0.2} />
            <Sparkle x={196} y={-172} r={8} delay={1.5} />

            {[18, 70, 122, 174].map((x, i) => (
              <rect key={x} x={x} y="-100" width="38" height="28" rx="3" fill={WARM} className={i % 2 ? "sa-blink" : undefined} style={i % 2 ? { animationDuration: "3.6s" } : undefined} />
            ))}

            <rect x="14" y="-52" width="108" height="42" rx="4" fill={AQUA} fillOpacity="0.55" stroke={TEAL} strokeWidth="2" />
            <circle cx="68" cy="-32" r="22" fill={WARM} fillOpacity="0.6" className="sa-pulse" />
            <path d="M18 -34H118" stroke={TEAL} strokeOpacity="0.4" strokeWidth="1.6" />
            <rect x="134" y="-52" width="20" height="52" rx="3" fill={TEAL} />

            <rect x="180" y="-52" width="34" height="48" rx="5" fill={LIME} stroke={TEAL} strokeWidth="2" />
            <rect x="186" y="-46" width="22" height="12" rx="2" fill={DEEP} />
            <rect x="188" y="-44" width="18" height="8" rx="1.5" fill={AQUA} className="sa-blink" style={{ animationDuration: "2.8s" }} />
            <path d="M188 -26H206M188 -18H206" stroke={TEAL} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />

            <Flow d="M70 -130V-106H197V-52" color={WARM} width={2.6} dash="2 7" />
            <Flow d="M180 -28H156" color={WARM} width={2.6} dash="2 6" />
          </g>

          {/* La facture qui baisse */}
          <g transform="translate(690 150)">
            <g className="sa-float" style={{ animationDuration: "5.5s" }}>
              <rect x="0" y="0" width="112" height="128" rx="14" fill="#fff" fillOpacity="0.96" stroke={TEAL} strokeOpacity="0.25" strokeWidth="2" />
              <path d="M14 18H66M14 30H44" stroke={TEAL} strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
              <rect x="16" y="52" width="20" height="58" rx="4" fill="#b8c9c4" />
              <rect x="46" y="72" width="20" height="38" rx="4" fill={AQUA} />
              <rect x="76" y="90" width="20" height="20" rx="4" fill={TEAL} className="rb-grow" />
              <circle cx="92" cy="22" r="14" fill={LIME} stroke={TEAL} strokeWidth="2" />
              <path d="M92 15V29M86 23L92 29L98 23" fill="none" stroke={TEAL} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
          <Sparkle x={796} y={140} r={8} delay={0.8} fill={HOT} />

          <Bush x={48} y={300} s={0.9} tones={["#0f3a35", "#1f6b62", "#3fa68f"]} />
          <Bush x={868} y={300} s={0.9} tones={["#0f3a35", "#1f6b62", "#4fb59c"]} />
          <Flower x={110} y={300} h={30} delay={0.4} />
          <Flower x={650} y={300} h={26} delay={0.9} />
          <Flower x={832} y={300} h={34} delay={1.5} />

          {/* Étiquettes */}
          <path d="M510 116V146M300 144L246 184M740 376V286" stroke={TEAL} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
          <Chip x={510} y={100} text={labels.roof} delay={0} />
          <Chip x={300} y={128} text={labels.grid} delay={0.6} />
          <Chip x={330} y={396} text={labels.meter} delay={1.2} />
          <Chip x={735} y={392} text={labels.bill} delay={1.8} />
        </>
      )}
    </DayFrame>
  );
}
