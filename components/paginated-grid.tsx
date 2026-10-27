"use client";

import { Children, useRef, useState, type ReactNode } from "react";

const PAGE_SIZE = 10;

/**
 * Grille paginée par 10. Tous les éléments restent dans le HTML (les pages non affichées sont simplement masquées),
 * seule la barre de pages apparaît quand il y a plus de 10 éléments.
 */
export function PaginatedGrid({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  const items = Children.toArray(children);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const [page, setPage] = useState(0);
  const top = useRef<HTMLDivElement>(null);

  const go = (n: number) => {
    setPage(Math.min(Math.max(n, 0), pages - 1));
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const btn = "grid size-11 place-items-center rounded-full text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40";

  return (
    <div ref={top} className="scroll-mt-28">
      <div className={className}>
        {items.map((item, i) => (
          <div key={i} hidden={Math.floor(i / PAGE_SIZE) !== page} className="contents">
            {item}
          </div>
        ))}
      </div>
      {pages > 1 && (
        <nav aria-label={label} className="mt-10 flex items-center justify-center gap-2">
          <button type="button" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Page précédente" className={`${btn} glass hover:bg-white/80`}>
            ‹
          </button>
          {Array.from({ length: pages }, (_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => go(n)}
              aria-label={`Page ${n + 1}`}
              aria-current={n === page ? "page" : undefined}
              className={`${btn} ${n === page ? "bg-accent text-on-accent" : "glass hover:bg-white/80"}`}
            >
              {n + 1}
            </button>
          ))}
          <button type="button" onClick={() => go(page + 1)} disabled={page === pages - 1} aria-label="Page suivante" className={`${btn} glass hover:bg-white/80`}>
            ›
          </button>
        </nav>
      )}
    </div>
  );
}
