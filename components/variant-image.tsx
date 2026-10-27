"use client";

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

/** Visuel principal d'une fiche produit : la photo du choix sélectionné, sinon celle du produit, sinon l'illustration. */
export function ProductPhoto({ image, name }: { image: string | null; name: string }) {
  const src = useVariantImage() ?? image;
  return (
    <>
      {!src && <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/55" />}
      {src ? (
        <div className="relative mx-auto mt-3 aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-teal/15 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={name} className="absolute inset-0 size-full object-contain p-6" />
        </div>
      ) : (
        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl">
          <ProductArt />
        </div>
      )}
    </>
  );
}
