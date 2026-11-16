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
  "categorie-produit": "/boutique",
  "product-category": "/boutique",
  "etiquette-produit": "/boutique",
  "product-tag": "/boutique",
  shop: "/boutique",
  magasin: "/boutique",
  panier: "/boutique",
  cart: "/boutique",
  commander: "/boutique",
  checkout: "/boutique",
  paiement: "/boutique",
  "mon-compte": "/",
  "my-account": "/",
  account: "/",
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
  category: "/",
  tag: "/",
  author: "/",
  blog: "/",
  actualites: "/",
  page: "/",
};

/** Fichiers et dossiers WordPress qui n'existent plus : « 410 Gone » pour que Google les retire plus vite qu'avec un 404. */
const GONE = ["wp-content", "wp-includes", "wp-admin", "wp-json", "wp-login.php", "wp-cron.php", "xmlrpc.php", "feed", "comments"];

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

  if (GONE.includes(lower)) return new NextResponse("Gone", { status: 410, headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" } });

  if (first === "fr" || first === "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/${rest.join("/")}`.replace(/\/+$/, "") || "/";
    return NextResponse.redirect(url, 308);
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
