"use client";

import Image from "next/image";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const RATIO = 1672 / 941;

/**
 * Parcours de la « caméra » dans l'illustration, du haut de la page jusqu'en bas.
 * x et y sont des positions dans l'image (0 à 1), z le zoom relatif.
 */
const PATH = [
  { p: 0.0, x: 0.22, y: 0.1, z: 1.0 }, // le soleil
  { p: 0.25, x: 0.5, y: 0.27, z: 1.0 }, // les nuages
  { p: 0.5, x: 0.74, y: 0.41, z: 1.05 }, // le bout de toit et ses panneaux
  { p: 0.75, x: 0.52, y: 0.6, z: 1.0 }, // le toit avec panneaux solaires
  { p: 1.0, x: 0.3, y: 0.82, z: 1.12 }, // la maison et la moto qui charge
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function pointAt(p: number) {
  const t = clamp(p, 0, 1);
  for (let i = 0; i < PATH.length - 1; i++) {
    const a = PATH[i];
    const b = PATH[i + 1];
    if (t <= b.p) {
      const k = smooth((t - a.p) / (b.p - a.p));
      return {
        x: a.x + (b.x - a.x) * k,
        y: a.y + (b.y - a.y) * k,
        z: a.z + (b.z - a.z) * k,
      };
    }
  }
  return PATH[PATH.length - 1];
}

type Dims = { vw: number; vh: number };

function frame(p: number, { vw, vh }: Dims, still: boolean) {
  // Largeur de l'image pour couvrir l'écran, puis zoom de la caméra.
  const cover = Math.max(vw, vh * RATIO);
  const base = vw >= 768 ? 1.65 : 1.1;
  const pt = still ? { x: 0.4, y: 0.5, z: 0 } : pointAt(p);
  const zoom = still ? 1 : base * pt.z;
  const W = cover * zoom;
  const H = W / RATIO;
  const tx = clamp(vw / 2 - pt.x * W, vw - W, 0);
  const ty = clamp(vh / 2 - pt.y * H, vh - H, 0);
  return { cover, transform: `translate3d(${tx}px, ${ty}px, 0) scale(${zoom})` };
}

/**
 * Fond animé de l'accueil : soleil, nuages, bout de toit, toit et maison avec la
 * moto électrique qui charge, révélés au fil du scroll. Voile clair ou sombre par-dessus
 * pour garder le contenu lisible.
 */
export function ScrollScene() {
  const [dims, setDims] = useState<Dims>({ vw: 1440, vh: 810 });
  const [still, setStill] = useState(false);
  const [ready, setReady] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.5 });
  const transform = useMotionValue("translate3d(0px, 0px, 0) scale(1)");

  useEffect(() => {
    const measure = () => setDims({ vw: window.innerWidth, vh: window.innerHeight });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduce = () => setStill(reduce.matches);
    measure();
    onReduce();
    setReady(true);
    window.addEventListener("resize", measure);
    reduce.addEventListener("change", onReduce);
    return () => {
      window.removeEventListener("resize", measure);
      reduce.removeEventListener("change", onReduce);
    };
  }, []);

  const apply = useCallback(
    () => transform.set(frame(progress.get(), dims, still).transform),
    [progress, transform, dims, still],
  );
  useMotionValueEvent(progress, "change", apply);
  useEffect(apply, [apply]);

  const { cover } = frame(0, dims, still);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[1] overflow-hidden transition-opacity duration-1000"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <motion.div
        style={{ transform, width: cover, height: cover / RATIO, transformOrigin: "0 0" }}
        className="absolute left-0 top-0 will-change-transform"
      >
        <Image
          src="/images/home-scene.webp"
          alt=""
          fill
          priority
          sizes="2400px"
          className="select-none object-cover"
        />
        {/* Halo du soleil qui respire */}
        <motion.div
          className="absolute rounded-full bg-[radial-gradient(circle,rgb(255_252_220/0.95)_0%,rgb(255_250_210/0.45)_35%,transparent_68%)]"
          style={{ left: "13%", top: "-6%", width: "18%", aspectRatio: "1" }}
          animate={{ opacity: [0.55, 1, 0.55], scale: [0.94, 1.08, 0.94] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Voile : garde le texte et le verre lisibles par-dessus l'illustration */}
      <div className="absolute inset-0 bg-canvas/66 dark:bg-canvas/76" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-canvas/60 to-transparent" />
    </div>
  );
}
