"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { mailto } from "@/lib/site";
import { ArrowIcon } from "./icons";

const PAGE_SIZE = 6;

type Cat = { id: string; name: string; count: number };
type Item = { id: string; category: string; name: string; price: string };
type Labels = {
  all: string;
  order: string;
  emptyTitle: string;
  emptyText: string;
  mailSubject: string;
  pagination: string;
  prev: string;
  next: string;
  goTo: string;
  results: string;
};

export function Shop({
  categories,
  items,
  labels,
  contactHref,
}: {
  categories: Cat[];
  items: Item[];
  labels: Labels;
  contactHref: string;
}) {
  const [active, setActive] = useState<string>("all");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const filtered = active === "all" ? items : items.filter((i) => i.category === active);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const shown = filtered.slice(start, start + PAGE_SIZE);

  function choose(id: string) {
    setActive(id);
    setPage(1);
  }

  function goTo(n: number) {
    setPage(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2" role="tablist">
        {[{ id: "all", name: labels.all, count: items.length }, ...categories].map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            onClick={() => choose(c.id)}
            className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === c.id ? "text-on-accent" : "glass text-muted hover:text-ink"
            }`}
          >
            {active === c.id && (
              <motion.span
                layoutId="shop-pill"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">
              {c.name}
              <span className="ml-1.5 opacity-60">{c.count}</span>
            </span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="glass mx-auto mt-12 max-w-xl rounded-2xl p-10 text-center">
          <p className="text-2xl font-semibold tracking-tight">{labels.emptyTitle}</p>
          <p className="mt-2 text-muted">{labels.emptyText}</p>
          <a
            href={contactHref}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-on-accent"
          >
            {labels.order}
            <ArrowIcon className="size-4" />
          </a>
        </div>
      ) : (
        <>
        <motion.div ref={topRef} layout className="mt-12 scroll-mt-28 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="glass flex flex-col rounded-2xl p-6"
              >
                <div className="grid h-36 place-items-center rounded-2xl border border-line bg-accent-soft/60">
                  <svg viewBox="0 0 120 60" className="w-28 text-accent" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M10 44h100M10 30h100M34 16v40M60 16v40M86 16v40" opacity="0.5" />
                    <rect x="10" y="16" width="100" height="36" rx="4" />
                  </svg>
                </div>
                <h3 className="mt-5 flex-1 text-xl leading-snug">{p.name}</h3>
                <p className="mt-3 text-3xl tracking-tight text-accent">{p.price}</p>
                <a
                  href={mailto(`${labels.mailSubject} — ${p.name}`)}
                  className="group mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line text-sm font-medium transition hover:border-accent hover:bg-accent-soft"
                >
                  {labels.order}
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {pages > 1 && (
          <nav
            aria-label={labels.pagination}
            className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:justify-between"
          >
            <p className="text-sm text-muted" aria-live="polite">
              {labels.results
                .replace("{from}", String(start + 1))
                .replace("{to}", String(start + shown.length))
                .replace("{total}", String(filtered.length))}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={labels.prev}
                disabled={current === 1}
                onClick={() => goTo(current - 1)}
                className="glass-chip grid size-11 place-items-center rounded-full transition-opacity enabled:hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowIcon className="size-5 rotate-180" />
              </button>
              <ul className="flex items-center gap-1.5">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <button
                      type="button"
                      aria-label={`${labels.goTo} ${n}`}
                      aria-current={n === current ? "page" : undefined}
                      onClick={() => goTo(n)}
                      className={`grid size-11 place-items-center rounded-full text-sm font-semibold tabular-nums transition-colors ${
                        n === current ? "bg-accent text-on-accent" : "glass-chip hover:bg-accent-soft"
                      }`}
                    >
                      {n}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-label={labels.next}
                disabled={current === pages}
                onClick={() => goTo(current + 1)}
                className="glass-chip grid size-11 place-items-center rounded-full transition-opacity enabled:hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowIcon className="size-5" />
              </button>
            </div>
          </nav>
        )}
        </>
      )}
    </div>
  );
}
