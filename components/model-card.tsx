import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { ecooters, techs, tr } from "@/lib/data";
import type { Tech } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { mailto } from "@/lib/site";
import { ArrowIcon } from "./icons";
import { HoverLift, Reveal } from "./motion";

type Model = (typeof ecooters)[number];

export function ModelCard({
  model,
  lang,
  dict,
  index,
  active,
}: {
  model: Model;
  lang: Locale;
  dict: Dictionary["ecooter"];
  index: number;
  active?: Tech;
}) {
  const subject = `${dict.mailSubject} — ${model.name}${active ? ` (${dict.techs[active].name})` : ""}`;

  return (
    <Reveal delay={(index % 3) * 0.08}>
      <HoverLift className="glass flex h-full flex-col overflow-hidden rounded-3xl p-5">
        <div className="overflow-hidden rounded-2xl bg-white">
          <Image
            src={model.photo}
            alt={model.name}
            width={700}
            height={700}
            sizes="(min-width: 1024px) 340px, (min-width: 768px) 45vw, 90vw"
            className="h-auto w-full"
          />
        </div>
        <div className="flex flex-1 flex-col px-2 pb-2 pt-6">
          <h3 className="text-3xl tracking-tight">{model.name}</h3>
          <p className="mt-2 flex-1 leading-relaxed text-muted">{tr(model.tagline, lang)}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">{dict.battery}</span>
            {techs.map((t) => (
              <Link
                key={t}
                href={`/${lang}/ecooter/${t}`}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80 ${
                  active === t ? "bg-accent text-on-accent" : "glass-chip"
                }`}
              >
                {dict.techs[t].name}
              </Link>
            ))}
          </div>

          <a
            href={mailto(subject)}
            className="group mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line text-sm font-medium transition hover:bg-accent-soft"
          >
            {dict.cta}
            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </HoverLift>
    </Reveal>
  );
}
