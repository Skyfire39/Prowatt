"use client";

import { Flow, Panel } from "./scene-parts";
import { AQUA, Bush, Chip, COLD, DayFrame, Flower, HOT, PIPE, RIM, Sparkle, TEAL, WARM, wave } from "./day-scene";

export type WaterLabels = { aria: string; sun: string; pump: string; tank: string; heater: string; tap: string };

/**
 * Bannière « Accès à l'eau » : une coupe de terrain illustrée en plein jour. Les panneaux alimentent la pompe immergée du
 * forage, l'eau remonte jusqu'au château d'eau, passe dans le chauffe-eau solaire du toit et coule au robinet.
 */
export function WaterBanner({ labels }: { labels: WaterLabels }) {
  return (
    <DayFrame
      aria={labels.aria}
      defs={(u) => (
        <clipPath id={u("tank")}>
          <rect x="440" y="140" width="80" height="66" rx="16" />
        </clipPath>
      )}
    >
      {(ref) => (
        <>
          {/* Nappe d'eau */}
        <g clipPath={ref("under")}>
          <rect x="0" y="394" width="1000" height="56" fill={ref("aqua")} />
          <path d={wave(394, 7)} fill={AQUA} fillOpacity="0.85" className="wb-wave" />
          <path d={wave(404, 6)} fill={COLD} fillOpacity="0.55" className="wb-wave" style={{ animationDuration: "9s", animationDirection: "reverse" }} />
          {[330, 470, 600, 720, 840].map((x, i) => (
            <circle key={x} cx={x} cy={430 - (i % 2) * 8} r={3 + (i % 3)} fill="#fff" fillOpacity="0.7" className="wb-rise" style={{ animationDelay: `${i * 0.7}s` }} />
          ))}
        </g>

        {/* Panneaux solaires */}
        <g stroke={PIPE} strokeWidth="5" strokeLinecap="round">
          <path d="M237 268V300M308 268V300" />
        </g>
        <Panel a={[205, 266]} b={[270, 266]} c={[282, 228]} d={[217, 228]} cols={3} rows={2} fill={ref("panel")} />
        <Panel a={[276, 266]} b={[341, 266]} c={[353, 228]} d={[288, 228]} cols={3} rows={2} fill={ref("panel")} />
        <Sparkle x={222} y={224} r={9} delay={0} />
        <Sparkle x={318} y={222} r={9} delay={1.4} />

        {/* Câble enterré : des panneaux à la pompe */}
        <path d="M308 300V330H372V386H384" fill="none" stroke={TEAL} strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <Flow d="M308 300V330H372V386H384" color={WARM} width={3} dash="2 8" />

        {/* Forage : tubage, pompe immergée, tuyau de remontée */}
        <rect x="387" y="296" width="18" height="118" rx="3" fill="#44565c" />
        <rect x="391" y="296" width="10" height="118" fill="#123f3a" />
        <rect x="381" y="282" width="30" height="16" rx="4" fill={TEAL} stroke={RIM} strokeOpacity="0.7" />
        <rect x="383" y="372" width="26" height="40" rx="7" fill={TEAL} stroke="#c8e0a2" strokeWidth="2" />
        <path d="M388 384H404M388 392H404" stroke="#c8e0a2" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="396" cy="378" r="2.6" fill="#c8e0a2" className="sa-blink" />
        <Flow d="M396 372V300" color={COLD} width={3} />
        <path d="M396 284V276H480V206" fill="none" stroke={PIPE} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <Flow d="M396 284V276H480V206" color={AQUA} width={3} dash="2 8" />
        <path d="M432 276V296" stroke={PIPE} strokeWidth="5" strokeLinecap="round" />

        {/* Château d'eau */}
        <g stroke={PIPE} strokeWidth="4" strokeLinecap="round">
          <path d="M452 206L444 298M508 206L516 298M448 252H512M446 276L510 232" />
        </g>
        <rect x="440" y="140" width="80" height="66" rx="16" fill="#f3f9e6" stroke={TEAL} strokeWidth="3" />
        <g clipPath={ref("tank")}>
          <rect x="440" y="152" width="80" height="54" fill={ref("aqua")} className="rb-grow" />
        </g>
        <rect x="450" y="148" width="7" height="46" rx="3.5" fill="#fff" fillOpacity="0.45" />
        <path d="M444 150C452 142 468 140 482 140" fill="none" stroke={RIM} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M480 138V128" stroke={TEAL} strokeWidth="3" strokeLinecap="round" />

        {/* Maison et chauffe-eau solaire */}
        <rect x="560" y="238" width="130" height="62" fill="#f3f9e6" />
        <rect x="660" y="238" width="30" height="62" fill="#d5e6b0" />
        <rect x="552" y="231" width="146" height="9" rx="3" fill={TEAL} />
        <path d="M552 231H698" stroke={RIM} strokeOpacity="0.8" strokeWidth="2" />
        <rect x="574" y="256" width="24" height="20" rx="3" fill={WARM} className="sa-blink" style={{ animationDuration: "3.6s" }} />
        <rect x="640" y="256" width="24" height="20" rx="3" fill={WARM} />
        <rect x="612" y="262" width="24" height="38" rx="3" fill={TEAL} />
        <Panel a={[575, 231]} b={[650, 231]} c={[662, 203]} d={[587, 203]} cols={4} rows={2} fill={ref("panel")} />
        <rect x="585" y="182" width="92" height="25" rx="12.5" fill="#f3f9e6" stroke={TEAL} strokeWidth="2.5" />
        <rect x="585" y="182" width="92" height="25" rx="12.5" fill={ref("heat")} className="wb-heat" />
        {[0, 1.4, 2.8].map((d) => (
          <circle key={d} cx="650" cy="176" r="4" fill="#fff" fillOpacity="0.8" className="sa-smoke" style={{ animationDelay: `${d}s` }} />
        ))}
        <path d="M520 172H566V231H575" fill="none" stroke={PIPE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <Flow d="M520 172H566V231H575" color={AQUA} width={2.6} dash="2 8" />

        {/* Robinet et jardin : l'eau chaude coule */}
        <path d="M677 195H712V262H730" fill="none" stroke={PIPE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <Flow d="M677 195H712V262H730" color={HOT} width={2.6} dash="2 8" />
        <path d="M728 262H742V270" fill="none" stroke={TEAL} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {[0, 0.9].map((d) => (
          <circle key={d} cx="742" cy="276" r="2.8" fill={COLD} className="rb-drop" style={{ animationDelay: `${d}s` }} />
        ))}
        <ellipse cx="742" cy="301" rx="20" ry="5.5" fill={COLD} fillOpacity="0.85" />
        <ellipse cx="742" cy="301" rx="15" ry="4" fill="none" stroke="#fff" strokeWidth="1.4" className="sa-ripple" />
        {[772, 790].map((x, i) => (
          <g key={x} className="rb-grow" style={{ animationDelay: `${i * 0.6}s` }}>
            <path d={`M${x} 300V280`} stroke="#5f8f33" strokeWidth="3" strokeLinecap="round" />
            <path d={`M${x} 288C${x - 12} 286 ${x - 14} 276 ${x - 14} 274C${x - 4} 274 ${x} 280 ${x} 288ZM${x} 284C${x + 12} 282 ${x + 14} 272 ${x + 14} 270C${x + 4} 270 ${x} 276 ${x} 284Z`} fill="#8fb55a" />
          </g>
        ))}

        {/* Buissons et fleurs sur l'herbe */}
        <Bush x={48} y={300} s={0.9} tones={["#0f3a35", "#1f6b62", "#3fa68f"]} />
        <Bush x={166} y={300} s={0.7} tones={["#0f3a35", "#2b8a7a", "#4fb59c"]} />
        <Bush x={868} y={300} s={0.9} tones={["#0f3a35", "#1f6b62", "#4fb59c"]} />
        <Bush x={960} y={300} s={0.75} tones={["#0f3a35", "#2b8a7a", "#3fa68f"]} />
        <Flower x={110} y={300} h={30} delay={0.4} />
        <Flower x={832} y={300} h={34} delay={0.9} />
        <Flower x={912} y={300} h={28} delay={1.5} />

        {/* Étiquettes */}
        <path d="M480 124V136M630 160V178M742 322V312" stroke={TEAL} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
        <path d="M411 382H428" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
        <Chip x={314} y={180} text={labels.sun} delay={0} />
        <Chip x={480} y={104} text={labels.tank} delay={0.6} />
        <Chip x={630} y={142} text={labels.heater} delay={1.2} />
        <Chip x={548} y={380} text={labels.pump} delay={1.8} />
        <Chip x={722} y={338} text={labels.tap} delay={2.4} />

        </>
      )}
    </DayFrame>
  );
}
