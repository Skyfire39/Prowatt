import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Faq } from "@/components/faq";
import { GuideBlocks, anchor } from "@/components/guide-blocks";
import { ArrowIcon, ChevronIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/motion";
import { PageSkeleton } from "@/components/skeleton";
import { ButtonLink } from "@/components/ui";
import { guideBySlug, guides } from "@/lib/guides";
import { locales } from "@/lib/i18n";
import { loadPage } from "@/lib/page";
import { absoluteUrl, breadcrumbLd, DEFAULT_OG_IMAGE, pageMetadata, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return locales.flatMap((lang) => guides.map((g) => ({ lang, slug: g.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return {};
  return pageMetadata({ title: `${g.title} | Prowatt`.slice(0, 120), description: g.description, path: `/guides/${g.slug}` });
}

const dateFr = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default function GuidePage({ params }: PageProps<"/[lang]/guides/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GuideContent params={params} />
    </Suspense>
  );
}

async function GuideContent({ params }: { params: PageProps<"/[lang]/guides/[slug]">["params"] }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const { dict } = await loadPage(params);
  const related = g.related.map((s) => guideBySlug(s)).filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: dict.nav.home, path: "/" },
            { name: "Guides", path: "/guides" },
            { name: g.title, path: `/guides/${g.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.title,
            description: g.description,
            datePublished: g.published,
            dateModified: g.updated,
            inLanguage: "fr",
            mainEntityOfPage: absoluteUrl(`/guides/${g.slug}`),
            image: absoluteUrl(DEFAULT_OG_IMAGE.url),
            author: { "@type": "Organization", name: "Prowatt Madagascar", url: SITE_URL },
            publisher: { "@type": "Organization", name: "Prowatt Madagascar", url: SITE_URL, logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo-email.png") } },
          },
        ]}
      />

      <section className="px-4 pb-10 pt-28 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <Reveal y={10}>
            <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-ink">
                    {dict.nav.home}
                  </Link>
                </li>
                <ChevronIcon className="size-3.5 -rotate-90" />
                <li>
                  <Link href="/guides" className="hover:text-ink">
                    Guides
                  </Link>
                </li>
                <ChevronIcon className="size-3.5 -rotate-90" />
                <li aria-current="page" className="line-clamp-1 font-medium text-ink">
                  {g.eyebrow}
                </li>
              </ol>
            </nav>
          </Reveal>
          <Reveal y={16} className="max-w-4xl">
            <p className="eyebrow">{g.eyebrow}</p>
            <h1 className="mt-3 text-balance text-4xl leading-[1.05] tracking-[-0.04em] sm:text-6xl">{g.title}</h1>
            <p className="mt-5 text-sm text-muted">
              Mis à jour le {dateFr(g.updated)} · {g.minutes} min de lecture
            </p>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-ink/80">{g.intro}</p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <nav aria-label="Dans ce guide" className="sticky top-28">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Dans ce guide</p>
              <ol className="mt-4 grid gap-2.5 border-l border-line pl-4 text-[15px]">
                {g.sections.map((s) => (
                  <li key={s.h2}>
                    <a href={`#${anchor(s.h2)}`} className="text-muted transition-colors hover:text-ink">
                      {s.h2}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#questions" className="text-muted transition-colors hover:text-ink">
                    Questions fréquentes
                  </a>
                </li>
              </ol>
            </nav>
          </aside>

          <article className="max-w-3xl">
            {g.sections.map((s) => (
              <section key={s.h2} id={anchor(s.h2)} className="scroll-mt-28 pb-12">
                <h2 className="text-balance text-3xl leading-tight tracking-tight sm:text-4xl">{s.h2}</h2>
                <GuideBlocks blocks={s.blocks} />
              </section>
            ))}
          </article>
        </div>
      </section>

      <div id="questions" className="scroll-mt-20">
        <Faq eyebrow="Questions fréquentes" title="Vos questions, nos réponses" items={g.faq} />
      </div>

      <section className="px-4 py-12 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <div className="glass-teal rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="mx-auto max-w-2xl text-balance text-4xl leading-tight tracking-tight text-white sm:text-5xl">{g.cta.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">{g.cta.text}</p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href={g.cta.href} variant="lime" arrow>
                {g.cta.label}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>

      {related.length > 0 && (
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow">À lire aussi</p>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/guides/${r.slug}`} className="glass group flex h-full items-center justify-between gap-4 rounded-2xl p-6 transition-transform hover:-translate-y-0.5">
                    <span>
                      <span className="block text-xl font-semibold leading-snug tracking-tight">{r.title}</span>
                      <span className="mt-1 block text-sm text-muted">{r.minutes} min de lecture</span>
                    </span>
                    <ArrowIcon className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
