import { ar } from "@/lib/format";

/** Histogramme SVG des encaissements mensuels : le mois en cours en teal, les précédents en lime. */
export function RevenueChart({ months }: { months: { key: string; label: string; total: number }[] }) {
  const W = 640;
  const H = 240;
  const pad = { t: 28, r: 8, b: 34, l: 8 };
  const max = Math.max(...months.map((m) => m.total), 1);
  const slot = (W - pad.l - pad.r) / months.length;
  const bw = Math.min(64, slot * 0.58);
  const ih = H - pad.t - pad.b;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Encaissements des six derniers mois">
      <defs>
        <linearGradient id="bar-now" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f7d6e" />
          <stop offset="1" stopColor="#175c55" />
        </linearGradient>
        <linearGradient id="bar-old" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9eab9" />
          <stop offset="1" stopColor="#c8e0a2" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad.l} x2={W - pad.r} y1={pad.t + ih * (1 - f)} y2={pad.t + ih * (1 - f)} stroke="#175c55" strokeOpacity="0.1" strokeDasharray="3 5" />
      ))}
      {months.map((m, i) => {
        const h = Math.max(m.total > 0 ? 6 : 2, (m.total / max) * ih);
        const x = pad.l + slot * i + (slot - bw) / 2;
        const y = pad.t + ih - h;
        const now = i === months.length - 1;
        return (
          <g key={m.key}>
            <title>{`${m.label} : ${ar(m.total)}`}</title>
            <rect x={x} y={y} width={bw} height={h} rx={10} fill={now ? "url(#bar-now)" : "url(#bar-old)"} />
            {m.total > 0 && (
              <text x={x + bw / 2} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="600" fill="#175c55" fillOpacity={now ? 1 : 0.7}>
                {m.total >= 1_000_000 ? `${(m.total / 1_000_000).toFixed(1).replace(".", ",")} M` : `${Math.round(m.total / 1000)} k`}
              </text>
            )}
            <text x={x + bw / 2} y={H - 10} textAnchor="middle" fontSize="12.5" fontWeight={now ? 700 : 500} fill="#175c55" fillOpacity={now ? 1 : 0.65}>
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
