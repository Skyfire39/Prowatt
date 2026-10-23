"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { ResolvedField, ResolvedSection } from "@/lib/forms";
import { mailto } from "@/lib/site";
import { ArrowIcon } from "./icons";

export const fieldClass =
  "w-full rounded-2xl border border-line bg-white/40 px-4 py-3 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/20 dark:bg-white/5";

const pill =
  "cursor-pointer select-none rounded-full border border-line bg-white/40 px-4 py-2 text-sm transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30 hover:border-accent dark:bg-white/5";

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
    <form onSubmit={onSubmit} className="grid gap-10">
      {sections.map((section) => (
        <fieldset key={section.title} className="grid gap-5">
          <legend className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {section.title}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {section.fields.map((f) => (
              <Field key={f.name} field={f} missing={missing === f.name} requiredLabel={labels.required} />
            ))}
          </div>
        </fieldset>
      ))}

      <div className="grid gap-4">
        <p className="text-sm leading-relaxed text-muted">{labels.note}</p>
        <button
          type="submit"
          className="group inline-flex h-12 w-fit items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-medium text-on-accent shadow-lg shadow-teal/25 transition-transform hover:scale-[1.03] active:scale-95"
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
    return (
      <div className="grid gap-2 sm:col-span-2">
        <span className="text-sm font-medium">
          {f.label}
          {f.required && <span className="text-accent"> *</span>}
        </span>
        <div className="flex flex-wrap gap-2">
          {f.options.map((opt, i) => (
            <label key={opt}>
              <input
                type={type}
                name={f.name}
                value={opt}
                required={f.kind === "choice" && f.required && i === 0}
                className="peer sr-only"
              />
              <span className={pill}>{opt}</span>
            </label>
          ))}
        </div>
        {missing && <span className="text-sm text-red-600 dark:text-red-400">{requiredLabel}</span>}
      </div>
    );
  }

  return (
    <label className={`grid gap-1.5 text-sm font-medium ${"half" in f && f.half ? "" : "sm:col-span-2"}`}>
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
