"use client";

import NextImage, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * Image qui se charge à la manière de Facebook : un rectangle gris à reflet animé occupe la place, puis la photo
 * apparaît en fondu dès qu'elle est arrivée. Même usage que `next/image`.
 * Réservé aux images « fill » du bas de page : une image prioritaire (celle qui s'affiche en premier) ou à taille fixe
 * est rendue telle quelle, pour ne pas retarder l'affichage.
 */
export default function Image(props: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  if (!props.fill || props.priority) return <NextImage {...props} />;
  const { className = "", onLoad, ...rest } = props;
  return (
    <>
      {!loaded && <span aria-hidden="true" className="skeleton pointer-events-none absolute inset-0" />}
      <NextImage
        {...rest}
        ref={(el) => {
          // L'image peut être arrivée avant l'hydratation : onLoad ne se déclenche alors jamais.
          if (el?.complete && el.naturalWidth > 0) setLoaded(true);
        }}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={`sk-img ${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
