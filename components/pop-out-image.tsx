"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";

/**
 * Moto détourée qui sort de son cadre : le fond teinté reste en bas, la moto le dépasse par le haut avec une ombre au sol.
 * À la souris, elle s'incline légèrement vers le pointeur (effet 3D) ; au toucher, elle reste simplement posée.
 */
export function PopOutImage({ src, alt, unoptimized, sizes }: { src: string; alt: string; unoptimized?: boolean; sizes: string }) {
  const tilt = useRef<HTMLDivElement>(null);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !tilt.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.current.style.setProperty("--ry", `${(x * 16).toFixed(1)}deg`);
    tilt.current.style.setProperty("--rx", `${(-y * 10).toFixed(1)}deg`);
  };
  const reset = () => {
    tilt.current?.style.setProperty("--ry", "0deg");
    tilt.current?.style.setProperty("--rx", "0deg");
  };

  return (
    <div className="group/pop relative mt-14" onPointerMove={move} onPointerLeave={reset}>
      <div className="aspect-[5/3] rounded-2xl bg-accent-soft/60 ring-1 ring-white/70" />
      <div aria-hidden="true" className="absolute inset-x-[16%] bottom-3 h-6 rounded-[50%] bg-ink/25 blur-md transition-all duration-500 group-hover/pop:inset-x-[11%] group-hover/pop:bg-ink/35" />
      <div
        ref={tilt}
        className="absolute inset-x-0 bottom-0 transition-transform duration-200 ease-out motion-reduce:transform-none"
        style={{ transform: "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
      >
        <Image
          src={src}
          unoptimized={unoptimized}
          alt={alt}
          width={700}
          height={700}
          sizes={sizes}
          className="relative h-auto w-full translate-y-[7%] drop-shadow-[0_22px_16px_rgb(10_35_32/0.3)] transition-transform duration-500 ease-out group-hover/pop:-translate-y-1 group-hover/pop:scale-[1.06] motion-reduce:transition-none"
        />
      </div>
    </div>
  );
}
