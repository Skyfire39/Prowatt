"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { slugs } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { CartIcon, ChevronIcon, CloseIcon, MenuIcon } from "./icons";
import { cart, useCart } from "@/lib/cart";
import { Logo } from "./logo";

type Item = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

export function Navbar({
  lang,
  nav,
  categories,
}: {
  lang: Locale;
  nav: Dictionary["nav"];
  categories: Dictionary["categories"];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  const base = `/${lang}`;
  const items: Item[] = [
    { href: `${base}/avantages`, label: nav.advantages },
    {
      href: `${base}/realisations`,
      label: nav.realisations,
      children: slugs.map((s) => ({
        href: `${base}/realisations/${s}`,
        label: categories[s].name,
      })),
    },
    {
      href: `${base}/devis`,
      label: nav.quotes,
      children: [
        { href: `${base}/devis/particulier`, label: nav.individual },
        { href: `${base}/devis/societe`, label: nav.company },
      ],
    },
    {
      href: `${base}/ecooter`,
      label: nav.ecooter,
      children: [
        { href: `${base}/ecooter`, label: nav.ecooterAll },
        { href: `${base}/ecooter/lithium`, label: nav.lithium },
        { href: `${base}/ecooter/graphene`, label: nav.graphene },
      ],
    },
    { href: `${base}/boutique`, label: nav.shop },
    { href: `${base}/contact`, label: nav.contact },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6"
    >
      <nav className="glass-nav mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 rounded-full px-3 sm:gap-3 sm:px-5">
        <Link href={base} aria-label="Prowatt Madagascar" onClick={() => setOpen(false)}>
          <Logo className="h-7 w-auto sm:h-9" />
        </Link>

        <ul className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {items.map((item) => (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] transition-colors hover:bg-accent-soft hover:text-ink ${
                  isActive(item.href) ? "bg-accent-soft text-ink" : "text-muted"
                }`}
              >
                {item.label}
                {item.children && (
                  <ChevronIcon className="size-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                )}
              </Link>
              {item.children && (
                <div className="invisible absolute left-1/2 top-full z-10 w-72 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="glass-nav rounded-3xl p-2">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className={`block rounded-2xl px-4 py-2.5 text-sm transition-colors hover:bg-accent-soft ${
                            pathname === c.href ? "bg-accent-soft font-medium" : ""
                          }`}
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => cart.open()}
            aria-label={count > 0 ? `${nav.cart} (${count})` : nav.cart}
            title={nav.cart}
            className="glass-chip relative grid size-9 place-items-center rounded-full text-ink transition-opacity hover:opacity-70 sm:size-10"
          >
            <CartIcon className="size-5" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 14 }}
                className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-5 text-on-accent tabular-nums"
              >
                {count > 99 ? "99+" : count}
              </motion.span>
            )}
          </button>
          <button
            type="button"
            className="glass-chip grid size-9 place-items-center rounded-full sm:size-10 lg:hidden"
            aria-label={open ? nav.close : nav.menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="glass-nav mx-auto mt-2 max-h-[75dvh] max-w-6xl overflow-y-auto rounded-3xl p-3 lg:hidden"
          >
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-lg font-medium hover:bg-accent-soft"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <ul className="mb-1 ml-4 border-l border-line pl-2">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-3 py-2 text-[15px] text-muted hover:bg-accent-soft hover:text-ink"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
