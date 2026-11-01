import Link from "next/link";
import fr from "@/app/[lang]/dictionaries/fr.json";
import { UnpluggedScene } from "./unplugged-scene";
import { ButtonLink } from "./ui";

const d = fr.notFound;
const links = [
  { href: "/boutique", label: fr.nav.shop },
  { href: "/realisations", label: fr.nav.realisations },
  { href: "/devis", label: fr.nav.quotes },
];

/**
 * Contenu de la page 404 : titre, scène animée de coupure de courant et chemins de sortie. Partagé par la page
 * introuvable du site (avec le menu) et par la 404 globale (adresses qui ne correspondent à aucune page).
 */
export function NotFoundView() {
  return (
    <section className="px-4 pb-20 pt-32 sm:px-6 sm:pt-40">
      <div className="mx-auto max-w-4xl text-center">
        <p className="eyebrow ch-fade" style={{ "--d": "0s" } as React.CSSProperties}>
          {d.eyebrow}
        </p>
        <h1 className="mt-3 text-balance text-5xl leading-[1.04] tracking-[-0.045em] sm:text-7xl">{d.title}</h1>
        <p className="ch-fade mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted" style={{ "--d": "0.25s" } as React.CSSProperties}>
          {d.text}
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-6xl">
        <UnpluggedScene label={d.scene} />
        <p className="mt-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-teal/70">{d.tagline}</p>
      </div>

      <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-6 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="primary" arrow>
            {d.home}
          </ButtonLink>
          <ButtonLink href="/contact" variant="glass">
            {d.contact}
          </ButtonLink>
        </div>
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted">
          {d.links} :
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3 py-1 font-medium text-ink underline-offset-4 transition-colors hover:bg-accent-soft hover:underline">
              {l.label}
            </Link>
          ))}
        </p>
      </div>
    </section>
  );
}
