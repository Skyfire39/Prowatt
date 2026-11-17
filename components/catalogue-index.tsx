import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowIcon, BagIcon, BatteryIcon, BoltIcon, ChevronIcon, DropIcon, GaugeIcon, GridIcon, LampIcon, PanelIcon, ScooterIcon, SunIcon, WrenchIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type CatalogueGroup = { id: string; name: string; items: { href: string; name: string }[] };

/** Pictogramme de la catégorie, déduit de son identifiant. */
const ICONS: [RegExp, Icon][] = [
  [/moto|scooter/, ScooterIcon],
  [/batterie|powerbank/, BatteryIcon],
  [/panneau/, PanelIcon],
  [/structure|alu/, GridIcon],
  [/luminaire|lampe|eclairage/, LampIcon],
  [/pompe|eau/, DropIcon],
  [/chauffe|kit/, SunIcon],
  [/regulateur|stabilisateur|convertisseur|onduleur/, GaugeIcon],
  [/disjoncteur|cable|electri/, BoltIcon],
  [/accessoire/, WrenchIcon],
];
const iconFor = (id: string): Icon => ICONS.find(([re]) => re.test(id))?.[1] ?? BagIcon;

/** Nombre de produits visibles avant « Voir les N autres » : les cartes gardent la même hauteur. */
const VISIBLE = 5;

function Row({ href, name }: { href: string; name: string }) {
  return (
    <li>
      <Link href={href} className="group/row flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-accent-soft/70 hover:text-ink">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-lime ring-2 ring-lime/30 transition-transform group-hover/row:scale-150" />
        <span className="min-w-0 flex-1 leading-snug">{name}</span>
        <ArrowIcon aria-hidden className="size-4 shrink-0 -translate-x-1 text-accent opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100" />
      </Link>
    </li>
  );
}

/**
 * Index de tout le catalogue, en liens : le filtre de la boutique ne montre que 12 produits à la fois, cet index
 * permet aux robots (et à ceux qui n'utilisent pas les filtres) de trouver chaque fiche. Les produits au-delà des
 * cinq premiers sont dans un <details> : repliés à l'écran, mais présents dans la page pour les moteurs de recherche.
 */
export function CatalogueIndex({
  groups,
  labels,
}: {
  groups: CatalogueGroup[];
  labels: { catalogue: string; catalogueHint: string; catalogueProducts: string; catalogueCategories: string; catalogueMore: string; catalogueMoreOne: string; catalogueLess: string };
}) {
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <nav aria-label={labels.catalogue} className="relative mt-24">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h2 className="text-3xl tracking-tight sm:text-4xl">{labels.catalogue}</h2>
          <p className="mt-1.5 text-muted">{labels.catalogueHint}</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="glass-chip rounded-full px-4 py-1.5">
            <strong className="tabular-nums">{total}</strong> {labels.catalogueProducts}
          </span>
          <span className="glass-chip rounded-full px-4 py-1.5">
            <strong className="tabular-nums">{groups.length}</strong> {labels.catalogueCategories}
          </span>
        </div>
      </div>

      <div className="mt-10 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => {
          const Icon = iconFor(g.id);
          const head = g.items.slice(0, VISIBLE);
          const rest = g.items.slice(VISIBLE);
          return (
            <Reveal key={g.id} delay={(i % 3) * 0.08} y={24}>
              <section className="glass group/card relative overflow-hidden rounded-3xl p-3 transition-shadow hover:shadow-xl">
                {/* Halo lime qui suit la carte au survol */}
                <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-lime/40 opacity-0 blur-3xl transition-opacity duration-500 group-hover/card:opacity-100" />

                <header className="relative flex items-center gap-3.5 px-3 pb-3 pt-2">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-lime shadow-lg shadow-accent/20 transition-transform duration-500 group-hover/card:-rotate-6 group-hover/card:scale-105">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="min-w-0 flex-1 text-lg font-semibold leading-tight tracking-tight">{g.name}</h3>
                  <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold tabular-nums text-accent">{g.items.length}</span>
                </header>

                <div className="relative mx-3 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />

                <ul className="relative mt-2 grid gap-0.5">
                  {head.map((it) => (
                    <Row key={it.href} {...it} />
                  ))}
                </ul>

                {rest.length > 0 && (
                  <details className="cat-more group/more relative">
                    <summary className="mx-3 mb-1 mt-2 flex cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-accent/15 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-lime [&::-webkit-details-marker]:hidden">
                      <span className="group-open/more:hidden">{rest.length === 1 ? labels.catalogueMoreOne : labels.catalogueMore.replace("{n}", String(rest.length))}</span>
                      <span className="hidden group-open/more:inline">{labels.catalogueLess}</span>
                      <ChevronIcon aria-hidden className="size-4 transition-transform duration-300 group-open/more:rotate-180" />
                    </summary>
                    <ul className="grid gap-0.5 pb-1 pt-1">
                      {rest.map((it) => (
                        <Row key={it.href} {...it} />
                      ))}
                    </ul>
                  </details>
                )}
              </section>
            </Reveal>
          );
        })}
      </div>
    </nav>
  );
}
