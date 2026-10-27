import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowIcon, CheckIcon, ChevronIcon, MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { ModelFeature } from "@/components/model-feature";
import { ProjectGallery } from "@/components/project-gallery";
import { RichText } from "@/components/rich-text";
import { ModelVisual } from "@/components/model-visual";
import { Reveal } from "@/components/motion";
import { CtaBand } from "@/components/ui";
import { getEcooterPage, getEcooters, getSettings } from "@/lib/content";
import { modelHref, techs, tr } from "@/lib/data";
import { hasLocale, locales } from "@/lib/i18n";
import { loadPage } from "@/lib/page";
import { mailto, whatsappHref } from "@/lib/site";
import { toSiteInfo } from "@/lib/site-info";

export async function generateStaticParams() {
  const ecooters = await getEcooters();
  return locales.flatMap((lang) => ecooters.map((m) => ({ lang, id: m.id })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/ecooter/modeles/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const ecooters = await getEcooters();
  const model = ecooters.find((m) => m.id === id);
  if (!hasLocale(lang) || !model) return {};
  return { title: `Ecooter ${model.name}`, description: tr(model.tagline, lang) };
}

export default function ModelPage({ params }: PageProps<"/[lang]/ecooter/modeles/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <ModelContent params={params} />
    </Suspense>
  );
}

const pill = "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-opacity hover:opacity-85";

async function ModelContent({ params }: { params: PageProps<"/[lang]/ecooter/modeles/[id]">["params"] }) {
  const { id } = await params;
  const ecooters = await getEcooters();
  const index = ecooters.findIndex((m) => m.id === id);
  if (index < 0) notFound();
  const model = ecooters[index];
  const { lang, dict } = await loadPage(params);
  const site = toSiteInfo(await getSettings());
  const page = await getEcooterPage(model.id);
  // Jetons des textes de l'admin : coordonnées de l'entreprise et adresses relatives au site.
  const fill = (t: string) =>
    t.replaceAll("{address}", site.address[lang]).replaceAll("{hours}", site.hours[lang][0] ?? "").replaceAll("{phone}", site.phone);
  const href = (h: string) =>
    h === "{phoneHref}" ? site.phoneHref : h === "{emailHref}" ? mailto(subject, "", site.email) : h.startsWith("/") ? h : h;
  const d = dict.ecooter;
  const m = d.model;
  const base = "";
  const tagline = tr(model.tagline, lang);
  const specs = model.specs ?? {};
  const onRequest = d.slider.onRequest;

  // Fiche : les quatre lignes de base sont toujours là ; les autres n'apparaissent que si renseignées.
  const rows: { label: string; value: string }[] = [
    { label: m.power, value: specs.power ?? onRequest },
    { label: m.speed, value: specs.speed ?? onRequest },
    { label: m.range, value: specs.range ?? onRequest },
    { label: m.battery, value: specs.battery ?? d.slider.batteryBoth },
    ...(
      [
        [m.batteryPower, specs.batteryPower],
        [m.charge, specs.charge],
        [m.warranty, specs.warranty],
        [m.trunk, specs.trunk],
        [m.brakes, specs.brakes],
        [m.tires, specs.tires],
        [m.dimensions, specs.dimensions],
        [m.weight, specs.weight],
        [m.load, specs.load],
        [m.seat, specs.seat],
      ] as const
    )
      .filter(([, v]) => v)
      .map(([label, value]) => ({ label, value: value! })),
  ];

  const subject = `${d.mailSubject} — ${model.name}`;
  const others = ecooters.filter((o) => o.id !== model.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Ecooter ${model.name}`,
    description: tagline,
    brand: { "@type": "Brand", name: "Ecooter" },
    category: "Electric scooter",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* En-tête : visuel à gauche, identité et paramètres à droite */}
      <section className="px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <Reveal y={10}>
            <nav aria-label={m.breadcrumbAria} className="mb-8 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href={base || "/"} className="hover:text-ink">{dict.nav.home}</Link>
                </li>
                <ChevronIcon className="size-3.5 -rotate-90" />
                <li>
                  <Link href={`${base}/ecooter`} className="hover:text-ink">{dict.nav.ecooter}</Link>
                </li>
                <ChevronIcon className="size-3.5 -rotate-90" />
                <li aria-current="page" className="font-medium text-ink">{model.name}</li>
              </ol>
            </nav>
          </Reveal>

          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <ModelVisual photo={model.photo} name={model.name} />
            </div>

            <div className="lg:col-span-6">
              <Reveal y={24}>
                <p className="eyebrow">
                  {d.eyebrow} · {m.position.replace("{n}", String(index + 1)).replace("{total}", String(ecooters.length))}
                </p>
                <h1 className="mt-3 text-6xl leading-none tracking-[-0.05em] sm:text-7xl">{model.name}</h1>
                <p className="mt-4 text-xl leading-relaxed text-muted">{tagline}</p>
                {model.description?.[lang]?.trim() && <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">{model.description[lang]}</p>}
                {model.price ? (
                  <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-accent">
                    {new Intl.NumberFormat(lang).format(model.price)} <span className="text-lg text-muted">{dict.shop.currency}</span>
                  </p>
                ) : null}
                {model.highlights.length > 0 && (
                  <ul className="mt-5 grid gap-2">
                    {model.highlights.map((h, i) => (
                      <li key={i} className="flex gap-2.5 text-[15px] leading-snug">
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                        {tr(h, lang)}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">{d.battery}</span>
                  {techs.map((t) => (
                    <Link
                      key={t}
                      href={`${base}/ecooter/${t}`}
                      className="glass-chip rounded-full px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80"
                    >
                      {d.techs[t].name}
                    </Link>
                  ))}
                </div>
              </Reveal>

              <Reveal y={24} delay={0.1} className="glass mt-8 rounded-3xl p-6 sm:p-7">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{m.paramsTitle}</h2>
                <dl className="mt-5 grid gap-x-8 sm:grid-cols-2">
                  {rows.map((r) => (
                    <div key={r.label} className="border-b border-ink/10 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{r.label}</dt>
                      <dd className={`mt-1 font-semibold tracking-tight ${r.value === onRequest ? "text-muted" : "text-lg"}`}>
                        {r.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-muted">{page.paramsNote[lang]}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={mailto(subject, "", site.email)} className={`${pill} bg-accent text-on-accent`}>
                    <MailIcon className="size-5" />
                    {m.trial}
                  </a>
                  <a
                    href={whatsappHref(m.whatsappMsg.replace("{name}", model.name), site.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${pill} bg-teal text-white`}
                  >
                    <WhatsAppIcon className="size-5" />
                    {m.whatsapp}
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Blocs image + texte en alternance */}
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-20 lg:gap-32">
          {page.blocks
            .filter((b) => b.enabled)
            .map((b) => (
              <ModelFeature
                key={b.id}
                photo={model.photo}
                detail={b.image}
                name={model.name}
                side={b.side}
                zoom={b.zoom}
                origin={`${b.originX}% ${b.originY}%`}
                title={fill(b.title[lang])}
                bullets={b.bullets.map((t, k) => (
                  <RichText key={k} text={fill(t[lang])} />
                ))}
              >
                {b.buttons.map((btn, k) => (
                  <a
                    key={k}
                    href={href(btn.href)}
                    {...(btn.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`${pill} ${btn.style === "primary" ? "bg-accent text-on-accent" : "glass"}`}
                  >
                    {fill(btn.label[lang])}
                    {btn.style === "primary" ? btn.href === "{phoneHref}" && <PhoneIcon className="size-5" /> : <ArrowIcon className="size-4" />}
                  </a>
                ))}
              </ModelFeature>
            ))}
        </div>
      </section>

      {/* Photos de détail de la moto */}
      {page.gallery && page.gallery.length > 0 && (
        <section className="px-4 pt-24 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="mb-8 text-center text-4xl tracking-tight sm:text-5xl">{m.gallery}</h2>
              <ProjectGallery images={page.gallery} alt={`Ecooter ${model.name}`} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Autres modèles */}
      <section className="px-4 pb-20 pt-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-4xl tracking-tight sm:text-5xl">{m.others}</h2>
              <Link href={`${base}/ecooter`} className="group inline-flex items-center gap-2 text-sm font-semibold text-accent">
                {m.backAll}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <Reveal className="mt-10">
            <div className="swipe-row swipe-cards grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={modelHref(lang, o.id)}
                  className="glass group flex h-full flex-col rounded-3xl p-4 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="overflow-hidden rounded-2xl bg-accent-soft/60 p-2">
                    <Image
                      src={o.photo}
                      unoptimized={o.photo.startsWith("/api/")}
                      alt=""
                      width={400}
                      height={400}
                      sizes="(min-width: 1024px) 200px, 60vw"
                      className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-4 text-2xl tracking-tight">{o.name}</p>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm leading-snug text-muted">{tr(o.tagline, lang)}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                    {m.view}
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title={page.cta.title[lang]}
        subtitle={page.cta.subtitle[lang]}
        primary={{ href: mailto(subject, "", site.email), label: m.trial }}
        secondary={{ href: `${base}/contact`, label: dict.nav.contact }}
      />
    </>
  );
}
