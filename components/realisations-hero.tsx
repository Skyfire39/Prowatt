import type { CSSProperties, ReactNode } from "react";
import { CountUp } from "./count-up";
import { Reveal } from "./motion";

const at = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/**
 * En-tête premium des réalisations : le titre monte mot par mot, le texte apparaît en fondu, les points clés et les
 * chiffres arrivent l'un après l'autre sur un fond de halos lumineux. Tout est en CSS, rien ne dépend du JavaScript
 * (hors compteur), et `prefers-reduced-motion` coupe les animations.
 */
export function RealisationsHero({
  eyebrow,
  title,
  subtitle,
  points,
  stats,
  scene,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  points?: string[];
  stats?: { value: number; label: string }[];
  scene?: ReactNode;
}) {
  const words = title.replace(/ ([%:;!?])/g, " $1").split(" ");
  const base = 0.15;
  const afterTitle = base + words.length * 0.09 + 0.35;

  return (
    <section className="relative isolate px-4 pb-12 pt-32 sm:px-6 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden">
        <span className="sa-float absolute left-[8%] top-24 size-72 rounded-full bg-lime/50 blur-3xl" style={{ animationDuration: "9s" }} />
        <span className="sa-float absolute right-[6%] top-12 size-80 rounded-full bg-accent-soft blur-3xl" style={{ animationDuration: "11s", animationDelay: "-4s" }} />
        <span className="sa-float absolute left-[42%] top-52 size-56 rounded-full bg-lime/30 blur-3xl" style={{ animationDuration: "13s", animationDelay: "-7s" }} />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <p className="eyebrow ch-fade" style={at(0)}>
          {eyebrow}
        </p>
        <h1 className="mt-3 text-balance text-6xl leading-[1.02] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
          {words.map((w, i) => (
            <span key={i}>
              <span className="ch-word">
                <span style={at(base + i * 0.09)}>{w}</span>
              </span>
              {i < words.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
        <span aria-hidden="true" className="ch-line mx-auto mt-6 block h-1 w-24 rounded-full bg-gradient-to-r from-lime via-accent to-lime" style={at(afterTitle - 0.2)} />
        {subtitle && (
          <p className="ch-fade mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted" style={at(afterTitle)}>
            {subtitle}
          </p>
        )}

        {(points?.length || stats?.length) && (
          <ul className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-3">
            {points?.map((p, i) => (
              <li key={p} className="ch-pop glass flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-5 text-sm font-medium" style={at(afterTitle + 0.25 + i * 0.14)}>
                <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-accent text-on-accent">
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                {p}
              </li>
            ))}
            {stats?.map((s, i) => (
              <li key={s.label} className="ch-pop glass-teal flex items-baseline gap-2 rounded-full px-5 py-2 text-sm" style={at(afterTitle + 0.25 + ((points?.length ?? 0) + i) * 0.14)}>
                <span className="text-xl font-semibold tracking-tight">
                  <CountUp value={s.value} />
                </span>
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {scene && (
        <Reveal y={30} delay={0.1} className="mx-auto mt-14 max-w-6xl">
          {scene}
        </Reveal>
      )}
    </section>
  );
}
