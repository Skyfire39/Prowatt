"use client";

import { useSyncExternalStore } from "react";
import type { CartProduct } from "./content";
import { defaultSelection, lineKey, resolveSelection, selectionDelta, selectionImage, selectionLabel, type Selection } from "./options";

/**
 * Panier côté navigateur : un petit store externe persisté dans localStorage.
 * On ne stocke que des identifiants et des quantités ; noms et prix sont relus
 * dans le catalogue, donc ils suivent toujours la langue et les tarifs en vigueur.
 */
export type CartLine = { id: string; qty: number; /** Choix du client (couleur, type…), absent pour un produit sans options. */ o?: Selection };
type State = { lines: CartLine[]; open: boolean };

const KEY = "prowatt-cart";
const MAX_QTY = 99;
const EMPTY: State = { lines: [], open: false };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

// Catalogue courant, injecté par <CatalogProvider> (le même sur le serveur et dans le navigateur).
let catalog: CartProduct[] = [];
let derivedCache = new WeakMap<CartLine[], { views: CartLineView[]; count: number; subtotal: number }>();
export function setCatalog(list: CartProduct[]) {
  if (catalog === list) return;
  catalog = list;
  derivedCache = new WeakMap();
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(raw)) {
      const lines = raw
        .filter((l): l is CartLine => l && typeof l.id === "string")
        .map((l) => ({
          id: l.id,
          qty: Math.min(MAX_QTY, Math.max(1, Math.floor(Number(l.qty) || 1))),
          ...(l.o && typeof l.o === "object" && !Array.isArray(l.o) ? { o: Object.fromEntries(Object.entries(l.o).filter(([, v]) => typeof v === "string")) as Selection } : {}),
        }));
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

/** Identifiant normalisé d'une ligne : les choix sont complétés et validés avec les options actuelles du produit. */
function keyOf(id: string, o?: Selection) {
  const options = catalog.find((p) => p.id === id)?.options ?? [];
  return lineKey(id, options.length ? (resolveSelection(options, o) ?? defaultSelection(options)) : undefined);
}

export const cart = {
  add(id: string, qty = 1, o?: Selection) {
    const key = keyOf(id, o);
    const existing = state.lines.find((l) => keyOf(l.id, l.o) === key);
    const lines = existing
      ? state.lines.map((l) => (l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
      : [...state.lines, { id, qty: Math.min(MAX_QTY, qty), ...(o && Object.keys(o).length ? { o } : {}) }];
    emit({ ...state, lines });
  },
  /** `key` : identifiant de la ligne (voir `CartLineView.key`). */
  setQty(key: string, qty: number) {
    if (qty < 1) return cart.remove(key);
    emit({
      ...state,
      lines: state.lines.map((l) => (keyOf(l.id, l.o) === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    });
  },
  remove(key: string) {
    emit({ ...state, lines: state.lines.filter((l) => keyOf(l.id, l.o) !== key) });
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

export type CartLineView = {
  /** Identifiant de la ligne : le produit et ses choix. */
  key: string;
  product: CartProduct;
  qty: number;
  /** Choix du client, complets (une option sans choix prend sa première valeur). */
  selection: Selection;
  /** « Couleur : Rouge · Batterie : Lithium », vide sans options. */
  optionsLabel: string;
  /** Photo de la ligne : celle du choix quand il en a une, sinon celle du produit. */
  image: string | null;
  /** Prix unitaire avec les suppléments des options choisies. */
  unit: number;
  total: number;
};

/** Lignes du panier résolues dans le catalogue, avec le total de chaque ligne. */
function resolve(lines: CartLine[]): CartLineView[] {
  return lines.flatMap((l) => {
    const product = catalog.find((p) => p.id === l.id);
    if (!product) return [];
    // Un choix qui n'existe plus (option modifiée depuis) revient aux valeurs par défaut.
    const selection = resolveSelection(product.options, l.o) ?? defaultSelection(product.options);
    const unit = product.price + selectionDelta(product.options, selection);
    return [{ key: keyOf(product.id, l.o), product, qty: l.qty, selection, optionsLabel: selectionLabel(product.options, selection), image: selectionImage(product.options, selection) ?? product.image, unit, total: unit * l.qty }];
  });
}

export function useCart() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  let derived = derivedCache.get(s.lines);
  if (!derived) {
    const views = resolve(s.lines);
    derived = {
      views,
      count: views.reduce((n, v) => n + v.qty, 0),
      subtotal: views.reduce((n, v) => n + v.total, 0),
    };
    derivedCache.set(s.lines, derived);
  }
  return { ...derived, open: s.open, lines: s.lines };
}

export const formatPrice = (n: number, lang: string, currency: string) =>
  `${new Intl.NumberFormat(lang).format(n)} ${currency}`;
