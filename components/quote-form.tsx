"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { ResolvedField, ResolvedSection } from "@/lib/forms";
import { mailto } from "@/lib/site";
import { ArrowIcon } from "./icons";

export const fieldClass =
  "w-full rounded-2xl border border-line bg-white/50 px-4 py-3 backdrop-blur-md text-[15px] outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/20";

const pill =
  "cursor-pointer select-none border border-line bg-white/50 text-sm backdrop-blur-md transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30 hover:border-accent";

/**
 * Disposition des options d'un choix :
 *  - list   : libellés longs, deux colonnes de cartes de même largeur
 *  - grid   : quatre options ou plus, pastilles de même largeur alignées en colonnes
 *  - inline : peu d'options courtes (Oui / Non…), pastilles côte à côte
 */
function layoutFor(options: string[]) {
  const longest = Math.max(...options.map((o) => o.length));
  if (longest > 24) return "list" as const;
  return options.length >= 4 ? ("grid" as const) : ("inline" as const);
}

const wrapClass = {
  list: "grid gap-2.5 sm:grid-cols-2",
  grid: "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4",
  inline: "flex flex-wrap gap-2.5",
};
const pillClass = {
  list: `${pill} flex min-h-12 w-full items-center rounded-2xl px-4 py-2.5 text-left leading-snug`,
  grid: `${pill} flex min-h-11 w-full items-center justify-center rounded-full px-3 py-2 text-center`,
  inline: `${pill} inline-block rounded-full px-4 py-2`,
};

type Labels = { submit: string; required: string; note: string };

export function QuoteForm({
  sections,
  labels,
  subject,
}: {
  sections: ResolvedSection[];
  labels: Labels;
  subject: string;
}) {
  const [missing, setMissing] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const lines: string[] = [];
    for (const section of sections) {
      lines.push(`— ${section.title}`);
      for (const f of section.fields) {
        const values = data.getAll(f.name).map(String).filter(Boolean);
        if (f.required && f.kind === "multi" && values.length === 0) {
          setMissing(f.name);
          document.getElementsByName(f.name)[0]?.scrollIntoView({ block: "center" });
          return;
        }
        if (values.length) lines.push(`${f.label} : ${values.join(", ")}`);
      }
      lines.push("");
    }
    setMissing(null);
    window.location.href = mailto(subject, lines.join("\n"));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-12">
      {sections.map((section, i) => (
        <fieldset key={section.title} className={`min-w-0 ${i > 0 ? "border-t border-line pt-10" : ""}`}>
          <legend className="mb-7 float-left w-full text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {section.title}
          </legend>
          <div className="clear-both grid gap-x-6 gap-y-7 sm:grid-cols-2">
            {section.fields.map((f) => (
              <Field key={f.name} field={f} missing={missing === f.name} requiredLabel={labels.required} />
            ))}
          </div>
        </fieldset>
      ))}

      <div className="grid gap-6 border-t border-line pt-10">
        <p className="max-w-xl text-sm leading-relaxed text-muted">{labels.note}</p>
        <button
          type="submit"
          className="group inline-flex h-12 w-fit items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-medium text-on-accent transition-transform hover:opacity-85"
        >
          {labels.submit}
          <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}

function Field({
  field: f,
  missing,
  requiredLabel,
}: {
  field: ResolvedField;
  missing: boolean;
  requiredLabel: string;
}) {
  if (f.kind === "choice" || f.kind === "multi") {
    const type = f.kind === "choice" ? "radio" : "checkbox";
    const layout = layoutFor(f.options);
    return (
      <div className="grid gap-3 sm:col-span-2">
        <span className="text-sm font-medium">
          {f.label}
          {f.required && <span className="text-accent"> *</span>}
        </span>
        <div className={wrapClass[layout]}>
          {f.options.map((opt, i) => (
            <label key={opt} className="block">
              <input
                type={type}
                name={f.name}
                value={opt}
                required={f.kind === "choice" && f.required && i === 0}
                className="peer sr-only"
              />
              <span className={pillClass[layout]}>{opt}</span>
            </label>
          ))}
        </div>
        {missing && <span className="text-sm text-red-600">{requiredLabel}</span>}
      </div>
    );
  }

  return (
    <label className={`grid gap-2 text-sm font-medium ${"half" in f && f.half ? "" : "sm:col-span-2"}`}>
      <span>
        {f.label}
        {f.required && <span className="text-accent"> *</span>}
      </span>
      <input
        name={f.name}
        type={f.kind}
        required={f.required}
        inputMode={f.kind === "number" ? "numeric" : undefined}
        className={fieldClass}
      />
    </label>
  );
}
