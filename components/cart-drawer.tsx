"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { cart, formatPrice, useCart } from "@/lib/cart";
import { tr } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { Stepper } from "./add-to-cart";
import { ArrowIcon, BagIcon, CloseIcon, TrashIcon } from "./icons";

/** Miniature d'un produit : le montage de panneau, en trait. */
export function ProductThumb({ className = "" }: { className?: string }) {
  return (
    <span className={`grid place-items-center rounded-2xl bg-accent-soft/70 text-accent ${className}`}>
      <svg viewBox="0 0 120 60" className="w-3/4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" aria-hidden="true">
        <path d="M10 44h100M10 30h100M34 16v40M60 16v40M86 16v40" opacity="0.5" />
        <rect x="10" y="16" width="100" height="36" rx="4" />
      </svg>
    </span>
  );
}

/**
 * Tiroir du panier : s'ouvre depuis la barre de navigation, se ferme avec Échap ou un clic
 * à côté. Le focus est renvoyé au bouton de fermeture à l'ouverture et le scroll de la page est figé.
 */
export function CartDrawer({
  lang,
  dict,
  currency,
  checkoutHref,
  shopHref,
}: {
  lang: Locale;
  dict: Dictionary["cart"];
  currency: string;
  checkoutHref: string;
  shopHref: string;
}) {
  const { views, count, subtotal, open } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const money = (n: number) => formatPrice(n, lang, currency);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => cart.close()}
            className="absolute inset-0 bg-teal/35 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={dict.title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/70 bg-canvas/90 shadow-[-24px_0_60px_rgb(23_92_85/0.2)] backdrop-blur-2xl"
          >
            <header className="flex items-center justify-between gap-4 px-6 pb-4 pt-6">
              <div>
                <h2 className="text-2xl tracking-tight">{dict.title}</h2>
                <p className="mt-0.5 text-sm text-muted" aria-live="polite">
                  {count === 1 ? dict.one : dict.count.replace("{n}", String(count))}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => cart.close()}
                aria-label={dict.close}
                className="glass-chip grid size-11 place-items-center rounded-full transition-opacity hover:opacity-70"
              >
                <CloseIcon className="size-5" />
              </button>
            </header>

            {views.length === 0 ? (
              <div className="grid flex-1 place-content-center justify-items-center gap-3 px-8 pb-16 text-center">
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="grid size-20 place-items-center rounded-full bg-accent-soft text-accent"
                >
                  <BagIcon className="size-9" />
                </motion.span>
                <p className="text-2xl tracking-tight">{dict.empty}</p>
                <p className="max-w-xs text-muted">{dict.emptyText}</p>
                <Link
                  href={shopHref}
                  onClick={() => cart.close()}
                  className="mt-2 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent"
                >
                  {dict.continue}
                  <ArrowIcon className="size-4" />
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto px-6 py-2">
                  <AnimatePresence initial={false}>
                    {views.map(({ product, qty, total }) => {
                      const name = tr(product.name, lang);
                      return (
                        <motion.li
                          key={product.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 60 }}
                          transition={{ duration: 0.3 }}
                          className="glass flex gap-4 rounded-2xl p-3"
                        >
                          <ProductThumb className="size-20 shrink-0" />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <Link
                              href={`/${lang}/boutique/${product.id}`}
                              onClick={() => cart.close()}
                              className="line-clamp-2 text-[15px] font-semibold leading-snug hover:underline"
                            >
                              {name}
                            </Link>
                            <p className="mt-0.5 text-sm tabular-nums text-muted">{money(product.price)}</p>
                            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                              <Stepper qty={qty} onChange={(n) => cart.setQty(product.id, n)} labels={dict} name={name} small />
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold tabular-nums">{money(total)}</span>
                                <button
                                  type="button"
                                  onClick={() => cart.remove(product.id)}
                                  aria-label={`${dict.remove} : ${name}`}
                                  className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink"
                                >
                                  <TrashIcon className="size-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                <footer className="border-t border-line px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted">{dict.subtotal}</span>
                    <motion.span
                      key={subtotal}
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-3xl font-semibold tabular-nums tracking-tight"
                    >
                      {money(subtotal)}
                    </motion.span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{dict.note}</p>
                  <Link
                    href={checkoutHref}
                    onClick={() => cart.close()}
                    className="group mt-4 flex h-14 items-center justify-center gap-2 rounded-full bg-accent text-base font-semibold text-on-accent transition-opacity hover:opacity-90"
                  >
                    {dict.checkout}
                    <ArrowIcon className="size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => cart.close()}
                    className="mt-2 h-11 w-full rounded-full text-sm font-medium text-muted transition-colors hover:text-ink"
                  >
                    {dict.continue}
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
