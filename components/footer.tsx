import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Logo } from "./logo";

async function getYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer({
  lang,
  dict,
  nav,
}: {
  lang: Locale;
  dict: Dictionary["footer"];
  nav: Dictionary["nav"];
}) {
  const year = await getYear();
  const links = [
    { href: `/${lang}#solaire`, label: nav.solar },
    { href: `/${lang}#moto`, label: nav.moto },
    { href: `/${lang}#pourquoi`, label: nav.why },
    { href: `/${lang}#contact`, label: nav.contact },
  ];

  return (
    <footer className="px-4 pb-8 sm:px-6">
      <div className="glass mx-auto max-w-6xl rounded-[2.5rem] p-8 sm:p-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{dict.tagline}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{dict.explore}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">{dict.contact}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-ink">
                  {site.email}
                </a>
              </li>
              <li>{site.phone}</li>
              <li>{site.location}</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-xs text-muted">
          © {year} {site.name}. {dict.rights}
        </div>
      </div>
    </footer>
  );
}
