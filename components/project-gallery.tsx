"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** Photos d'un chantier : une grande image, et des vignettes pour changer de vue. */
export function ProjectGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="relative mb-6">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-accent-soft">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={images[index]}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image src={images[index]} alt={alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="mt-2.5 flex gap-2" role="group" aria-label={alt}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${alt} — ${i + 1} / ${images.length}`}
              aria-current={i === index}
              className={`relative aspect-square w-14 overflow-hidden rounded-xl ring-2 transition-all ${i === index ? "ring-accent" : "opacity-70 ring-transparent hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
