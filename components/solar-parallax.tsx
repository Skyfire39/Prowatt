"use client";

import { useEffect, useRef } from "react";
import "@/parallax-solar/parallax-solar.css";
import scene from "@/parallax-solar/scene.svg.js";

/**
 * Fond animé de l'accueil : décor SVG « parallax solaire » (dossier /parallax-solar).
 * Le soleil, les nuages, les toits, la maison à panneaux et la moto qui charge se révèlent
 * au fil du scroll de la page. Un voile garde le contenu lisible, en clair comme en sombre.
 */
export function SolarParallax() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance: { destroy: () => void } | undefined;
    let cancelled = false;
    import("@/parallax-solar/parallax-solar.js").then((m) => {
      if (!cancelled && ref.current) instance = m.initParallaxSolar(ref.current);
    });
    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, []);

  return (
    <>
      <div
        ref={ref}
        className="ps"
        style={{ ["--ps-z" as string]: -1 }}
        data-parallax-solar=""
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: scene }}
      />
      {/* Voile de lisibilité par-dessus l'illustration */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[1] bg-canvas/30"
      />
    </>
  );
}
