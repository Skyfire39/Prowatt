import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { slugs } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Logo } from "./logo";

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = await getYear();
  const base = `/${lang}`;
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
    <footer className="px-4 pb-8 sm:px-6">
      <div className="glass mx-auto max-w-6xl rounded-[2.5rem] p-8 sm:p-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{footer.tagline}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{footer.explore}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{footer.solutions}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {slugs.map((s) => (
                <li key={s}>
                  <Link href={`${base}/realisations/${s}`} className="transition-colors hover:text-ink">
                    {categories[s].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{footer.contact}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>
                <a href={site.phoneHref} className="transition-colors hover:text-ink">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="break-all transition-colors hover:text-ink">
                  {site.email}
                </a>
              </li>
              <li>{site.address[lang]}</li>
              {site.hours[lang].map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-xs text-muted">
          © {year} {site.name}. {footer.rights}
        </div>
      </div>
    </footer>
  );
}
