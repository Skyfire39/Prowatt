"use client";

import type { FormEvent } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { site } from "@/lib/site";
import { ArrowIcon, ChatIcon } from "./icons";
import { Reveal } from "./motion";

const field =
  "w-full rounded-2xl border border-line bg-white/40 px-4 py-3 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/20 dark:bg-white/5";

export function Contact({ dict }: { dict: Dictionary["contact"] }) {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = [
      `${dict.name}: ${data.get("name")}`,
      `${dict.email}: ${data.get("email")}`,
      `${dict.interest}: ${data.get("interest")}`,
      "",
      `${data.get("message")}`,
    ].join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      dict.mailSubject,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <section id="contact" className="px-4 py-24 sm:px-6 sm:py-32">
      <Reveal className="mx-auto max-w-6xl">
        <div className="glass-strong relative overflow-hidden rounded-[2.75rem] p-8 sm:p-14">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-96 rounded-full bg-lime/50 blur-3xl dark:bg-lime/15"
          />
          <div className="relative grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {dict.eyebrow}
              </p>
              <h2 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                {dict.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">{dict.subtitle}</p>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="glass mt-8 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium transition-transform hover:scale-[1.03] active:scale-95"
              >
                <ChatIcon className="size-5 text-accent" />
                {dict.whatsapp}
              </a>
            </div>

            <form onSubmit={onSubmit} className="grid gap-4 lg:col-span-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium">
                  {dict.name}
                  <input name="name" required autoComplete="name" className={field} />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  {dict.email}
                  <input name="email" type="email" required autoComplete="email" className={field} />
                </label>
              </div>
              <label className="grid gap-1.5 text-sm font-medium">
                {dict.interest}
                <select name="interest" className={field}>
                  {dict.interests.map((o) => (
                    <option key={o} value={o} className="text-[#0d2825]">
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                {dict.message}
                <textarea name="message" rows={5} required className={`${field} resize-none`} />
              </label>
              <button
                type="submit"
                className="group inline-flex h-12 w-fit items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-medium text-on-accent shadow-lg shadow-teal/25 transition-transform hover:scale-[1.03] active:scale-95"
              >
                {dict.send}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
