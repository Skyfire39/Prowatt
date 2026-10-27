import type { Metadata } from "next";
import { Reddit_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { BrandWatermark } from "@/components/brand-watermark";
import { CartDrawer } from "@/components/cart-drawer";
import { CatalogProvider } from "@/components/catalog-provider";
import { FloatingContact } from "@/components/floating-contact";
import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion";
import { Navbar } from "@/components/navbar";
import { getProducts, getSettings } from "@/lib/content";
import { hasLocale, locales } from "@/lib/i18n";
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
  const { meta } = await getDictionary(lang);
  return {
    title: { default: meta.title, template: "%s — Prowatt Madagascar" },
    description: meta.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, products, settings] = await Promise.all([getDictionary(lang), getProducts(), getSettings()]);

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${reddit.variable} antialiased`}
    >
      <body className="min-h-dvh overflow-x-hidden">
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
            <Footer lang={lang} dict={dict} />
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
