import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, BatteryIcon, DropIcon, GridIcon, HomeIcon, ShieldIcon } from "@/components/icons";
import { HoverLift, Reveal } from "@/components/motion";
import { RealisationsBanner } from "@/components/realisations-banner";
import { RealisationsHero } from "@/components/realisations-hero";
import { CtaBand } from "@/components/ui";
import { getProjects } from "@/lib/content";
import { slugs } from "@/lib/data";
import type { Slug } from "@/lib/data";
import { loadPage } from "@/lib/page";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/realisations">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return pageMetadata({ ...dict.seo.realisations, path: "/realisations" });
}

const icons: Record<Slug, typeof HomeIcon> = {
  "100-autonome": HomeIcon,
  hybride: BatteryIcon,
  ongrid: GridIcon,
  "anti-delestage": ShieldIcon,
  "acces-a-eau": DropIcon,
};

/** Taille et décalage de chaque bulle (classes complètes pour que Tailwind les trouve). */
const layout = [
  "aspect-square w-[min(86vw,19rem)] lg:w-[21rem] lg:-translate-x-4 lg:translate-y-2",
  "aspect-square w-[min(80vw,17rem)] sm:translate-y-6 lg:w-[17.5rem] lg:translate-y-12",
  "aspect-square w-[min(84vw,18rem)] lg:w-[20rem] lg:translate-x-6 lg:-translate-y-4",
  "aspect-square w-[min(78vw,16.5rem)] lg:-mt-8 lg:w-[18rem] lg:translate-x-2",
  "aspect-square w-[min(88vw,19.5rem)] sm:-translate-y-4 lg:-mt-2 lg:w-[19rem] lg:translate-x-3 lg:translate-y-8",
];
/** Petites bulles décoratives derrière les cartes. */
const bubbles = [
  "left-[4%] top-[6%] size-10 bg-lime/60",
  "right-[6%] top-[2%] size-16 bg-accent-soft",
  "left-[44%] top-[48%] size-7 bg-lime/70",
  "right-[10%] bottom-[8%] size-12 bg-lime/50",
  "left-[8%] bottom-[10%] size-20 bg-accent-soft/80",
];

export default async function RealisationsPage({ params }: PageProps<"/[lang]/realisations">) {
  const { dict } = await loadPage(params);
  const d = dict.realisations;
  const projects = await getProjects();

  return (
    <>
      <RealisationsHero
        eyebrow={d.eyebrow}
        title={d.title}
        subtitle={d.subtitle}
      />
      <RealisationsBanner
        items={slugs.map((slug) => ({
          slug,
          name: dict.categories[slug].name,
          chip: d.banner.chips[slug],
          scene: d.banner.scenes[slug],
        }))}
        labels={{ kicker: d.banner.kicker, hint: d.banner.hint, explore: d.explore, aria: d.banner.aria }}
      />
      <section className="px-4 pb-16 sm:px-6">
        {/* Bulles rondes posées en désordre : tailles et décalages différents, jamais alignées */}
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-5 py-6 sm:gap-x-8 lg:py-10">
          {bubbles.map((b, i) => (
            <span key={i} aria-hidden="true" className={`sa-float pointer-events-none absolute -z-10 hidden rounded-full sm:block ${b}`} style={{ animationDelay: `${-i * 1.7}s`, animationDuration: `${6 + i}s` }} />
          ))}
          {slugs.map((slug, i) => {
            const Icon = icons[slug];
            const c = dict.categories[slug];
            const n = projects.filter((p) => p.slug === slug).length;
            return (
              <Reveal key={slug} delay={i * 0.09} className={`${layout[i]} ${i % 2 ? "max-sm:ml-auto" : "max-sm:mr-auto"}`}>
                <div className="sa-float size-full" style={{ animationDelay: `${-i * 1.3}s`, animationDuration: `${5.2 + i * 0.7}s` }}>
                  <HoverLift className="size-full">
                    <Link
                      href={`/realisations/${slug}`}
                      className="glass group relative grid size-full place-items-center overflow-hidden rounded-full p-6 text-center"
                    >
                      <span aria-hidden="true" className="absolute -right-6 -top-6 size-24 rounded-full bg-accent-soft/80 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative grid max-w-[74%] justify-items-center">
                        <span className="grid size-11 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                          <Icon className="size-5" />
                        </span>
                        <h2 className="mt-3 text-balance text-xl leading-tight tracking-tight sm:text-2xl">{c.name}</h2>
                        <p className="mt-1.5 line-clamp-3 text-sm leading-snug text-muted">{c.short}</p>
                        <p className="mt-3 flex flex-col items-center gap-0.5 text-sm font-medium">
                          <span className="text-muted">
                            {n} {n > 1 ? d.projects : d.project}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-accent">
                            {d.explore}
                            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </p>
                      </div>
                    </Link>
                  </HoverLift>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
      <CtaBand
        title={dict.home.cta.title}
        subtitle={dict.home.cta.subtitle}
        primary={{ href: `/devis`, label: dict.home.cta.primary }}
        secondary={{ href: `/contact`, label: dict.home.cta.secondary }}
      />
    </>
  );
}
