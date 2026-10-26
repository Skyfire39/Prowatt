"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { mailto } from "@/lib/site";
import { ArrowIcon, CheckIcon } from "./icons";
import { Logo } from "./logo";

export function Newsletter({ dict }: { dict: Dictionary["newsletter"] }) {
  const id = useId();
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!email) return;
    setSent(true);
    window.location.href = mailto(dict.mailSubject, `${dict.mailBody}${email}`);
  }

  return (
    <section className="px-4 pt-16 sm:px-6 sm:pt-24" aria-labelledby={`${id}-title`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative isolate mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-3xl glass-lime p-8 sm:p-14 lg:grid-cols-2 lg:gap-16"
      >
        <Logo
          variant="mark"
          color="text-teal/10"
          className="pointer-events-none absolute -bottom-24 -left-16 -z-10 h-80 w-auto"
        />

        <div>
          <p className="eyebrow">{dict.eyebrow}</p>
          <h2
            id={`${id}-title`}
            className="mt-3 text-balance text-5xl leading-[1.04] tracking-[-0.04em] text-teal sm:text-6xl"
          >
            {dict.title}
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-teal/75">{dict.subtitle}</p>
        </div>

        <div>
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.p
                key="ok"
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 rounded-2xl bg-white/60 p-5 backdrop-blur-md text-base font-medium text-teal"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal text-white">
                  <CheckIcon className="size-3.5" />
                </span>
                {dict.success}
              </motion.p>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <label htmlFor={`${id}-email`} className="sr-only">
                  {dict.label}
                </label>
                <div className="flex items-center gap-2 rounded-full bg-white/80 p-1.5 pl-6 backdrop-blur-md focus-within:ring-4 focus-within:ring-teal/25">
                  <input
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={dict.placeholder}
                    className="min-w-0 flex-1 bg-transparent py-3 text-base text-teal outline-none placeholder:text-teal/45"
                  />
                  <button
                    type="submit"
                    className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-teal px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-85"
                  >
                    {dict.button}
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-teal/65">{dict.note}</p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
