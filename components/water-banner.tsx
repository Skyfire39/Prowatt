"use client";

import { useId } from "react";
import { Flow, Panel, num } from "./scene-parts";

export type WaterLabels = { aria: string; sun: string; pump: string; tank: string; heater: string; tap: string };

const TEAL = "#175c55";
const DEEP = "#123f3a";
const PIPE = "#4f6f78";
const WARM = "#ffe9a8";
const COLD = "#4fc3cc";
const AQUA = "#9fe8ee";
const HOT = "#f2c94c";
const RIM = "#f3f9e6";

/** Vague horizontale qui se répète tous les 80 px : on la fait glisser de 80 px en boucle. */
const wave = (y: number, amp: number) => {
  let d = `M-80 ${y}`;
  for (let x = -80; x < 1120; x += 80) d += `q20 ${-amp} 40 0 t40 0`;
  return `${d}V450H-80Z`;
};

const star = (x: number, y: number, r: number) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

function Sparkle({ x, y, r = 9, delay = 0, fill = "#fff6dc" }: { x: number; y: number; r?: number; delay?: number; fill?: string }) {
  return <path d={star(x, y, r)} fill={fill} className="sa-twinkle" style={{ animationDelay: `${delay}s` }} />;
}

/** Touffe de feuilles posée sur l'herbe. */
function Bush({ x, y, s = 1, tones }: { x: number; y: number; s?: number; tones: [string, string, string] }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="40" ry="10" fill={tones[0]} />
      <g className="sa-sway">
        {[-72, -48, -24, 0, 24, 48, 72].map((a, i) => (
          <path key={a} d="M0 0Q-9 -26 0 -52Q9 -26 0 0Z" fill={tones[i % 3]} transform={`rotate(${a}) scale(${num(1 - Math.abs(a) / 260)})`} />
        ))}
      </g>
    </g>
  );
}

function Flower({ x, y, h, delay }: { x: number; y: number; h: number; delay: number }) {
  return (
    <g className="sa-sway" style={{ animationDelay: `${delay}s` }}>
      <path d={`M${x} ${y}Q${x - 4} ${y - h / 2} ${x} ${y - h}`} stroke="#3c8f78" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx={x} cy={y - h} r="6" fill="#fff3d6" />
      <circle cx={x} cy={y - h} r="2.6" fill="#f2b84b" />
    </g>
  );
}

function Baobab({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <path d="M-13 0C-9 -26 -17 -44 -21 -66H21C17 -44 9 -26 13 0Z" />
      <path d="M-18 -64L-34 -84M-8 -66L-12 -94M6 -66L14 -96M18 -64L36 -82" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      <g className="sa-sway">
        <ellipse cx="-34" cy="-88" rx="18" ry="8" />
        <ellipse cx="-12" cy="-98" rx="17" ry="8" />
        <ellipse cx="14" cy="-100" rx="17" ry="8" />
        <ellipse cx="37" cy="-86" rx="17" ry="8" />
      </g>
    </g>
  );
}

function Chip({ x, y, text, delay = 0 }: { x: number; y: number; text: string; delay?: number }) {
  const w = Math.round(text.length * 8.6 + 44);
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="sa-float" style={{ animationDelay: `${delay}s` }}>
        <rect x={-w / 2} y="-16" width={w} height="32" rx="16" fill="#fff" fillOpacity="0.94" stroke={TEAL} strokeOpacity="0.2" />
        <circle cx={-w / 2 + 17} cy="0" r="4.5" fill={COLD} />
        <text x={-w / 2 + 29} dy="0.35em" fontSize="16" fontWeight="600" fill={DEEP}>
          {text}
        </text>
      </g>
    </g>
  );
}

/**
 * Bannière « Accès à l'eau » : une coupe de terrain illustrée, au couchant. Les panneaux alimentent la pompe immergée du
 * forage, l'eau remonte jusqu'au château d'eau, passe dans le chauffe-eau solaire du toit et coule au robinet.
 */
export function WaterBanner({ labels }: { labels: WaterLabels }) {
  const uid = useId().replace(/\W/g, "");
  const u = (s: string) => `${uid}-${s}`;
  const ref = (s: string) => `url(#${u(s)})`;

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-[0_24px_60px_-24px_rgb(23_92_85/0.5)] ring-1 ring-teal/10 max-sm:h-60 sm:h-[28rem]">
      <svg viewBox="0 0 1000 450" role="img" aria-label={labels.aria} className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={u("sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fd0d6" />
            <stop offset="0.55" stopColor="#c4ebec" />
            <stop offset="1" stopColor="#eef6dd" />
          </linearGradient>
          <radialGradient id={u("glow")} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fffbe0" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#f3f9c8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#c8e0a2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={u("hill")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9cc66a" />
            <stop offset="1" stopColor="#5f9a50" />
          </linearGradient>
          <linearGradient id={u("soil")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e4eec8" />
            <stop offset="1" stopColor="#a9c585" />
          </linearGradient>
          <linearGradient id={u("aqua")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6fd6dc" />
            <stop offset="1" stopColor="#1a7f8e" />
          </linearGradient>
          <linearGradient id={u("panel")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4fd0d6" />
            <stop offset="1" stopColor="#1d7f8c" />
          </linearGradient>
          <linearGradient id={u("heat")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={HOT} stopOpacity="0" />
            <stop offset="1" stopColor={HOT} stopOpacity="0.9" />
          </linearGradient>
          <clipPath id={u("under")}>
            <rect x="0" y="300" width="1000" height="150" />
          </clipPath>
          <clipPath id={u("tank")}>
            <rect x="440" y="140" width="80" height="66" rx="16" />
          </clipPath>
          <filter id={u("grain")} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 0 0.2  0 0 0 0.55 -0.12" />
          </filter>
        </defs>

        {/* Ciel de fin de journée */}
        <rect width="1000" height="300" fill={ref("sky")} />
        <circle cx="820" cy="170" r="300" fill={ref("glow")} className="sa-pulse" style={{ animationDuration: "7s" }} />
        <circle cx="820" cy="96" r="32" fill="#ffe9a8" />
        <circle cx="820" cy="96" r="22" fill="#fff6cf" />
        <g className="rb-cloud" fill="#fff" fillOpacity="0.92">
          <ellipse cx="150" cy="70" rx="52" ry="15" />
          <ellipse cx="122" cy="60" rx="24" ry="15" />
          <ellipse cx="178" cy="58" rx="28" ry="17" />
        </g>
        <g className="rb-cloud" fill="#fff" fillOpacity="0.85" style={{ animationDuration: "58s", animationDelay: "-20s" }}>
          <ellipse cx="620" cy="52" rx="44" ry="12" />
          <ellipse cx="598" cy="45" rx="20" ry="12" />
          <ellipse cx="646" cy="44" rx="24" ry="14" />
        </g>
        <g className="rb-cloud" fill="#fff" fillOpacity="0.75" style={{ animationDuration: "70s", animationDelay: "-40s" }}>
          <ellipse cx="930" cy="150" rx="40" ry="11" />
          <ellipse cx="910" cy="143" rx="18" ry="11" />
        </g>
        <Sparkle x={150} y={30} r={7} delay={0.4} />
        <Sparkle x={420} y={60} r={6} delay={1.6} />
        <Sparkle x={930} y={40} r={8} delay={2.3} />

        {/* Collines et baobabs */}
        <path d="M0 262C140 232 280 246 430 226S700 190 1000 170V320H0Z" fill="#b5dcd2" />
        <path d="M0 300C200 266 380 292 560 270S860 258 1000 276V320H0Z" fill={ref("hill")} />
        <path d="M0 300C200 266 380 292 560 270S860 258 1000 276" fill="none" stroke={RIM} strokeOpacity="0.8" strokeWidth="2" />
        <Baobab x={92} y={288} s={1} color={DEEP} />
        <Baobab x={920} y={278} s={0.85} color={DEEP} />

        {/* Sous terre : couches, cailloux, nappe d'eau */}
        <rect x="0" y="300" width="1000" height="150" fill={ref("soil")} />
        <rect x="0" y="296" width="1000" height="9" fill="#4f9a55" />
        <path d="M0 296H1000" stroke={RIM} strokeOpacity="0.6" strokeWidth="2" />
        <path d="M0 332C150 322 300 342 460 330S760 336 1000 326M0 366C200 358 360 374 560 362S860 368 1000 360" fill="none" stroke={TEAL} strokeOpacity="0.2" strokeWidth="2" />
        {[
          [80, 335, 9],
          [160, 372, 7],
          [610, 330, 8],
          [720, 372, 10],
          [870, 340, 7],
          [940, 372, 8],
        ].map(([x, y, r]) => (
          <ellipse key={`${x}${y}`} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#8fb55a" fillOpacity="0.55" />
        ))}
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

        {/* Grain de papier */}
        <rect width="1000" height="450" filter={ref("grain")} opacity="0.3" />
      </svg>
    </div>
  );
}
