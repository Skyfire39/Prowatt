import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "./icons";

export type MotoCardItem = {
  name: string;
  href: string;
  photo: string;
  /** Texte à la place du prix (« Prix sur demande »). */
  priceLabel: string;
  cta: string;
};

/** Carte d'une moto dans la boutique : pas de panier, la fiche dédiée détaille et propose l'essai. */
export function MotoCard({ item }: { item: MotoCardItem }) {
  return (
    <>
      <Link
        href={item.href}
        aria-label={`${item.cta} : ${item.name}`}
        className="group block overflow-hidden rounded-2xl bg-accent-soft/60 p-2"
      >
        <Image
          src={item.photo}
          alt=""
          width={400}
          height={400}
          sizes="(min-width: 1024px) 300px, 90vw"
          className="mx-auto h-32 w-auto object-contain drop-shadow-[0_14px_14px_rgb(10_35_32/0.22)] transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <h3 className="mt-5 flex-1 text-xl leading-snug">
        <Link href={item.href} className="hover:underline">
          Ecooter {item.name}
        </Link>
      </h3>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-lg font-medium text-muted">{item.priceLabel}</p>
        <Link
          href={item.href}
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
        >
          {item.cta}
          <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </>
  );
}
