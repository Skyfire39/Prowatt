"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";
import { useVariantImage } from "./variant-image";

/**
 * Visuel principal d'un modèle : la moto en grand (détourée sur un disque, ou photo dans un cadre), avec un anneau qui tourne
 * lentement, un flottement doux et une légère inclinaison vers le pointeur.
 */
export function ModelVisual({ photo: base, name, cutout: baseCutout = true }: { photo: string; name: string; /** Photo détourée sur un disque (sinon, photo avec décor dans un cadre). */ cutout?: boolean }) {
  // Un choix lié à une photo (couleur, batterie…) remplace la photo principale, affichée dans un cadre.
  const variant = useVariantImage();
  const photo = variant ?? base;
  const cutout = variant ? false : baseCutout;
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 110, damping: 18 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 110, damping: 18 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="glass relative isolate grid aspect-square w-full place-items-center overflow-hidden rounded-[2rem] p-4 [perspective:1000px] sm:p-8"
    >
      {cutout && <div aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 size-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/60" />}
      {cutout && <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 -z-10 size-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-teal/30"
      />}
      <motion.div style={{ rotateX, rotateY }} className="w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={reduce ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { duration: 0.7 },
            scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {cutout ? (
            <Image
              src={photo}
              unoptimized={photo.startsWith("/api/")}
              alt={name}
              width={1100}
              height={1100}
              priority
              sizes="(min-width: 1024px) 560px, 92vw"
              draggable={false}
              className="h-auto w-full select-none drop-shadow-[0_30px_28px_rgb(10_35_32/0.3)]"
            />
          ) : (
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
              <Image
                src={photo}
                unoptimized={photo.startsWith("/api/")}
                alt={name}
                fill
                priority
                sizes="(min-width: 1024px) 560px, 92vw"
                draggable={false}
                className="select-none object-cover"
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
