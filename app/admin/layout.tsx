import type { Metadata } from "next";
import { Reddit_Sans } from "next/font/google";
import { MotionProvider } from "@/components/motion";
import "../globals.css";

const reddit = Reddit_Sans({ variable: "--font-reddit", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Prowatt Admin" },
  robots: { index: false, follow: false },
};

/** Racine indépendante du site public : pas de navigation du site, ni de panier, ni de bulles de contact. */
export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${reddit.variable} antialiased`}>
      <body className="min-h-dvh overflow-x-hidden">
        <div className="ambient" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
