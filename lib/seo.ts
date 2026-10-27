import type { Metadata } from "next";
import type { SiteInfo } from "./site-info";

/**
 * Adresse publique du site (sans « / » final). À définir en production : NEXT_PUBLIC_SITE_URL=https://prowattmadagascar.com
 * Elle sert aux liens canoniques, au plan du site, aux aperçus de partage et aux données structurées.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://prowattmadagascar.com").replace(/\/+$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const SITE_NAME = "Prowatt Madagascar";
export const DEFAULT_OG_IMAGE = { url: "/images/solar-sky.jpg", width: 1600, height: 1074, alt: "Panneaux solaires sous le ciel de Madagascar — Prowatt" };

/**
 * Métadonnées d'une page : titre complet (sans gabarit), description, lien canonique, aperçu Open Graph et Twitter.
 * `path` est l'adresse publique de la page (« /boutique »), jamais avec le préfixe de langue interne.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt?: string } | null;
  noindex?: boolean;
}): Metadata {
  const img = image ? { url: image.url, alt: image.alt ?? title } : DEFAULT_OG_IMAGE;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: { type: "website", locale: "fr_MG", siteName: SITE_NAME, url: path, title, description, images: [img] },
    twitter: { card: "summary_large_image", title, description, images: [img.url] },
  };
}

/** Raccourcit un texte à la limite d'une description de résultat de recherche (≈ 160 caractères), sans couper un mot. */
export function clip(text: string, max = 158) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 80)).replace(/[,;:.\s]+$/, "")}…`;
}

/* ───────────── Données structurées (schema.org) ───────────── */

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const pad = (h: string, m?: string) => `${h.padStart(2, "0")}:${m ?? "00"}`;

/** « Lundi – vendredi : 8h – 18h30 » → horaires d'ouverture schema.org. Les lignes illisibles (« Dimanche : fermé ») sont ignorées. */
function openingHours(lines: string[]) {
  const out: { "@type": "OpeningHoursSpecification"; dayOfWeek: string[]; opens: string; closes: string }[] = [];
  for (const line of lines) {
    const m = line.toLowerCase().match(/^\s*([a-zéû]+)(?:\s*(?:–|-|à|au)\s*([a-zéû]+))?\s*:\s*(\d{1,2})h(\d{2})?\s*(?:–|-|à)\s*(\d{1,2})h(\d{2})?/);
    if (!m) continue;
    const from = DAYS.indexOf(m[1]);
    const to = m[2] ? DAYS.indexOf(m[2]) : from;
    if (from < 0 || to < from) continue;
    out.push({ "@type": "OpeningHoursSpecification", dayOfWeek: DAY_NAMES.slice(from, to + 1), opens: pad(m[3], m[4]), closes: pad(m[5], m[6]) });
  }
  return out;
}

/** Entreprise locale + site web : identité, adresse à Antananarivo, zone desservie, horaires. Placé une fois dans la mise en page. */
export function organizationLd(info: SiteInfo) {
  const org = `${SITE_URL}/#organization`;
  const hours = openingHours(info.hours.fr);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": org,
        name: info.name,
        url: SITE_URL,
        logo: absoluteUrl("/logo-prowatt.svg"),
        image: absoluteUrl(DEFAULT_OG_IMAGE.url),
        description: "Installation de panneaux solaires, batteries lithium, solutions anti-délestage, pompage solaire et scooters électriques Ecooter à Madagascar.",
        telephone: info.phone,
        email: info.email,
        address: { "@type": "PostalAddress", streetAddress: info.address.fr, addressLocality: "Antananarivo", addressCountry: "MG" },
        areaServed: { "@type": "Country", name: "Madagascar" },
        currenciesAccepted: "MGA",
        knowsAbout: ["Énergie solaire", "Panneaux solaires", "Batteries lithium", "Anti-délestage", "Pompage solaire", "Chauffe-eau solaire", "Scooters électriques"],
        ...(hours.length ? { openingHoursSpecification: hours } : {}),
      },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: info.name, inLanguage: "fr-MG", publisher: { "@id": org } },
    ],
  };
}

/** Fil d'Ariane : [{ name: "Accueil", path: "/" }, …] dans l'ordre. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

/** Fiche produit avec son prix en ariary (le moins cher des choix possibles). */
export function productLd(p: { name: string; path: string; description?: string; image?: string | null; sku?: string; category?: string; price?: number | null; brand?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url: absoluteUrl(p.path),
    ...(p.description ? { description: p.description } : {}),
    ...(p.image ? { image: absoluteUrl(p.image) } : {}),
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.category ? { category: p.category } : {}),
    brand: { "@type": "Brand", name: p.brand ?? SITE_NAME },
    ...(p.price
      ? { offers: { "@type": "Offer", url: absoluteUrl(p.path), price: p.price, priceCurrency: "MGA", availability: "https://schema.org/InStock", seller: { "@id": `${SITE_URL}/#organization` } } }
      : {}),
  };
}
