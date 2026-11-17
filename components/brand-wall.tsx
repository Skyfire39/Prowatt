import Image from "./sk-image";
import { LogoMarquee } from "./logo-marquee";
import { Reveal } from "./motion";

type Brand = { name: string; logo: string };

/**
 * Mur de marques : quelques grandes cartes blanches avec leur logo quand la liste est courte (jusqu'à 8),
 * le bandeau défilant au-delà. Chaque logo a un nom lisible par les lecteurs d'écran et les moteurs de recherche.
 */
export function BrandWall({ items, label }: { items: Brand[]; label: string }) {
  if (items.length > 8) return <LogoMarquee items={items} label={label} />;
  return (
    <ul aria-label={label} className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {items.map((b, i) => (
        <Reveal key={b.name} delay={i * 0.08} y={20}>
          <li className="group grid h-40 place-items-center rounded-3xl border border-white bg-white p-6 shadow-[0_10px_30px_rgb(23_92_85/0.14)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_rgb(23_92_85/0.24)] sm:h-48">
            <span className="relative block size-full">
              <Image src={b.logo} alt={b.name} fill sizes="(min-width: 1024px) 220px, 44vw" draggable={false} className="select-none object-contain transition-transform duration-500 group-hover:scale-105" />
            </span>
          </li>
        </Reveal>
      ))}
    </ul>
  );
}
