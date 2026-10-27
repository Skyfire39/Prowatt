import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "./motion";

/**
 * Bloc image + texte façon fiche produit : une scène teal avec la moto recadrée sur un détail, et une
 * carte de verre qui la chevauche. `side` place l'image à gauche ou à droite, en alternance.
 */
export function ModelFeature({
  photo,
  detail,
  name,
  side,
  zoom = 1,
  origin = "50% 50%",
  title,
  bullets,
  children,
}: {
  photo: string;
  /** Photo de détail propre au bloc : elle remplit le cadre au lieu de la moto détourée sur fond teal. */
  detail?: string | null;
  name: string;
  side: "left" | "right";
  zoom?: number;
  /** Point du visuel sur lequel on zoome (transform-origin CSS). */
  origin?: string;
  title: string;
  bullets: ReactNode[];
  children?: ReactNode;
}) {
  const imageLeft = side === "left";
  return (
    <div className="relative">
      <Reveal y={36} className={`w-full lg:w-[62%] ${imageLeft ? "" : "lg:ml-auto"}`}>
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-3xl"
          style={{ background: "linear-gradient(135deg, #175c55 0%, #2f7d6e 52%, #c8e0a2 130%)" }}
        >
          {detail ? (
            <Image
              src={detail}
              unoptimized
              alt={name}
              width={1400}
              height={1050}
              sizes="(min-width: 1024px) 700px, 92vw"
              draggable={false}
              className="absolute inset-0 size-full select-none object-cover"
              style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
            />
          ) : (
            <>
              <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/25" />
              <Image
                src={photo}
                unoptimized={photo.startsWith("/api/")}
                alt={name}
                width={1100}
                height={1100}
                sizes="(min-width: 1024px) 700px, 92vw"
                draggable={false}
                className="absolute inset-0 size-full select-none object-contain drop-shadow-[0_24px_24px_rgb(5_25_22/0.4)]"
                style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
              />
            </>
          )}
        </div>
      </Reveal>

      <Reveal
        y={36}
        delay={0.12}
        className={`relative z-10 -mt-12 px-3 sm:px-8 lg:absolute lg:bottom-[-2.5rem] lg:mt-0 lg:w-[46%] lg:px-0 ${
          imageLeft ? "lg:right-0" : "lg:left-0"
        }`}
      >
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="text-3xl leading-tight tracking-tight">{title}</h2>
          <ul className="mt-5 space-y-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-muted">
                <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-accent" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
        </div>
      </Reveal>
    </div>
  );
}
