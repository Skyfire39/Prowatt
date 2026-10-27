"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cart, formatPrice, useCart } from "@/lib/cart";
import { BagIcon, CheckIcon, MinusIcon, PlusIcon } from "./icons";

type Labels = {
  qty: string;
  qtyMinus: string;
  qtyPlus: string;
  add: string;
  added: string;
  buyNow: string;
  viewCart: string;
  checkout: string;
  total: string;
  inCart: string;
  stickyAdd: string;
};

/**
 * Bloc d'achat de la fiche produit : quantité, total en direct, ajout au panier avec
 * confirmation animée, achat immédiat. Une barre fixe reprend l'action sur mobile dès que le
 * bloc principal sort de l'écran, pour que le bouton reste toujours sous le pouce.
 */
export function AddToCart({
  id,
  name,
  price,
  lang,
  currency,
  labels,
  checkoutHref,
}: {
  id: string;
  name: string;
  price: number;
  lang: string;
  currency: string;
  labels: Labels;
  checkoutHref: string;
}) {
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const [stuck, setStuck] = useState(false);
  // Vrai uniquement dans le navigateur : le portail de la barre fixe n'existe pas au rendu serveur.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const { lines } = useCart();
  const inCart = lines.find((l) => l.id === id)?.qty ?? 0;

  // Barre mobile : visible quand le bloc d'achat n'est plus à l'écran.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function add() {
    cart.add(id, qty);
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 2600);
  }

  const money = (n: number) => formatPrice(n, lang, currency);

  return (
    <>
      <div ref={boxRef} className="grid gap-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">{labels.qty}</span>
            <Stepper qty={qty} onChange={setQty} labels={labels} name={name} />
          </div>
          <div className="min-w-0">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">{labels.total}</span>
            <motion.span
              key={qty}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="block text-3xl font-semibold tabular-nums tracking-tight"
            >
              {money(price * qty)}
            </motion.span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:max-lg:flex-row xl:flex-row">
          <motion.button
            type="button"
            onClick={add}
            whileTap={{ scale: 0.97 }}
            className={`relative inline-flex h-14 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full px-7 text-base font-semibold transition-colors ${
              done ? "bg-lime text-teal" : "bg-accent text-on-accent hover:opacity-90"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.span
                  key="done"
                  initial={{ y: 22, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -22, opacity: 0 }}
                  className="inline-flex items-center gap-2"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 16 }}
                    className="grid size-6 place-items-center rounded-full bg-teal text-lime"
                  >
                    <CheckIcon className="size-4" />
                  </motion.span>
                  {labels.added}
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ y: 22, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -22, opacity: 0 }}
                  className="inline-flex items-center gap-2"
                >
                  <BagIcon className="size-5" />
                  {labels.add}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <Link
            href={checkoutHref}
            onClick={() => cart.add(id, qty)}
            className="glass shadow-none inline-flex h-14 items-center justify-center rounded-full px-7 text-base font-semibold transition-opacity hover:opacity-85"
          >
            {labels.buyNow}
          </Link>
        </div>

        {/* Après l'ajout : l'étape suivante est toujours à portée */}
        <div className="min-h-6 text-sm">
          <AnimatePresence initial={false}>
            {inCart > 0 && (
              <motion.p
                key="incart"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted"
                aria-live="polite"
              >
                <span>{labels.inCart.replace("{n}", String(inCart))}</span>
                <button type="button" onClick={() => cart.open()} className="font-semibold text-accent underline-offset-4 hover:underline">
                  {labels.viewCart}
                </button>
                <Link href={checkoutHref} className="font-semibold text-accent underline-offset-4 hover:underline">
                  {labels.checkout}
                </Link>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Barre d'achat fixe (mobile). Portail : un ancêtre animé (transform) casserait `position: fixed`. */}
      {mounted &&
        createPortal(
      <AnimatePresence>
        {stuck && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            data-sticky-buy=""
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/85 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="text-sm tabular-nums text-muted">{money(price * qty)}</p>
              </div>
              <button
                type="button"
                onClick={add}
                className={`inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors ${
                  done ? "bg-lime text-teal" : "bg-accent text-on-accent"
                }`}
              >
                {done ? <CheckIcon className="size-4" /> : <BagIcon className="size-4" />}
                {done ? labels.added : labels.stickyAdd}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

export function Stepper({
  qty,
  onChange,
  labels,
  name,
  small = false,
}: {
  qty: number;
  onChange: (n: number) => void;
  labels: { qtyMinus: string; qtyPlus: string };
  name: string;
  small?: boolean;
}) {
  const size = small ? "size-9" : "size-12";
  return (
    <div className="glass-chip inline-flex items-center rounded-full p-1" role="group" aria-label={name}>
      <button
        type="button"
        aria-label={labels.qtyMinus}
        onClick={() => onChange(Math.max(1, qty - 1))}
        disabled={qty <= 1}
        className={`${size} grid place-items-center rounded-full transition-colors enabled:hover:bg-accent-soft disabled:opacity-35`}
      >
        <MinusIcon className="size-4" />
      </button>
      <span className={`${small ? "w-8 text-sm" : "w-11 text-lg"} text-center font-semibold tabular-nums`} aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        aria-label={labels.qtyPlus}
        onClick={() => onChange(Math.min(99, qty + 1))}
        disabled={qty >= 99}
        className={`${size} grid place-items-center rounded-full transition-colors enabled:hover:bg-accent-soft disabled:opacity-35`}
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
