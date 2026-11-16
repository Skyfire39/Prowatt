import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import legacy from "@/lib/legacy-ids.json";
import { defaultLocale } from "@/lib/i18n";

const productIds = new Set<string>(legacy.products);
const motoIds = [...legacy.motos].sort((a, b) => b.length - a.length);

/** Paramètres d'adresse de l'ancien site WordPress / WooCommerce : sans équivalent, ils ne doivent plus créer de pages. */
const WP_PARAMS = ["s", "p", "page_id", "cat", "tag", "author", "paged", "post_type", "product", "product_cat", "product_tag", "add-to-cart", "orderby", "min_price", "max_price", "wc-ajax", "preview", "replytocom", "elementor-preview"];

/** Rubriques de l'ancien site → page équivalente du nouveau site. */
const OLD_SECTIONS: Record<string, string> = {
  // Catalogue : plus de pages par étiquette, marque ou catégorie (le filtre est dans /boutique)
  "categorie-produit": "/boutique",
  "product-category": "/boutique",
  "etiquette-produit": "/boutique",
  "product-tag": "/boutique",
  marque: "/boutique",
  shop: "/boutique",
  magasin: "/boutique",
  search: "/boutique",
  panier: "/boutique",
  cart: "/boutique",
  commander: "/boutique",
  checkout: "/boutique",
  paiement: "/boutique",
  ...Object.fromEntries(
    [
      "accessoire",
      "batterie-gel",
      "batterie-lithium",
      "cables-electriques",
      "chauffe-eau-solaire",
      "convertisseur",
      "disjoncteur",
      "luminaire-solaire",
      "mini-kit-solaire",
      "motos-electriques",
      "panneaux-solaires",
      "pompe-solaire",
      "powerbank",
      "regulateur",
      "solis",
      "stabilisateur",
      "structure-en-aluminium",
    ].map((c) => [c, "/boutique"]),
  ),
  // Pages de l'ancien site vitrine
  "mon-compte": "/",
  "my-account": "/",
  account: "/",
  "accueil-2": "/",
  "a-propos": "/avantages",
  "a-propos-de-nous": "/avantages",
  about: "/avantages",
  "about-us": "/avantages",
  "qui-sommes-nous": "/avantages",
  "contactez-nous": "/contact",
  "nous-contacter": "/contact",
  "contact-us": "/contact",
  "demande-de-devis": "/devis",
  "demander-un-devis": "/devis",
  quote: "/devis",
  particulier: "/devis/particulier",
  societe: "/devis/societe",
  realisation: "/realisations",
  "100-autonome": "/realisations/100-autonome",
  hybride: "/realisations/hybride",
  ongrid: "/realisations/ongrid",
  "anti-delestage": "/realisations/anti-delestage",
  "acces-a-leau": "/realisations/acces-a-eau",
  service: "/installation-solaire-madagascar",
  services: "/installation-solaire-madagascar",
  "nos-services": "/installation-solaire-madagascar",
  blog: "/guides",
  actualites: "/guides",
  page: "/",
};

/** Fichiers et dossiers WordPress qui n'existent plus : « 410 Gone » pour que Google les retire plus vite qu'avec un 404. */
const GONE = ["wp-content", "wp-includes", "wp-admin", "wp-json", "wp-login.php", "wp-cron.php", "xmlrpc.php", "feed", "comments"];

/** Contenu de démonstration ou piraté de l'ancien WordPress (blog d'exemple, pages « SITUS … » de casinos en ligne indonésiens) : 410 Gone. */
const DEMO_SECTIONS = ["category", "tag", "author", "designs", "stores", "ccpa", "terms", "green-interior-design-inspiration", "path-to-100-coalition-secures-50-renewable"];
const SPAM = /situs|togel|gacor|maxwin|link alternatif|slot\d{2,}|slot-?machine|casino|poker|jackpot|gambl/i;
const gone = () => new NextResponse("Gone", { status: 410, headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" } });

const permanent = (url: URL) => NextResponse.redirect(url, 301);

/**
 * Le site n'existe qu'en français et ses adresses n'ont pas de préfixe de langue (/boutique, pas /fr/boutique).
 * En interne les pages restent rangées sous /[lang] : une adresse sans préfixe est réécrite vers /fr/…
 * (le visiteur garde l'adresse courte), et les anciennes adresses /fr/… et /en/… sont redirigées vers la version courte
 * pour que les liens déjà partagés continuent de fonctionner.
 *
 * Elle redirige aussi, en 301, les anciennes adresses du site WordPress / WooCommerce (/produit/…, /categorie-produit/…,
 * /panier…, paramètres ?s=, ?p=…) vers leur équivalent actuel : c'est ce qui évite des centaines de « 404 » dans Google.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const [, first = "", ...rest] = pathname.split("/");
  const lower = first.toLowerCase();

  let readable = pathname;
  try {
    readable = decodeURIComponent(pathname);
  } catch {
    // adresse mal encodée : on garde le texte tel quel
  }

  // Fichiers WordPress, flux RSS (/…/feed), archives par année (/2021/06), blog d'exemple et pages de spam : « 410 Gone ».
  if (GONE.includes(lower) || DEMO_SECTIONS.includes(lower) || /^(19|20)\d{2}$/.test(first) || /^[^a-z0-9]/i.test(first) && first !== "" || rest.at(-1)?.toLowerCase() === "feed" || SPAM.test(readable)) return gone();

  if (first === "fr" || first === "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/${rest.join("/")}`.replace(/\/+$/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  // Pagination de l'ancienne boutique (/boutique/page/5/) : le nouveau catalogue n'a qu'une page.
  if (lower === "boutique" && rest[0] === "page") {
    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = "/boutique";
    return permanent(url);
  }

  // Fiche produit de l'ancien site : /produit/<nom> ou /product/<nom> → la fiche du même nom, la moto Ecooter, sinon la boutique.
  if ((lower === "produit" || lower === "product") && rest[0]) {
    let slug = rest[0].toLowerCase().slice(0, 80);
    try {
      slug = decodeURIComponent(rest[0]).toLowerCase().slice(0, 80);
    } catch {
      // adresse mal encodée : on garde le texte tel quel
    }
    const url = request.nextUrl.clone();
    url.search = "";
    const moto = motoIds.find((id) => slug === id || slug.includes(id));
    url.pathname = productIds.has(slug) ? `/boutique/${slug}` : moto ? `/ecooter/modeles/${moto}` : "/boutique";
    return permanent(url);
  }
  if (lower in OLD_SECTIONS) {
    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = OLD_SECTIONS[lower];
    return permanent(url);
  }

  // Adresses avec les paramètres de l'ancien WordPress (/?s=…, /?p=12, /boutique?add-to-cart=3…) : la même page, sans eux.
  if (WP_PARAMS.some((p) => searchParams.has(p))) {
    const url = request.nextUrl.clone();
    url.search = "";
    if (searchParams.has("add-to-cart") || searchParams.has("product_cat") || searchParams.get("post_type") === "product") url.pathname = "/boutique";
    return permanent(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|admin|favicon.ico|.*\\..*).*)", "/wp-content/:path*", "/wp-includes/:path*", "/wp-admin/:path*", "/wp-json/:path*", "/wp-login.php", "/wp-cron.php", "/xmlrpc.php"],
};
