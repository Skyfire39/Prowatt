import type { Metadata } from "next";
import Link from "next/link";
import { Reddit_Sans } from "next/font/google";
import { Logo } from "@/components/logo";
import { NotFoundView } from "@/components/not-found-view";
import "./globals.css";

const reddit = Reddit_Sans({ variable: "--font-reddit", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = { title: "Page introuvable — Prowatt Madagascar" };

/** 404 des adresses qui ne correspondent à aucune page : même scène que le site, avec le logo à la place du menu. */
export default function GlobalNotFound() {
  return (
    <html lang="fr" className={`${reddit.variable} antialiased`}>
      <body className="min-h-dvh overflow-x-hidden">
        <div className="ambient" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <header className="absolute inset-x-0 top-0 z-10 flex justify-center px-4 pt-8">
          <Link href="/" aria-label="Prowatt Madagascar — accueil">
            <Logo variant="wordmark" className="h-10 w-auto text-teal" />
          </Link>
        </header>
        <main>
          <NotFoundView />
        </main>
      </body>
    </html>
  );
}
