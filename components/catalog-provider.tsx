"use client";

import { createContext, useContext, type ReactNode } from "react";
import { setCatalog } from "@/lib/cart";
import type { CartProduct } from "@/lib/content";
import { site as staticSite } from "@/lib/site";
import type { SiteInfo } from "@/lib/site-info";

const SiteContext = createContext<SiteInfo | null>(null);

/** Coordonnées du site pour les composants client (bulles de contact, commande, formulaires). */
export function useSite(): SiteInfo {
  const ctx = useContext(SiteContext);
  return ctx ?? { ...staticSite, phoneHref: staticSite.phoneHref, payment: staticSite.payment };
}

/**
 * Fournit le catalogue (panier) et les coordonnées de l'entreprise aux composants client.
 * Le catalogue est posé dans le store du panier pendant le rendu, avant les enfants.
 */
export function CatalogProvider({ products, site, children }: { products: CartProduct[]; site: SiteInfo; children: ReactNode }) {
  setCatalog(products);
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}
