"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LOCALE_COOKIE, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/[^/]+/, "");

  return (
    <div
      role="group"
      aria-label={label}
      className="glass-chip relative flex h-9 items-center sm:h-10 rounded-full p-1 text-xs font-semibold"
    >
      {locales.map((code) => {
        const active = code === lang;
        return (
          <Link
            key={code}
            href={`/${code}${rest}`}
            hrefLang={code}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
            }}
            className={`relative z-10 grid h-7 w-9 place-items-center sm:h-8 sm:w-10 rounded-full uppercase transition-colors ${
              active ? "text-on-accent" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 -z-10 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {code}
          </Link>
        );
      })}
    </div>
  );
}
