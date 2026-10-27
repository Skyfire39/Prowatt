import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n";

/**
 * Le site n'existe qu'en français et ses adresses n'ont pas de préfixe de langue (/boutique, pas /fr/boutique).
 * En interne les pages restent rangées sous /[lang] : une adresse sans préfixe est réécrite vers /fr/…
 * (le visiteur garde l'adresse courte), et les anciennes adresses /fr/… et /en/… sont redirigées vers la version courte
 * pour que les liens déjà partagés continuent de fonctionner.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first = "", ...rest] = pathname.split("/");

  if (first === "fr" || first === "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/${rest.join("/")}`.replace(/\/+$/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|admin|favicon.ico|.*\\..*).*)"],
};
