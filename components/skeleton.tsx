import type { CSSProperties, ReactNode } from "react";

/** Bloc gris à reflet animé : la place du contenu qui arrive, comme les squelettes de Facebook. */
export function Sk({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`skeleton block ${className}`} style={style} />;
}

/** Enveloppe d'un écran de chargement : annoncé une seule fois aux lecteurs d'écran. */
function Frame({ children, label = "Chargement…" }: { children: ReactNode; label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="min-h-dvh">
      {children}
    </div>
  );
}

const lines = (n: number, last = "w-2/3") =>
  Array.from({ length: n }, (_, i) => <Sk key={i} className={`h-4 rounded-full ${i === n - 1 ? last : "w-full"}`} />);

/** Titre de page : pastille, deux lignes de titre et une phrase. */
function HeroSk() {
  return (
    <div className="mx-auto grid max-w-4xl justify-items-center gap-4 px-4 pt-32 text-center sm:px-6 sm:pt-40">
      <Sk className="h-7 w-32 rounded-full" />
      <Sk className="h-14 w-4/5 rounded-2xl sm:h-20" />
      <Sk className="h-14 w-3/5 rounded-2xl sm:h-20" />
      <div className="mt-2 grid w-full max-w-xl gap-2.5">{lines(2)}</div>
    </div>
  );
}

/** Carte : photo, titre, texte et bouton. */
function CardSk() {
  return (
    <div className="glass overflow-hidden rounded-3xl p-5">
      <Sk className="aspect-[4/3] w-full rounded-2xl" />
      <Sk className="mt-5 h-6 w-3/4 rounded-full" />
      <div className="mt-3 grid gap-2">{lines(2)}</div>
      <Sk className="mt-5 h-10 w-32 rounded-full" />
    </div>
  );
}

/** Page avec un titre puis une grille de cartes (réalisations, motos, boutique…). */
export function GridSkeleton({ cards = 6, label }: { cards?: number; label?: string }) {
  return (
    <Frame label={label}>
      <HeroSk />
      <div className="mx-auto mt-14 grid max-w-6xl gap-6 px-4 pb-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {Array.from({ length: cards }, (_, i) => (
          <CardSk key={i} />
        ))}
      </div>
    </Frame>
  );
}

/** Page avec un titre, une grande bannière puis des cartes (catégories de réalisations). */
export function BannerSkeleton({ label }: { label?: string }) {
  return (
    <Frame label={label}>
      <HeroSk />
      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <Sk className="h-64 w-full rounded-3xl sm:h-[28rem]" />
      </div>
      <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 pb-24 sm:grid-cols-2 sm:px-6">
        {Array.from({ length: 2 }, (_, i) => (
          <CardSk key={i} />
        ))}
      </div>
    </Frame>
  );
}

/** Fiche produit : fil d'Ariane, grande photo avec vignettes, puis nom, prix et bloc d'achat. */
export function ProductSkeleton({ label }: { label?: string }) {
  return (
    <Frame label={label}>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <Sk className="mb-8 h-4 w-64 rounded-full" />
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="glass rounded-3xl p-6 sm:p-10">
              <Sk className="h-7 w-28 rounded-full" />
              <Sk className="mx-auto mt-5 aspect-[4/3] w-full max-w-xl rounded-2xl" />
              <div className="mx-auto mt-3 flex max-w-xl gap-2.5">
                {Array.from({ length: 4 }, (_, i) => (
                  <Sk key={i} className="aspect-[4/3] flex-1 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
          <div className="grid content-start gap-5 lg:col-span-5">
            <Sk className="h-5 w-28 rounded-full" />
            <Sk className="h-12 w-full rounded-2xl" />
            <Sk className="h-12 w-2/3 rounded-2xl" />
            <Sk className="h-14 w-56 rounded-2xl" />
            <div className="glass mt-3 grid gap-4 rounded-3xl p-6">
              <Sk className="h-5 w-24 rounded-full" />
              <div className="flex gap-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Sk key={i} className="size-10 rounded-full" />
                ))}
              </div>
              <Sk className="h-12 w-full rounded-full" />
            </div>
            <div className="grid gap-2.5">{lines(3)}</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** Page d'accueil ou page générique : grande zone de titre puis bandeaux. */
export function PageSkeleton({ label }: { label?: string }) {
  return (
    <Frame label={label}>
      <HeroSk />
      <div className="mx-auto mt-14 max-w-6xl px-4 pb-24 sm:px-6">
        <Sk className="h-72 w-full rounded-3xl sm:h-[26rem]" />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="glass grid gap-3 rounded-3xl p-6">
              <Sk className="size-12 rounded-full" />
              <Sk className="h-6 w-3/4 rounded-full" />
              {lines(2)}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}
