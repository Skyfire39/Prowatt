import Image from "next/image";

type Logo = { name: string; logo: string };

/**
 * Bandeau de logos qui défile sans fin vers la gauche. La liste est dupliquée : la piste glisse de
 * 50 % puis recommence, sans saut visible. Chaque moitié répète les logos pour couvrir les grands
 * écrans. Pause au survol, fondu sur les bords, immobile avec « réduire les animations ».
 */
export function LogoMarquee({ items, label }: { items: Logo[]; label: string }) {
  const half = [...items, ...items];
  return (
    <div
      className="marquee overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,#000_9%,#000_91%,transparent)]"
      role="region"
      aria-label={label}
    >
      <div className="marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 gap-4 pr-4" aria-hidden={copy === 1 || undefined}>
            {half.map((p, i) => (
              <li
                key={`${p.name}-${i}`}
                className="grid h-32 w-44 shrink-0 place-items-center overflow-hidden rounded-3xl border border-white bg-white shadow-[0_10px_30px_rgb(23_92_85/0.14)] transition-transform duration-300 hover:-translate-y-1 sm:h-36 sm:w-52"
              >
                <Image
                  src={p.logo}
                  alt={copy === 0 && i < items.length ? p.name : ""}
                  width={225}
                  height={225}
                  sizes="144px"
                  draggable={false}
                  className="size-32 select-none object-contain sm:size-36"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
