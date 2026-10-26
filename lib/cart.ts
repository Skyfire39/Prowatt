"use client";

import { useSyncExternalStore } from "react";
import { products } from "./data";
import type { Product } from "./data";

/**
 * Panier côté navigateur : un petit store externe persisté dans localStorage.
 * On ne stocke que des identifiants et des quantités ; noms et prix sont relus
 * dans le catalogue, donc ils suivent toujours la langue et les tarifs en vigueur.
 */
export type CartLine = { id: string; qty: number };
type State = { lines: CartLine[]; open: boolean };

const KEY = "prowatt-cart";
const MAX_QTY = 99;
const EMPTY: State = { lines: [], open: false };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const known = new Set(products.map((p) => p.id));

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(raw)) {
      const lines = raw
        .filter((l): l is CartLine => l && typeof l.id === "string" && known.has(l.id))
        .map((l) => ({ id: l.id, qty: Math.min(MAX_QTY, Math.max(1, Math.floor(Number(l.qty) || 1))) }));
      state = { ...state, lines };
    }
  } catch {
    /* panier illisible : on repart d'un panier vide */
  }
}

function emit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next.lines));
  } catch {
    /* stockage indisponible (navigation privée) : le panier reste en mémoire */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    state = { ...state, lines: [] };
    load();
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => EMPTY;

export const cart = {
  add(id: string, qty = 1) {
    if (!known.has(id)) return;
    const existing = state.lines.find((l) => l.id === id);
    const lines = existing
      ? state.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
      : [...state.lines, { id, qty: Math.min(MAX_QTY, qty) }];
    emit({ ...state, lines });
  },
  setQty(id: string, qty: number) {
    if (qty < 1) return cart.remove(id);
    emit({
      ...state,
      lines: state.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    });
  },
  remove(id: string) {
    emit({ ...state, lines: state.lines.filter((l) => l.id !== id) });
  },
  clear() {
    emit({ ...state, lines: [] });
  },
  open() {
    state = { ...state, open: true };
    listeners.forEach((l) => l());
  },
  close() {
    state = { ...state, open: false };
    listeners.forEach((l) => l());
  },
};

export type CartLineView = { product: Product; qty: number; total: number };

/** Lignes du panier résolues dans le catalogue, avec le total de chaque ligne. */
function resolve(lines: CartLine[]): CartLineView[] {
  return lines.flatMap((l) => {
    const product = products.find((p) => p.id === l.id);
    return product ? [{ product, qty: l.qty, total: product.price * l.qty }] : [];
  });
}

const cache = new WeakMap<CartLine[], { views: CartLineView[]; count: number; subtotal: number }>();

export function useCart() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  let derived = cache.get(s.lines);
  if (!derived) {
    const views = resolve(s.lines);
    derived = {
      views,
      count: views.reduce((n, v) => n + v.qty, 0),
      subtotal: views.reduce((n, v) => n + v.total, 0),
    };
    cache.set(s.lines, derived);
  }
  return { ...derived, open: s.open, lines: s.lines };
}

export const formatPrice = (n: number, lang: string, currency: string) =>
  `${new Intl.NumberFormat(lang).format(n)} ${currency}`;
