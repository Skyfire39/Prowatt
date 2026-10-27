import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, BatteryIcon, DropIcon, GridIcon, HomeIcon, ShieldIcon } from "@/components/icons";
import { HoverLift, Reveal } from "@/components/motion";
import { CtaBand, PageHero } from "@/components/ui";
import { getProjects } from "@/lib/content";
import { slugs } from "@/lib/data";
import type { Slug } from "@/lib/data";
import { loadPage } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/realisations">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.nav.realisations, description: dict.realisations.subtitle };
}

const icons: Record<Slug, typeof HomeIcon> = {
  "100-autonome": HomeIcon,
  hybride: BatteryIcon,
  ongrid: GridIcon,
  "anti-delestage": ShieldIcon,
  "acces-a-eau": DropIcon,
};

export default async function RealisationsPage({ params }: PageProps<"/[lang]/realisations">) {
  const { dict } = await loadPage(params);
  const d = dict.realisations;
  const projects = await getProjects();

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} photo={{ pos: "35% 30%", zoom: 1.2 }} />
      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {slugs.map((slug, i) => {
            const Icon = icons[slug];
            const c = dict.categories[slug];
            const n = projects.filter((p) => p.slug === slug).length;
            return (
              <Reveal key={slug} delay={(i % 3) * 0.08}>
                <HoverLift className="h-full">
                  <Link
                    href={`/realisations/${slug}`}
                    className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl p-8"
                  >
                    <span className="relative grid size-12 place-items-center rounded-2xl bg-accent text-on-accent">
                      <Icon className="size-6" />
                    </span>
                    <h2 className="relative mt-6 text-3xl tracking-tight">{c.name}</h2>
                    <p className="relative mt-2 flex-1 leading-relaxed text-muted">{c.short}</p>
                    <p className="relative mt-6 flex items-center justify-between text-sm font-medium">
                      <span className="text-muted">
                        {n} {n > 1 ? d.projects : d.project}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-accent">
                        {d.explore}
                        <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </p>
                  </Link>
                </HoverLift>
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
