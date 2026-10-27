import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/motion";
import { CtaBand, PageHero } from "@/components/ui";
import { isSlug, projectsBySlug, slugs } from "@/lib/data";
import type { Slug } from "@/lib/data";
import { hasLocale, locales } from "@/lib/i18n";
import { loadPage } from "@/lib/page";
import { getDictionary } from "../../dictionaries";

const crops: Record<Slug, { pos: string; zoom: number }> = {
  "100-autonome": { pos: "20% 30%", zoom: 1.4 },
  hybride: { pos: "55% 60%", zoom: 1.4 },
  ongrid: { pos: "85% 30%", zoom: 1.5 },
  "anti-delestage": { pos: "15% 75%", zoom: 1.5 },
  "acces-a-eau": { pos: "70% 90%", zoom: 1.6 },
};

export function generateStaticParams() {
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/realisations/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang) || !isSlug(slug)) return {};
  const { categories } = await getDictionary(lang);
  return { title: categories[slug].name, description: categories[slug].intro };
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
  const list = projectsBySlug(slug);

  return (
    <>
      <PageHero eyebrow={dict.realisations.eyebrow} title={c.name} subtitle={c.intro} photo={crops[slug]} />

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <ProjectCard key={`${p.title.fr}-${i}`} project={p} lang={lang} dict={dict.realisations} index={i} />
          ))}
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
