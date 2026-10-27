import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, BuildingIcon, HomeIcon } from "@/components/icons";
import { HoverLift, Reveal } from "@/components/motion";
import { PageHero } from "@/components/ui";
import { loadPage } from "@/lib/page";

export async function generateMetadata({ params }: PageProps<"/[lang]/devis">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.nav.quotes, description: dict.quotes.subtitle };
}

export default async function QuotesPage({ params }: PageProps<"/[lang]/devis">) {
  const { dict } = await loadPage(params);
  const q = dict.quotes;
  const cards = [
    { href: `/devis/particulier`, icon: HomeIcon, ...q.individual },
    { href: `/devis/societe`, icon: BuildingIcon, ...q.company },
  ];

  return (
    <>
      <PageHero eyebrow={q.eyebrow} title={q.title} subtitle={q.subtitle} />
      <section className="px-4 pb-4 pt-4 sm:px-6 sm:pb-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.href} delay={i * 0.1}>
              <HoverLift className="h-full">
                <Link href={c.href} className="glass group relative flex h-full flex-col overflow-hidden rounded-3xl p-8 sm:p-10">
                  <span className="relative grid size-14 place-items-center rounded-2xl bg-accent text-on-accent">
                    <c.icon className="size-7" />
                  </span>
                  <h2 className="relative mt-7 text-4xl tracking-tight">{c.title}</h2>
                  <p className="relative mt-3 flex-1 leading-relaxed text-muted">{c.text}</p>
                  <span className="relative mt-8 inline-flex items-center gap-2 font-medium text-accent">
                    {q.open}
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </HoverLift>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
