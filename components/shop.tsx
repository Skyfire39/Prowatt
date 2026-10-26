"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { ArrowIcon, SearchIcon } from "./icons";
import { MotoCard, type MotoCardItem } from "./moto-card";
import { ProductCard } from "./product-card";

/** Minuscules sans accents : « Câble » se trouve en tapant « cable ». */
const fold = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const PAGE_SIZE = 6;

type Cat = { id: string; name: string; count: number };
type Item = {
  id: string;
  category: string;
  name: string;
  price: string;
  /** null : prix sur demande (les motos). */
  priceValue: number | null;
  addedAt: string;
  href: string;
  /** Présent pour une moto : carte dédiée, sans panier. */
  moto?: MotoCardItem;
};
type Sort = "newest" | "oldest" | "priceAsc" | "priceDesc";
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
  one: string;
  count: string;
  sortLabel: string;
  sortNewest: string;
  sortOldest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  priceLabel: string;
  priceMin: string;
  priceMax: string;
  reset: string;
  noMatchTitle: string;
  noMatchText: string;
  searchLabel: string;
  searchPlaceholder: string;
  addToCart: string;
  added: string;
  addToCartAria: string;
  view: string;
};

const fieldClass =
  "h-11 w-full rounded-full border border-line bg-white/50 px-4 text-sm outline-none backdrop-blur-md transition focus:border-accent focus:ring-4 focus:ring-accent/20";

// Les articles sans prix passent après les autres dans les tris par prix.
const pv = (i: Item) => i.priceValue ?? Number.MAX_SAFE_INTEGER;
const compare: Record<Sort, (a: Item, b: Item) => number> = {
  newest: (a, b) => b.addedAt.localeCompare(a.addedAt),
  oldest: (a, b) => a.addedAt.localeCompare(b.addedAt),
  priceAsc: (a, b) => pv(a) - pv(b) || b.addedAt.localeCompare(a.addedAt),
  priceDesc: (a, b) => (a.priceValue === null ? 1 : b.priceValue === null ? -1 : b.priceValue - a.priceValue) || b.addedAt.localeCompare(a.addedAt),
};

export function Shop({
  categories,
  items,
  labels,
  contactHref,
  bounds,
}: {
  categories: Cat[];
  items: Item[];
  labels: Labels;
  contactHref: string;
  bounds: { min: string; max: string };
}) {
  const [active, setActive] = useState<string>("all");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const [sort, setSort] = useState<Sort>("newest");
  const [query, setQuery] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const lo = min === "" ? 0 : Number(min);
  const hi = max === "" ? Infinity : Number(max);
  const inCategory = active === "all" ? items : items.filter((i) => i.category === active);
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const filtered = inCategory
    // Un filtre de prix écarte les articles sans prix.
    .filter((i) => (i.priceValue === null ? min === "" && max === "" : i.priceValue >= lo && i.priceValue <= hi))
    .filter((i) => {
      if (terms.length === 0) return true;
      const haystack = fold(`${i.name} ${categoryName.get(i.category) ?? ""}`);
      return terms.every((t) => haystack.includes(t));
    })
    .sort(compare[sort]);
  const filtering = query !== "" || min !== "" || max !== "" || sort !== "newest";
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const shown = filtered.slice(start, start + PAGE_SIZE);

  function choose(id: string) {
    setActive(id);
    setPage(1);
  }

  function change<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setPage(1);
    };
  }
  const changeSort = change(setSort);
  const changeQuery = change(setQuery);
  const changeMin = change(setMin);
  const changeMax = change(setMax);

  function reset() {
    setSort("newest");
    setQuery("");
    setMin("");
    setMax("");
    setPage(1);
  }

  function goTo(n: number) {
    setPage(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="swipe-row flex flex-wrap justify-center gap-2" role="tablist">
        {[{ id: "all", name: labels.all, count: items.length }, ...categories].map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            onClick={(e) => {
              choose(c.id);
              e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }}
            className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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

      {/* Tri et fourchette de prix */}
      <div
        role="search"
        className="glass mx-auto mt-6 flex max-w-6xl flex-wrap items-end gap-x-4 gap-y-3 rounded-2xl p-4 sm:p-5"
      >
        <label className="relative block w-full lg:w-auto lg:min-w-[16rem] lg:flex-[1.4]">
          <span className="sr-only">{labels.searchLabel}</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            autoComplete="off"
            className={`${fieldClass} pl-12`}
          />
        </label>

        <label className="grid w-full gap-1.5 sm:min-w-[12rem] sm:flex-1 sm:w-auto text-xs font-semibold uppercase tracking-wider text-muted">
          {labels.sortLabel}
          <select
            value={sort}
            onChange={(e) => changeSort(e.target.value as Sort)}
            className={`${fieldClass} text-sm font-medium normal-case tracking-normal text-ink`}
          >
            <option value="newest">{labels.sortNewest}</option>
            <option value="oldest">{labels.sortOldest}</option>
            <option value="priceAsc">{labels.sortPriceAsc}</option>
            <option value="priceDesc">{labels.sortPriceDesc}</option>
          </select>
        </label>

        <fieldset className="w-full min-w-0 sm:w-auto sm:min-w-[16rem] sm:flex-1">
          <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            {labels.priceLabel}
          </legend>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={min}
              onChange={(e) => changeMin(e.target.value)}
              placeholder={`${labels.priceMin} · ${bounds.min}`}
              aria-label={`${labels.priceLabel} — ${labels.priceMin}`}
              className={fieldClass}
            />
            <span aria-hidden="true" className="text-muted">
              –
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={max}
              onChange={(e) => changeMax(e.target.value)}
              placeholder={`${labels.priceMax} · ${bounds.max}`}
              aria-label={`${labels.priceLabel} — ${labels.priceMax}`}
              className={fieldClass}
            />
          </div>
        </fieldset>

        <div className="flex w-full items-center justify-between gap-4 pb-0.5 sm:w-auto sm:justify-start">
          <p className="text-sm text-muted" aria-live="polite">
            {filtered.length === 1
              ? labels.one
              : labels.count.replace("{n}", String(filtered.length))}
          </p>
          {filtering && (
            <button
              type="button"
              onClick={reset}
              className="h-11 rounded-full border border-line px-5 text-sm font-medium transition hover:bg-accent-soft"
            >
              {labels.reset}
            </button>
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="glass mx-auto mt-12 max-w-xl rounded-2xl p-10 text-center">
          <p className="text-2xl font-semibold tracking-tight">
            {inCategory.length === 0 ? labels.emptyTitle : labels.noMatchTitle}
          </p>
          <p className="mt-2 text-muted">
            {inCategory.length === 0 ? labels.emptyText : labels.noMatchText}
          </p>
          {inCategory.length === 0 ? (
            <a
              href={contactHref}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-on-accent"
            >
              {labels.order}
              <ArrowIcon className="size-4" />
            </a>
          ) : (
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-on-accent"
            >
              {labels.reset}
            </button>
          )}
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
                {p.moto ? <MotoCard item={p.moto} /> : <ProductCard item={p} labels={labels} />}
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
