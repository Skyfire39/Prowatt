import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { CatalogEcooter } from "@/lib/content";
import { modelHref, techs, tr } from "@/lib/data";
import type { Tech } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { ArrowIcon } from "./icons";
import { HoverLift, Reveal } from "./motion";

type Model = CatalogEcooter;

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
  return (
    <Reveal delay={(index % 3) * 0.08}>
      <HoverLift className="glass flex h-full flex-col overflow-hidden rounded-3xl p-5">
        <Link href={modelHref(lang, model.id)} aria-label={`${dict.model.view} : ${model.name}`} className="group block overflow-hidden rounded-2xl bg-accent-soft/60 p-4">
          <Image
            src={model.photo}
            unoptimized={model.photo.startsWith("/api/")}
            alt={model.name}
            width={700}
            height={700}
            sizes="(min-width: 1024px) 340px, (min-width: 768px) 45vw, 90vw"
            className="h-auto w-full drop-shadow-[0_18px_18px_rgb(10_35_32/0.22)] transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex flex-1 flex-col px-2 pb-2 pt-6">
          <h3 className="text-3xl tracking-tight">
            <Link href={modelHref(lang, model.id)} className="hover:underline">
              {model.name}
            </Link>
          </h3>
          <p className="mt-2 flex-1 leading-relaxed text-muted">{tr(model.tagline, lang)}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">{dict.battery}</span>
            {techs.map((t) => (
              <Link
                key={t}
                href={`/ecooter/${t}`}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80 ${
                  active === t ? "bg-accent text-on-accent" : "glass-chip"
                }`}
              >
                {dict.techs[t].name}
              </Link>
            ))}
          </div>

          <Link
            href={modelHref(lang, model.id)}
            className="group mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
          >
            {dict.model.view}
            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </HoverLift>
    </Reveal>
  );
}
