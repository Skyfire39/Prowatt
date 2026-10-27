"use client";

import type { ProductOption, Selection } from "@/lib/options";

const fmt = (n: number, lang: string, currency: string) => `${n > 0 ? "+" : "−"}${new Intl.NumberFormat(lang).format(Math.abs(n))} ${currency}`;

/**
 * Choix des options d'un produit : pastilles de couleur (« swatches »), vignettes photo ou boutons de texte, avec le
 * supplément de prix de chaque valeur quand il y en a un. Un groupe de boutons radio par option.
 */
export function OptionPicker({
  options,
  selection,
  onChange,
  lang,
  currency,
}: {
  options: ProductOption[];
  selection: Selection;
  onChange: (next: Selection) => void;
  lang: string;
  currency: string;
}) {
  if (options.length === 0) return null;
  return (
    <div className="grid gap-5">
      {options.map((o) => {
        const current = selection[o.name] ?? o.values[0].label;
        return (
          <div key={o.name} role="radiogroup" aria-label={o.name}>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
              {o.name} : <span className="normal-case tracking-normal text-ink">{current}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {o.values.map((v) => {
                const on = v.label === current;
                const extra = v.delta !== 0 ? fmt(v.delta, lang, currency) : null;
                const pick = () => onChange({ ...selection, [o.name]: v.label });
                if (o.kind === "color" && v.color) {
                  return (
                    <button
                      key={v.label}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={extra ? `${v.label} (${extra})` : v.label}
                      title={extra ? `${v.label} · ${extra}` : v.label}
                      onClick={pick}
                      className={`grid size-11 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-white/70 transition-all ${on ? "scale-105 ring-accent" : "ring-transparent hover:ring-ink/25"}`}
                    >
                      <span className="grid size-9 place-items-center rounded-full border border-ink/15 shadow-inner" style={{ backgroundColor: v.color }}>
                        {on && <span className="size-2.5 rounded-full bg-white/90 shadow-[0_0_0_1px_rgb(0_0_0/0.25)]" />}
                      </span>
                    </button>
                  );
                }
                if (o.kind === "image" && v.image) {
                  return (
                    <button
                      key={v.label}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={pick}
                      className={`group w-[5.25rem] rounded-2xl p-1.5 text-center ring-2 transition-all ${on ? "bg-accent-soft ring-accent" : "glass-chip ring-transparent hover:ring-ink/20"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.image} alt="" className="aspect-square w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                      <span className="mt-1.5 block truncate text-xs font-semibold leading-tight">{v.label}</span>
                      <span className={`block min-h-4 text-[11px] font-medium tabular-nums ${extra ? "text-muted" : ""}`}>{extra}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={v.label}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={pick}
                    className={`inline-flex min-h-11 flex-col items-start justify-center rounded-2xl border px-4 py-1.5 text-left text-sm font-semibold transition-colors ${
                      on ? "border-accent bg-accent text-on-accent" : "glass-chip border-transparent hover:bg-accent-soft"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {v.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.image} alt="" className="size-7 rounded-md object-cover" />
                      )}
                      {v.label}
                    </span>
                    {extra && <span className={`text-xs font-medium tabular-nums ${on ? "text-on-accent/80" : "text-muted"}`}>{extra}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
