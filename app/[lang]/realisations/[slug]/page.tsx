import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PaginatedGrid } from "@/components/paginated-grid";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/motion";
import { AntiDelestageBanner } from "@/components/anti-delestage-banner";
import { AutonomeBanner } from "@/components/autonome-banner";
import { HybrideBanner } from "@/components/hybride-banner";
import { OngridBanner } from "@/components/ongrid-banner";
import { RealisationsHero } from "@/components/realisations-hero";
import { WaterBanner } from "@/components/water-banner";
import { CtaBand } from "@/components/ui";
import { getProjects } from "@/lib/content";
import { isSlug, slugs } from "@/lib/data";
import type { Slug } from "@/lib/data";
import { hasLocale, locales } from "@/lib/i18n";
import { loadPage } from "@/lib/page";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { getDictionary } from "../../dictionaries";

export function generateStaticParams() {
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/realisations/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang) || !isSlug(slug)) return {};
  const { seo } = await getDictionary(lang);
  return pageMetadata({ ...seo.categories[slug], path: `/realisations/${slug}` });
}

export default function CategoryPage({ params }: PageProps<"/[lang]/realisations/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: { params: PageProps<"/[lang]/realisations/[slug]">["params"] }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const { lang, dict } = await loadPage(params);
  const c = dict.categories[slug];
  const list = (await getProjects()).filter((p) => p.slug === slug);
  const r = dict.realisations;
  const scenes: Record<Slug, ReactNode> = {
    "100-autonome": <AutonomeBanner labels={r.autoScene} />,
    hybride: <HybrideBanner labels={r.hybScene} />,
    ongrid: <OngridBanner labels={r.gridScene} />,
    "anti-delestage": <AntiDelestageBanner labels={r.antiScene} />,
    "acces-a-eau": <WaterBanner labels={r.waterScene} />,
  };

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: dict.nav.home, path: "/" },
          { name: dict.nav.realisations, path: "/realisations" },
          { name: c.name, path: `/realisations/${slug}` },
        ])}
      />
      <RealisationsHero
        eyebrow={r.eyebrow}
        title={c.name}
        subtitle={c.intro}
        points={c.points}
        stats={[{ value: list.length, label: list.length > 1 ? r.projects : r.project }]}
        scene={scenes[slug]}
      />

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <PaginatedGrid className="grid gap-6 md:grid-cols-2" label={dict.realisations.pagination}>
            {list.map((p, i) => (
              <ProjectCard key={p.id ?? `${p.title.fr}-${i}`} project={p} lang={lang} dict={dict.realisations} index={i} />
            ))}
          </PaginatedGrid>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <p className="eyebrow">{dict.realisations.others}</p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {slugs
              .filter((s) => s !== slug)
              .map((s) => (
                <li key={s}>
                  <Link
                    href={`/realisations/${s}`}
                    className="glass inline-block rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:opacity-80"
                  >
                    {dict.categories[s].name}
                  </Link>
                </li>
              ))}
          </ul>
        </Reveal>
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
