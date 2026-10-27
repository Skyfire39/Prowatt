import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Project } from "@/lib/data";
import { tr } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { MapPinIcon } from "./icons";
import { ProjectGallery } from "./project-gallery";
import { HoverLift, Reveal } from "./motion";

const nf = (lang: Locale, n: number) =>
  new Intl.NumberFormat(lang, { maximumFractionDigits: 2 }).format(n);

function monthYear(date: string, lang: Locale) {
  if (!date) return "";
  const [y, m] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(lang, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

export function ProjectCard({
  project,
  lang,
  dict,
  index,
}: {
  project: Project;
  lang: Locale;
  dict: Dictionary["realisations"];
  index: number;
}) {
  const s = dict.specs;
  const specs: [string, string][] = [];
  if (project.kwc != null) specs.push([s.kwc, `${nf(lang, project.kwc)} kWc`]);
  if (project.panels)
    specs.push([s.panels, `${project.panels.count} × ${project.panels.watts} W`]);
  if (project.storageKwh != null)
    specs.push([
      s.storage,
      `${nf(lang, project.storageKwh)} kWh${project.storageKind ? ` · ${tr(project.storageKind, lang)}` : ""}`,
    ]);
  else if (project.storageKind) specs.push([s.storage, tr(project.storageKind, lang)]);
  if (project.inverterKva != null) specs.push([s.inverter, `${project.inverterKva} kVA`]);
  if (project.capacityL != null) specs.push([s.capacity, `${project.capacityL} L`]);
  if (project.coveragePct != null) specs.push([s.coverage, `≈ ${project.coveragePct} %`]);
  if (project.autonomyHours != null)
    specs.push([s.autonomy, `≈ ${project.autonomyHours} ${s.hours}`]);
  if (project.annualKwh != null)
    specs.push([s.annual, `${nf(lang, project.annualKwh)} kWh`]);
  if (project.roiYears != null) specs.push([s.roi, `${nf(lang, project.roiYears)} ${s.years}`]);
  if (project.warrantyYears != null)
    specs.push([s.warranty, `${project.warrantyYears} ${s.years}`]);
  if (project.co2 != null) specs.push([s.co2, `${nf(lang, project.co2)} ${s.tons} ${s.perYear}`]);

  const when = monthYear(project.date, lang);

  return (
    <Reveal delay={(index % 3) * 0.08}>
      <HoverLift className="glass relative flex h-full flex-col overflow-hidden rounded-2xl">
        {project.images && project.images.length > 0 && <ProjectGallery images={project.images} alt={tr(project.title, lang)} />}
        <div className="relative flex flex-1 flex-col p-6 sm:p-7">
          <div className="relative">
            <h3 className="text-2xl leading-snug tracking-tight">
              {tr(project.title, lang)}
            </h3>
            {project.client && (
              <p className="mt-1 text-sm font-medium text-accent">
                {dict.client} : {project.client}
              </p>
            )}
            {(project.city || when) && (
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                {project.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon className="size-4" />
                    {project.city}
                  </span>
                )}
                {when && (
                  <span>
                    {dict.installed} {when}
                  </span>
                )}
              </p>
            )}
          </div>

          <dl className="relative mt-6 grid grid-cols-2 gap-3">
            {specs.map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line bg-white/35 px-3.5 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{k}</dt>
                <dd className="mt-0.5 text-[15px] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          {(project.note || project.description) && (
            <details className="group relative mt-5 border-t border-line pt-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-accent marker:hidden [&::-webkit-details-marker]:hidden">
                {dict.moreInfo}
                <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft transition-transform duration-300 group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="pb-1 text-sm leading-relaxed text-muted">
                {project.note ? tr(project.note, lang) : tr(project.description!, lang)}
              </p>
            </details>
          )}
        </div>
      </HoverLift>
    </Reveal>
  );
}
