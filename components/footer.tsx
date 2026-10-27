import { cacheLife } from "next/cache";
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { slugs } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { getSettings } from "@/lib/content";
import { toSiteInfo } from "@/lib/site-info";
import { ArrowUpIcon, ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "./icons";
import { Logo } from "./logo";
import { Newsletter } from "./newsletter";

async function getYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const linkClass = "text-[15px] text-white/70 transition-colors hover:text-white";
const headClass = "text-sm font-semibold text-white";

export async function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = await getYear();
  const site = toSiteInfo(await getSettings());
  const base = "";
  const { nav, footer, categories } = dict;
  const explore = [
    { href: `${base}/avantages`, label: nav.advantages },
    { href: `${base}/realisations`, label: nav.realisations },
    { href: `${base}/devis`, label: nav.quotes },
    { href: `${base}/ecooter`, label: nav.ecooter },
    { href: `${base}/boutique`, label: nav.shop },
    { href: `${base}/contact`, label: nav.contact },
  ];

  return (
    <>
      <Newsletter dict={dict.newsletter} />

      <footer className="mt-16 px-3 pb-3 sm:mt-24 sm:px-6 sm:pb-6">
        <div className="glass-teal mx-auto max-w-6xl rounded-3xl px-5 pb-8 pt-14 sm:px-12 sm:pt-16">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Link href={base || "/"} aria-label={site.name}>
                <Logo color="text-lime" className="h-14 w-auto" />
              </Link>
              <p className="mt-8 max-w-sm text-balance text-3xl font-medium leading-tight tracking-[-0.03em]">
                {footer.tagline}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={site.phoneHref}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-medium text-teal transition-opacity hover:opacity-85"
                >
                  <PhoneIcon className="size-4" />
                  {site.phone}
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-5 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  <MailIcon className="size-4" />
                  {footer.write}
                </a>
              </div>
            </div>

            <nav aria-label={footer.explore} className="lg:col-span-2">
              <h3 className={headClass}>{footer.explore}</h3>
              <ul className="mt-5 space-y-3">
                {explore.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label={footer.solutions} className="lg:col-span-2">
              <h3 className={headClass}>{footer.solutions}</h3>
              <ul className="mt-5 space-y-3">
                {slugs.map((s) => (
                  <li key={s}>
                    <Link href={`${base}/realisations/${s}`} className={linkClass}>
                      {categories[s].name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-3">
              <h3 className={headClass}>{footer.visit}</h3>
              <ul className="mt-5 space-y-4 text-[15px] text-white/70">
                <li className="flex gap-3">
                  <MapPinIcon className="mt-0.5 size-5 shrink-0 text-lime" />
                  <span>{site.address[lang]}</span>
                </li>
                <li className="flex gap-3">
                  <ClockIcon className="mt-0.5 size-5 shrink-0 text-lime" />
                  <span className="space-y-1">
                    {site.hours[lang].map((h) => (
                      <span key={h} className="block">
                        {h}
                      </span>
                    ))}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/55">
            <p>
              © {year} {site.name}. {footer.rights}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowUpIcon className="size-4" />
              {footer.topLabel}
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
