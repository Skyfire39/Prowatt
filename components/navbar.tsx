"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { slugs } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { ChevronIcon, CloseIcon, MenuIcon } from "./icons";
import { LangSwitch } from "./lang-switch";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 16));

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
    { href: `${base}/ecooter`, label: nav.ecooter },
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
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2 transition-all duration-500 sm:px-5 ${
          scrolled || open ? "glass-strong" : "border border-transparent"
        }`}
      >
        <Link href={base} aria-label="Prowatt Madagascar" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {items.map((item) => (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-colors hover:bg-accent-soft hover:text-ink ${
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
                  <ul className="glass-strong rounded-3xl p-2">
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

        <div className="flex items-center gap-2">
          <LangSwitch lang={lang} label={nav.language} />
          <ThemeToggle label={nav.theme} />
          <button
            type="button"
            className="glass grid size-10 place-items-center rounded-full lg:hidden"
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
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="glass-strong mx-auto mt-2 max-h-[75dvh] max-w-6xl overflow-y-auto rounded-3xl p-3 lg:hidden"
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
