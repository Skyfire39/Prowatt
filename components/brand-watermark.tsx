"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

/** Le symbole Prowatt (un soleil de huit pétales), tracé en lignes fines. */
const PATHS = [
  "M131.38,66.11h0c-7.85,0-14.21-6.36-14.21-14.21v-16.99c0-7.85,6.36-14.21,14.21-14.21s14.21,6.36,14.21,14.21v16.99c0,7.85-6.36,14.21-14.21,14.21",
  "M180.15,85.56h0c-5.55-5.55-5.55-14.55,0-20.1l12.01-12.01c5.55-5.55,14.55-5.55,20.1,0s5.55,14.55,0,20.1l-12.01,12.01c-5.55,5.55-14.55,5.55-20.1,0",
  "M200.54,135.02h0c0-7.85,6.36-14.21,14.21-14.21h16.99c7.85,0,14.21,6.36,14.21,14.21s-6.36,14.21-14.21,14.21h-16.99c-7.85,0-14.21-6.36-14.21-14.21",
  "M180.15,182.05h0c5.55-5.55,14.55-5.55,20.1,0l12.01,12.01c5.55,5.55,5.55,14.55,0,20.1s-14.55,5.55-20.1,0l-12.01-12.01c-5.55-5.55-5.55-14.55,0-20.1",
  "M131.38,203.93h0c7.85,0,14.21,6.36,14.21,14.21v16.99c0,7.85-6.36,14.21-14.21,14.21s-14.21-6.36-14.21-14.21v-16.99c0-7.85,6.36-14.21,14.21-14.21",
  "M83,182.71h0c5.55,5.55,5.55,14.55,0,20.1l-12.01,12.01c-5.55,5.55-14.55,5.55-20.1,0s-5.55-14.55,0-20.1l12.01-12.01c5.55-5.55,14.55-5.55,20.1,0",
  "M62.16,135.02h0c0,7.85-6.36,14.21-14.21,14.21h-16.98c-7.85,0-14.21-6.36-14.21-14.21s6.36-14.21,14.21-14.21h16.98c7.85,0,14.21,6.36,14.21,14.21",
  "M83,87.33h0c-5.55,5.55-14.55,5.55-20.1,0l-12.01-12.01c-5.55-5.55-5.55-14.55,0-20.1s14.55-5.55,20.1,0l12.01,12.01c5.55,5.55,5.55,14.55,0,20.1",
  "M170.9,122.26h-52c-15.12,0-27.38-12.26-27.38-27.38h52c15.12,0,27.38,12.26,27.38,27.38",
  "M143.69,172.98h-52c0-15.12,12.26-27.38,27.38-27.38h52c0,15.12-12.26,27.38-27.38,27.38",
];

/**
 * Grand symbole Prowatt en filigrane à droite du fond des pages (sauf l'accueil). Fixe pendant le défilement,
 * trait fin dégradé teal → lime, halo flou en dessous, fondu vers la gauche ; les cartes en verre le floutent
 * en passant par-dessus. Tourne très lentement (arrêté si le visiteur réduit les animations).
 */
export function BrandWatermark({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  if (pathname === `/${lang}` || pathname === `/${lang}/` || pathname === "/") return null;

  const art = (glow: boolean) => (
    <svg viewBox="0 0 280 270.95" className={`bm-svg ${glow ? "bm-glow" : "bm-line"}`} aria-hidden="true" fill="none">
      <g stroke="url(#bm-grad)" strokeWidth={glow ? 9 : 1.4} strokeMiterlimit="10" vectorEffect="non-scaling-stroke">
        {PATHS.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );

  return (
    <div className="brand-mark" aria-hidden="true">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="bm-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c8e0a2" />
            <stop offset="0.55" stopColor="#2f7d6e" />
            <stop offset="1" stopColor="#0a514b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="brand-mark__art">
        {art(true)}
        {art(false)}
      </div>
    </div>
  );
}
