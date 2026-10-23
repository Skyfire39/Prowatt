import type { Metadata } from "next";
import { MotoArt } from "@/components/art";
import { BatteryIcon, BoltIcon, WrenchIcon } from "@/components/icons";
import { HoverLift, Reveal } from "@/components/motion";
import { ButtonLink, PageHero, SectionHead } from "@/components/ui";
import { ecooters, tr } from "@/lib/data";
import { loadPage } from "@/lib/page";
import { mailto } from "@/lib/site";
import type { CSSProperties } from "react";

export async function generateMetadata({ params }: PageProps<"/[lang]/ecooter">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.nav.ecooter, description: dict.ecooter.subtitle };
}

const techIcons = [BoltIcon, BatteryIcon, WrenchIcon];

export default async function EcooterPage({ params }: PageProps<"/[lang]/ecooter">) {
  const { lang, dict } = await loadPage(params);
  const d = dict.ecooter;

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ecooters.map((m, i) => (
            <Reveal key={m.id} delay={(i % 3) * 0.08}>
              <HoverLift className="glass flex h-full flex-col overflow-hidden rounded-2xl p-6">
                <div className="relative rounded-3xl border border-line bg-accent-soft">
                  <MotoArt
                    className="w-full"
                    style={{ "--moto-a": m.hue[1], "--moto-b": m.hue[0] } as CSSProperties}
                  />
                </div>
                <h2 className="mt-6 text-3xl tracking-tight">{m.name}</h2>
                <p className="mt-2 flex-1 leading-relaxed text-muted">{tr(m.tagline, lang)}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent">{d.onRequest}</p>
                <div className="mt-5">
                  <ButtonLink href={mailto(`${d.mailSubject} — ${m.name}`)} variant="glass" arrow>
                    {d.cta}
                  </ButtonLink>
                </div>
              </HoverLift>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow={d.eyebrow} title={d.techTitle} />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {d.tech.map((t, i) => {
              const Icon = techIcons[i];
              return (
                <Reveal key={t.title} delay={i * 0.1}>
                  <div className="glass h-full rounded-2xl p-8">
                    <span className="grid size-12 place-items-center rounded-2xl bg-accent text-on-accent">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-6 text-2xl tracking-tight">{t.title}</h3>
                    <p className="mt-2 text-muted">{t.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
