"use client";

import type { PointerEvent } from "react";
import { KeyIcon, LampIcon, MapPinIcon, ShieldIcon } from "./icons";
import { Reveal } from "./motion";

const icons = [KeyIcon, ShieldIcon, LampIcon, MapPinIcon];

/** Suit le curseur : la lueur de la carte se place sous le doigt ou la souris (variables CSS --mx / --my). */
function track(e: PointerEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/**
 * Les quatre atouts de Prowatt : cartes de verre avec numéro en filigrane, pastille d'icône qui pulse,
 * lueur qui suit le curseur, reflet qui traverse la carte et filet lumineux qui se dessine au survol.
 */
export function WhyCards({ items }: { items: { title: string; text: string }[] }) {
  return (
    <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => {
        const Icon = icons[i];
        return (
          <Reveal key={item.title} delay={i * 0.1} y={28} className="h-full">
            <div
              onPointerMove={track}
              className="wh-card glass group relative isolate flex h-full flex-col overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_60px_-20px_rgb(23_92_85/0.45)]"
            >
              <span aria-hidden="true" className="wh-spot pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span aria-hidden="true" className="wh-shine pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/2" />
              <span aria-hidden="true" className="wh-blob pointer-events-none absolute -left-10 -top-10 -z-10 size-48 rounded-full bg-lime/70 blur-3xl transition-opacity duration-500 group-hover:opacity-100" style={{ animationDuration: `${9 + i * 1.5}s`, animationDelay: `${-i * 2}s` }} />
              <span aria-hidden="true" className="wh-blob pointer-events-none absolute -bottom-12 -right-8 -z-10 size-44 rounded-full bg-[#5fd0a0]/60 blur-3xl transition-opacity duration-500 group-hover:opacity-100" style={{ animationDuration: `${12 + i}s`, animationDelay: `${-i * 3.5}s`, animationDirection: "reverse" }} />
              <span aria-hidden="true" className="pointer-events-none absolute right-6 top-3 select-none text-7xl font-semibold leading-none tracking-tighter text-teal/10 transition-all duration-500 group-hover:-translate-y-1 group-hover:text-teal/20">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="relative grid size-14 place-items-center">
                <span aria-hidden="true" className="wh-ping absolute inset-0 rounded-2xl ring-2 ring-lime" style={{ animationDelay: `${i * 0.7}s` }} />
                <span className="relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-teal to-[#0f4a44] text-lime shadow-[0_10px_24px_-8px_rgb(23_92_85/0.7),inset_0_1px_0_rgb(255_255_255/0.25)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="size-6" />
                </span>
              </span>

              <h3 className="mt-7 text-2xl leading-snug tracking-tight">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
