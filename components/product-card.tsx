"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cart } from "@/lib/cart";
import { ProductThumb } from "./cart-drawer";
import { BagIcon, CheckIcon } from "./icons";

export type CardBadge = { label: string; tone: "lime" | "teal" | "accent" };
export type CardItem = {
  id: string;
  name: string;
  price: string;
  href: string;
  /** Image envoyée depuis l'administration (sinon l'illustration par défaut). */
  image?: string | null;
  /** Pastille posée sur l'image (Nouveau, Top vente, -15 %…). */
  badge?: CardBadge;
  /** Ancien prix, barré, quand le produit est en promotion. */
  oldPrice?: string;
};

const badgeTones = {
  lime: "bg-lime text-teal",
  teal: "bg-teal text-lime",
  accent: "bg-accent text-on-accent",
};
export type CardLabels = { addToCart: string; added: string; addToCartAria: string; view: string };

/** Carte produit : l'image et le nom mènent à la fiche, le bouton ajoute au panier sans quitter la liste. */
export function ProductCard({ item, labels }: { item: CardItem; labels: CardLabels }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function add() {
    cart.add(item.id, 1);
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1800);
  }

  return (
    <>
      <div className="relative">
        <Link href={item.href} aria-label={`${labels.view} : ${item.name}`} className="group block overflow-hidden rounded-2xl">
          <ProductThumb src={item.image} className="h-44 w-full transition-transform duration-500 group-hover:scale-[1.04]" />
        </Link>
        {item.badge && (
          <span
            className={`pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${badgeTones[item.badge.tone]}`}
          >
            {item.badge.label}
          </span>
        )}
      </div>
      <h3 className="mt-5 flex-1 text-xl leading-snug">
        <Link href={item.href} className="hover:underline">
          {item.name}
        </Link>
      </h3>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
        <div className="min-w-0">
          {item.oldPrice && <p className="text-sm tabular-nums text-muted line-through">{item.oldPrice}</p>}
          <p className="whitespace-nowrap text-2xl tracking-tight text-accent">{item.price}</p>
        </div>
        <motion.button
          type="button"
          onClick={add}
          whileTap={{ scale: 0.92 }}
          aria-label={`${labels.addToCartAria} : ${item.name}`}
          className={`inline-flex h-11 items-center gap-2 overflow-hidden rounded-full px-5 text-sm font-semibold transition-colors ${
            done ? "bg-lime text-teal" : "bg-accent text-on-accent hover:opacity-90"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={done ? "d" : "a"}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="inline-flex items-center gap-2"
            >
              {done ? <CheckIcon className="size-4" /> : <BagIcon className="size-4" />}
              {done ? labels.added : labels.addToCart}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
