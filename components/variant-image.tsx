"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ProductArt } from "./product-art";

type Ctx = { src: string | null; set: (src: string | null) => void };
const VariantCtx = createContext<Ctx | null>(null);

/**
 * Photo liée au choix en cours (couleur, type…) : le bloc d'achat la pose ici, et la photo principale de la fiche la reprend.
 * Sans photo liée, c'est la photo habituelle du produit.
 */
export function VariantImageProvider({ children }: { children: ReactNode }) {
  const [src, set] = useState<string | null>(null);
  return <VariantCtx.Provider value={{ src, set }}>{children}</VariantCtx.Provider>;
}

export const useVariantImage = () => useContext(VariantCtx)?.src ?? null;

/** Pose la photo du choix courant (et la retire quand le composant disparaît). */
export function useSetVariantImage(src: string | null) {
  const set = useContext(VariantCtx)?.set;
  useEffect(() => {
    set?.(src);
    return () => set?.(null);
  }, [set, src]);
}

/**
 * Visuel principal d'une fiche produit : la photo du choix sélectionné (couleur, type…), sinon la photo choisie dans la
 * galerie, sinon la photo principale du produit, sinon l'illustration. Sous la photo, les vignettes des 4 photos au plus.
 */
export function ProductPhoto({ image, images = [], name }: { image: string | null; images?: string[]; name: string }) {
  const variant = useVariantImage();
  const gallery = [image, ...images].filter((u): u is string => Boolean(u));
  // Le choix d'une vignette n'est valable que tant que le choix de couleur ne change pas : sinon la photo de la couleur reprend la main.
  const [pick, setPick] = useState<{ src: string; variant: string | null } | null>(null);
  const picked = pick && pick.variant === variant && gallery.includes(pick.src) ? pick.src : null;
  const src = picked ?? variant ?? image;
  return (
    <>
      {!src && <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/55" />}
      {src ? (
        <div className="relative mx-auto mt-3 aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-teal/15 bg-white">
          <Image key={src} src={src} alt={name} fill priority sizes="(min-width: 1024px) 560px, 92vw" className="rb-in object-contain p-6" />
        </div>
      ) : (
        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl">
          <ProductArt />
        </div>
      )}
      {gallery.length > 1 && (
        <ul className="relative mx-auto mt-3 flex max-w-xl gap-2.5" aria-label={name}>
          {gallery.map((u, i) => (
            <li key={u} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setPick({ src: u, variant })}
                aria-label={`${name} — ${i + 1}/${gallery.length}`}
                aria-current={u === src ? "true" : undefined}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-xl border bg-white transition ${
                  u === src ? "border-accent ring-2 ring-accent/40" : "border-teal/15 opacity-75 hover:opacity-100"
                }`}
              >
                <Image src={u} alt="" fill sizes="140px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
