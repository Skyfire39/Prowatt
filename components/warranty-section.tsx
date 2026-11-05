import Link from "next/link";
import { ArrowIcon, CheckIcon } from "./icons";
import { Reveal } from "./motion";

type Item = { title: string; text: string };

/** Sceau de garantie : bouclier teal, anneau en pointillés qui tourne lentement et reflet qui le traverse. */
function Seal({ lead, value, unit, label }: { lead: string; value: string; unit: string; label: string }) {
  return (
    <div className="relative mx-auto grid size-64 place-items-center sm:size-72" role="img" aria-label={label}>
      <span aria-hidden="true" className="sa-pulse absolute inset-6 rounded-full bg-lime/30 blur-2xl" style={{ animationDuration: "5s" }} />
      <svg viewBox="0 0 260 260" aria-hidden="true" className="absolute inset-0 size-full">
        <g className="sa-spin" style={{ animationDuration: "50s" }}>
          <circle cx="130" cy="130" r="122" fill="none" stroke="#c8e0a2" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
        </g>
        <circle cx="130" cy="130" r="112" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" />
      </svg>
      <div className="relative grid size-44 place-items-center sm:size-48">
        <svg viewBox="0 0 120 140" aria-hidden="true" className="absolute inset-0 size-full drop-shadow-[0_18px_28px_rgb(8_40_36/0.45)]">
          <defs>
            <linearGradient id="ws-shield" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2f9486" />
              <stop offset="1" stopColor="#0f4a44" />
            </linearGradient>
            <linearGradient id="ws-gloss" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="ws-clip">
              <path d="M60 6L108 24V70C108 100 86 124 60 134C34 124 12 100 12 70V24Z" />
            </clipPath>
          </defs>
          <path d="M60 6L108 24V70C108 100 86 124 60 134C34 124 12 100 12 70V24Z" fill="url(#ws-shield)" stroke="#c8e0a2" strokeWidth="3" strokeLinejoin="round" />
          <path d="M60 16L98 30V70C98 94 81 113 60 122C39 113 22 94 22 70V30Z" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Reflet qui traverse le bouclier, retenu dans sa forme */}
          <g clipPath="url(#ws-clip)">
            <rect x="0" y="0" width="34" height="140" fill="url(#ws-gloss)" className="ws-gloss" />
          </g>
        </svg>
        <span className="relative text-center text-white">
          <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{lead}</span>
          <span className="block text-6xl font-semibold leading-none tracking-[-0.06em] sm:text-7xl">{value}</span>
          <span className="mt-1 block text-sm font-semibold uppercase tracking-[0.22em] text-lime">{unit}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * Section « Garantie » de la page Avantages : grand sceau animé « 10 ans », les engagements de Prowatt sous forme de
 * liste et un bouton pour demander un devis. La durée et les conditions exactes sont celles indiquées sur le devis.
 */
export function WarrantySection({
  eyebrow,
  title,
  text,
  badge,
  items,
  note,
  cta,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  text: string;
  badge: { lead: string; value: string; unit: string; label: string };
  items: Item[];
  note: string;
  cta: string;
  ctaHref: string;
}) {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20">
      <Reveal className="mx-auto max-w-6xl">
        <div className="glass-teal relative isolate overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <span className="sa-float absolute -left-16 -top-20 size-80 rounded-full bg-lime/20 blur-3xl" style={{ animationDuration: "11s" }} />
            <span className="sa-float absolute -bottom-24 right-0 size-96 rounded-full bg-[#5fd0a0]/20 blur-3xl" style={{ animationDuration: "14s", animationDelay: "-5s" }} />
          </div>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16">
            <Seal {...badge} />
            <div>
              <p className="eyebrow eyebrow-on-dark">{eyebrow}</p>
              <h2 className="mt-3 text-balance text-4xl leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl">{title}</h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">{text}</p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {items.map((it, i) => (
                  <Reveal key={it.title} delay={i * 0.08} y={14}>
                    <li className="glass-on-teal flex h-full gap-3.5 rounded-2xl p-5">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-lime text-teal">
                        <CheckIcon className="size-4" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-white">{it.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-white/70">{it.text}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href={ctaHref} className="group inline-flex h-12 items-center gap-2 rounded-full bg-lime px-7 text-[15px] font-medium text-teal transition-opacity hover:opacity-85">
                  {cta}
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="max-w-sm text-sm text-white/60">{note}</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
