import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, hasLocale } from "@/lib/i18n";

// Le site n'existe qu'en français : toute adresse sans préfixe, ou avec un ancien préfixe
// (/en/…), est redirigée vers la même page sous /fr.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first = "", ...rest] = pathname.split("/");
  if (hasLocale(first)) return;

  const tail = /^[a-z]{2}$/.test(first) ? rest.join("/") : [first, ...rest].filter(Boolean).join("/");
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${tail ? `/${tail}` : ""}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|admin|favicon.ico|.*\\..*).*)"],
};
