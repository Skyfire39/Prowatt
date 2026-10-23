import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion";
import { Navbar } from "@/components/navbar";
import { themeInitScript } from "@/components/theme-toggle";
import { hasLocale, locales } from "@/lib/i18n";
import { getDictionary } from "./dictionaries";
import "../globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
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
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${hanken.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh overflow-x-hidden">
        <MotionProvider>
          <Navbar lang={lang} nav={dict.nav} categories={dict.categories} />
          <main>{children}</main>
          <Footer lang={lang} dict={dict} />
        </MotionProvider>
      </body>
    </html>
  );
}
