import type { Metadata, Viewport } from "next";
import { Reddit_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrandWatermark } from "@/components/brand-watermark";
import { JsonLd } from "@/components/json-ld";
import { CartDrawer } from "@/components/cart-drawer";
import { CatalogProvider } from "@/components/catalog-provider";
import { FloatingContact } from "@/components/floating-contact";
import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion";
import { Navbar } from "@/components/navbar";
import { getSellable, getSettings } from "@/lib/content";
import { hasLocale, locales } from "@/lib/i18n";
import { organizationLd, SITE_URL } from "@/lib/seo";
import { toSiteInfo } from "@/lib/site-info";
import { getDictionary } from "./dictionaries";
import "../globals.css";

// Même police que prowattmadagascar.com (titres, menu et texte).
const reddit = Reddit_Sans({
  variable: "--font-reddit",
  subsets: ["latin"],
  display: "swap",
});


export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { seo } = await getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.home.title, template: "%s — Prowatt Madagascar" },
    description: seo.home.description,
    applicationName: "Prowatt Madagascar",
    openGraph: { type: "website", locale: "fr_MG", siteName: "Prowatt Madagascar" },
    formatDetection: { telephone: true, email: true, address: true },
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  };
}

export const viewport: Viewport = { themeColor: "#175c55" };

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, products, settings] = await Promise.all([getDictionary(lang), getSellable(), getSettings()]);

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${reddit.variable} antialiased`}
    >
      <body className="min-h-dvh overflow-x-hidden">
        <JsonLd data={organizationLd(toSiteInfo(settings))} />
        <div className="ambient" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <BrandWatermark lang={lang} />
        <MotionProvider>
          <CatalogProvider products={products.map(({ description: _description, ...p }) => p)} site={toSiteInfo(settings)}>
            <Navbar nav={dict.nav} categories={dict.categories} />
            <main>{children}</main>
            <Suspense fallback={<div className="min-h-96" aria-hidden="true" />}>
              <Footer lang={lang} dict={dict} />
            </Suspense>
            <FloatingContact dict={dict.floating} />
            <CartDrawer
              lang={lang}
              dict={dict.cart}
              currency={dict.shop.currency}
              checkoutHref={`/commande`}
              shopHref={`/boutique`}
            />
          </CatalogProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
