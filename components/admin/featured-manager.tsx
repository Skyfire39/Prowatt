"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { quickPromoAction, quickToggleAction } from "@/app/admin/(panel)/produits/actions";
import { ar } from "@/lib/format";
import { StarIcon } from "./icons";
import { Badge, inputClass } from "./ui";

export type FeaturedRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  bestSeller: boolean;
  active: boolean;
  image: string | null;
};

const SHOWN = 4;
const PAGE_SIZE = 12;
type View = "all" | "best" | "promo" | "hidden";

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function Thumb({ src, className = "size-11" }: { src: string | null; className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-line ${className}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" className="absolute inset-0 size-full object-contain p-1" />
      )}
    </span>
  );
}

/**
 * Gestion des produits mis en avant sur l'accueil : l'aperçu des trois onglets se met à jour
 * en direct, les réglages s'enregistrent sans recharger la page, et la liste se filtre et se pagine.
 * `rows` arrive trié comme sur le site (les plus récents d'abord).
 */
export function FeaturedManager({ initial }: { initial: FeaturedRow[] }) {
  const [rows, setRows] = useState(initial);
  const [view, setView] = useState<View>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const visible = rows.filter((r) => r.active);
  const bestAll = visible.filter((r) => r.bestSeller);
  const promoAll = visible.filter((r) => r.oldPrice);
  const best = bestAll.slice(0, SHOWN);
  const latest = visible.slice(0, SHOWN);
  const promo = promoAll.slice(0, SHOWN);
  const inBest = new Set(best.map((r) => r.id));
  const inPromo = new Set(promo.map((r) => r.id));
  const inNew = new Set(latest.map((r) => r.id));

  const counts: Record<View, number> = {
    all: rows.length,
    best: rows.filter((r) => r.bestSeller).length,
    promo: rows.filter((r) => r.oldPrice).length,
    hidden: rows.filter((r) => !r.active).length,
  };

  const filtered = useMemo(() => {
    const terms = fold(query).split(/\s+/).filter(Boolean);
    return rows.filter((r) => {
      if (view === "best" && !r.bestSeller) return false;
      if (view === "promo" && !r.oldPrice) return false;
      if (view === "hidden" && r.active) return false;
      const hay = fold(`${r.name} ${r.category}`);
      return terms.every((t) => hay.includes(t));
    });
  }, [rows, view, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function say(tone: "ok" | "err", text: string) {
    setStatus({ tone, text });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus(null), 3200);
  }

  /** Applique tout de suite, annule si le serveur refuse. */
  function update(id: string, patch: Partial<FeaturedRow>, send: () => Promise<{ ok: true } | { ok: false; error: string }>, okText: string) {
    const before = rows.find((r) => r.id === id);
    if (!before) return;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    startTransition(async () => {
      let res: Awaited<ReturnType<typeof send>>;
      try {
        res = await send();
      } catch {
        res = { ok: false, error: "Enregistrement impossible. Réessayez." };
      }
      if (res.ok) say("ok", okText);
      else {
        setRows((rs) => rs.map((r) => (r.id === id ? before : r)));
        say("err", res.error);
      }
    });
  }

  const toggle = (r: FeaturedRow, field: "bestSeller" | "active") =>
    update(
      r.id,
      { [field]: !r[field] },
      () => quickToggleAction(r.id, field, !r[field]),
      field === "bestSeller" ? (r[field] ? "Retiré des meilleures ventes." : "Ajouté aux meilleures ventes.") : r[field] ? "Produit masqué du site." : "Produit visible sur le site.",
    );

  const setPromo = (r: FeaturedRow, oldPrice: number | null) =>
    update(r.id, { oldPrice }, () => quickPromoAction(r.id, oldPrice), oldPrice ? "Promotion enregistrée." : "Promotion retirée.");

  function go(n: number) {
    setPage(n);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const previews = [
    { title: "Meilleures ventes", items: best, total: bestAll.length, empty: "Cliquez sur l'étoile d'un produit pour l'ajouter." },
    { title: "Nouveautés", items: latest, total: latest.length, empty: "Aucun produit visible." },
    { title: "Promotions", items: promo, total: promoAll.length, empty: "Indiquez un ancien prix sur un produit pour créer une promotion." },
  ];

  const tabs: { id: View; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "best", label: "Meilleures ventes" },
    { id: "promo", label: "Promotions" },
    { id: "hidden", label: "Masqués" },
  ];

  return (
    <div className="grid gap-6">
      {/* Aperçu de l'accueil */}
      <section aria-label="Aperçu de l'accueil" className="grid gap-4 md:grid-cols-3">
        {previews.map((p) => (
          <div key={p.title} className="glass min-w-0 rounded-2xl p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{p.title}</h2>
              <span className="text-xs font-semibold tabular-nums text-muted">
                {p.items.length}/{SHOWN}
                {p.total > SHOWN ? ` · ${p.total} au total` : ""}
              </span>
            </div>
            {p.items.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-5 text-center text-sm text-muted">{p.empty}</p>
            ) : (
              <ol className="mt-4 grid gap-2.5">
                {p.items.map((r) => (
                  <li key={r.id} className="flex min-w-0 items-center gap-3">
                    <Thumb src={r.image} className="size-10" />
                    <span className="min-w-0 flex-1 overflow-hidden">
                      <span className="block truncate text-sm font-medium">{r.name}</span>
                      <span className="block text-xs tabular-nums text-muted">{ar(r.price)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </section>

      {/* Liste des produits */}
      <section ref={listRef} className="glass scroll-mt-24 overflow-hidden rounded-2xl" aria-label="Tous les produits">
        <div className="grid gap-4 border-b border-line/70 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Tous les produits</h2>
              <p className="text-sm text-muted">Chaque changement est enregistré et visible sur le site tout de suite.</p>
            </div>
            <p
              role="status"
              aria-live="polite"
              className={`min-h-9 rounded-full px-4 py-2 text-[13px] font-semibold transition-opacity ${
                status ? "opacity-100" : "opacity-0"
              } ${status?.tone === "err" ? "bg-red-500/15 text-red-700" : "bg-lime/70 text-teal"}`}
            >
              {status?.text ?? " "}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher un produit ou une catégorie…"
              aria-label="Rechercher un produit"
              className={`${inputClass} w-full sm:max-w-sm`}
            />
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={view === t.id}
                  onClick={() => {
                    setView(t.id);
                    setPage(1);
                  }}
                  className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors ${
                    view === t.id ? "bg-accent text-on-accent" : "glass-chip text-muted hover:bg-accent-soft hover:text-ink"
                  }`}
                >
                  {t.label}
                  <span className={`tabular-nums ${view === t.id ? "opacity-80" : "opacity-60"}`}>{counts[t.id]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="px-6 py-14 text-center text-muted">Aucun produit ne correspond à ces critères.</p>
        ) : (
          <ul>
            {shown.map((r) => (
              <Row key={r.id} r={r} onBest={() => toggle(r, "bestSeller")} onActive={() => toggle(r, "active")} onPromo={(v) => setPromo(r, v)} flags={{ best: inBest.has(r.id), promo: inPromo.has(r.id), fresh: inNew.has(r.id) }} />
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
            <p className="text-muted">
              {(current - 1) * PAGE_SIZE + 1}–{(current - 1) * PAGE_SIZE + shown.length} sur {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" disabled={current === 1} onClick={() => go(current - 1)} className="glass-chip h-9 rounded-full px-4 font-semibold enabled:hover:bg-accent-soft disabled:opacity-40">
                Précédent
              </button>
              <span className="px-1 tabular-nums text-muted">
                {current} / {pages}
              </span>
              <button type="button" disabled={current === pages} onClick={() => go(current + 1)} className="glass-chip h-9 rounded-full px-4 font-semibold enabled:hover:bg-accent-soft disabled:opacity-40">
                Suivant
              </button>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}

function Row({
  r,
  onBest,
  onActive,
  onPromo,
  flags,
}: {
  r: FeaturedRow;
  onBest: () => void;
  onActive: () => void;
  onPromo: (v: number | null) => void;
  flags: { best: boolean; promo: boolean; fresh: boolean };
}) {
  const [draft, setDraft] = useState(r.oldPrice ? String(r.oldPrice) : "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function commit() {
    const v = draft.trim() === "" ? null : Number(draft.replace(/\s/g, ""));
    if (v !== null && (!Number.isInteger(v) || v <= r.price)) {
      setError(`Doit dépasser ${ar(r.price)}`);
      return;
    }
    setError(null);
    setEditing(false);
    if (v !== r.oldPrice) onPromo(v);
  }

  return (
    <li className={`grid items-center gap-x-4 gap-y-3 border-b border-line/70 px-5 py-4 last:border-b-0 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] ${r.active ? "" : "bg-ink/[0.03]"}`}>
      <div className={`flex min-w-0 items-center gap-3.5 ${r.active ? "" : "opacity-60"}`}>
        <Thumb src={r.image} />
        <div className="min-w-0">
          <Link href={`/admin/produits/${r.id}`} className="line-clamp-1 font-semibold hover:underline">
            {r.name}
          </Link>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span className="tabular-nums">
              {r.oldPrice && <s className="mr-1.5 opacity-70">{ar(r.oldPrice)}</s>}
              <span className="font-semibold text-ink">{ar(r.price)}</span>
            </span>
            {flags.best && <Badge tone="lime">Accueil · ventes</Badge>}
            {flags.promo && <Badge tone="lime">Accueil · promo</Badge>}
            {flags.fresh && <Badge tone="blue">Nouveau</Badge>}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <button
          type="button"
          onClick={onBest}
          aria-pressed={r.bestSeller}
          title={r.bestSeller ? "Retirer des meilleures ventes" : "Ajouter aux meilleures ventes"}
          className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
            r.bestSeller ? "bg-accent text-on-accent" : "glass-chip text-muted hover:bg-accent-soft hover:text-ink"
          }`}
        >
          <StarIcon className="size-4" />
          Top vente
        </button>

        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commit();
            }}
            className="flex items-center gap-1.5"
          >
            <div className="relative">
              <input
                autoFocus
                inputMode="numeric"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setEditing(false);
                    setError(null);
                    setDraft(r.oldPrice ? String(r.oldPrice) : "");
                  }
                }}
                placeholder="Ancien prix"
                aria-label={`Ancien prix de ${r.name}`}
                aria-invalid={error ? true : undefined}
                className={`${inputClass} h-9 w-32 text-right tabular-nums ${error ? "border-red-500" : ""}`}
              />
              {error && <span className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white">{error}</span>}
            </div>
            <button type="submit" className="h-9 rounded-full bg-accent px-3.5 text-[13px] font-semibold text-on-accent">
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
                setDraft(r.oldPrice ? String(r.oldPrice) : "");
              }}
              className="h-9 rounded-full px-2.5 text-[13px] text-muted hover:text-ink"
            >
              Annuler
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setDraft(r.oldPrice ? String(r.oldPrice) : "");
                setEditing(true);
              }}
              aria-pressed={!!r.oldPrice}
              className={`inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
                r.oldPrice ? "bg-amber-400/30 text-amber-900" : "glass-chip text-muted hover:bg-accent-soft hover:text-ink"
              }`}
            >
              {r.oldPrice ? "Promo" : "+ Promo"}
            </button>
            {r.oldPrice && (
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  onPromo(null);
                }}
                aria-label={`Retirer la promotion de ${r.name}`}
                className="grid size-9 place-items-center rounded-full text-muted hover:bg-red-500/10 hover:text-red-700"
              >
                ×
              </button>
            )}
          </>
        )}

        <button
          type="button"
          onClick={onActive}
          aria-pressed={r.active}
          className={`inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors ${r.active ? "bg-lime text-teal" : "glass-chip text-muted"}`}
        >
          {r.active ? "Visible" : "Masqué"}
        </button>
      </div>
    </li>
  );
}
