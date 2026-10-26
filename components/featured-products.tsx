"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ProductCard, type CardItem, type CardLabels } from "./product-card";

export type FeaturedTab = { id: string; label: string; items: CardItem[] };

/**
 * Produits à la une : un sélecteur segmenté (meilleures ventes, nouveautés, promotions) change la
 * liste en douceur. Sur mobile les cartes se glissent à l'horizontale ; l'ajout au panier se fait
 * directement depuis la carte.
 */
export function FeaturedProducts({
  tabs,
  labels,
  groupLabel,
}: {
  tabs: FeaturedTab[];
  labels: CardLabels;
  groupLabel: string;
}) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex justify-center">
        <div role="tablist" aria-label={groupLabel} className="glass-chip inline-flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5">
          {tabs.map((t) => {
            const on = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`featured-tab-${t.id}`}
                aria-selected={on}
                aria-controls="featured-panel"
                onClick={() => setActive(t.id)}
                className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:px-6 ${
                  on ? "text-on-accent" : "text-muted hover:text-ink"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="featured-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="featured-panel" role="tabpanel" aria-labelledby={`featured-tab-${tab.id}`} className="mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="swipe-row swipe-cards grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {tab.items.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="glass flex h-full flex-col rounded-2xl p-5"
              >
                <ProductCard item={item} labels={labels} />
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
