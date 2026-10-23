import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "./icons";
import { Reveal } from "./motion";

const btn =
  "group inline-flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-medium transition-opacity hover:opacity-85";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "glass" | "lime";
  arrow?: boolean;
}) {
  const style =
    variant === "primary"
      ? "bg-accent text-on-accent"
      : variant === "lime"
        ? "bg-lime text-teal"
        : "bg-panel text-ink";
  const content = (
    <>
      {children}
      {arrow && <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />}
    </>
  );
  const cls = `${btn} ${style}`;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={cls}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}

/**
 * Photo de panneaux solaires recadrée. Une seule image source, plusieurs cadrages :
 * `pos` règle le point focal, `zoom` agrandit le cadrage.
 */
export function Photo({
  pos = "50% 50%",
  zoom = 1,
  className = "",
  priority = false,
  sizes = "(min-width: 1152px) 1152px, 100vw",
  alt = "",
}: {
  pos?: string;
  zoom?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  alt?: string;
}) {
  return (
    <div className={`${className.includes("absolute") ? "" : "relative"} overflow-hidden ${className}`}>
      <Image
        src="/images/solar-panels.jpg"
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: pos, transform: `scale(${zoom})`, transformOrigin: pos }}
      />
    </div>
  );
}

/** En-tête de section centré, grands titres serrés. */
export function SectionHead({
  eyebrow,
  title,
  subtitle,
  light = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <Reveal className="mx-auto max-w-3xl text-center">
      <p className={`eyebrow ${light ? "!text-lime" : ""}`}>{eyebrow}</p>
      <h2 className="mt-3 text-balance text-5xl leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
        {title}
      </h2>
      {subtitle && (
        <p className={`mx-auto mt-5 max-w-2xl text-xl leading-relaxed ${light ? "text-white/75" : "text-muted"}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  photo,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  photo?: { pos: string; zoom?: number };
  children?: ReactNode;
}) {
  return (
    <section className="px-4 pb-12 pt-32 sm:px-6 sm:pt-40">
      <Reveal y={16} className="mx-auto max-w-4xl text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-balance text-6xl leading-[1.02] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted">{subtitle}</p>
        )}
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </Reveal>
      {photo && (
        <Reveal y={30} delay={0.1} className="mx-auto mt-14 max-w-6xl">
          <Photo
            pos={photo.pos}
            zoom={photo.zoom}
            className="h-72 rounded-3xl sm:h-[28rem]"
            priority
          />
        </Reveal>
      )}
    </section>
  );
}

export function CtaBand({
  title,
  subtitle,
  primary,
  secondary,
}: {
  title: string;
  subtitle: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative isolate overflow-hidden rounded-3xl bg-teal px-6 py-20 text-center text-white sm:py-28">
          <Photo pos="30% 40%" zoom={1.3} className="absolute inset-0 -z-10 opacity-25" />
          <h2 className="mx-auto max-w-3xl text-balance text-5xl leading-[1.04] tracking-[-0.04em] sm:text-7xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-xl text-white/75">{subtitle}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href={primary.href} variant="lime" arrow>
              {primary.label}
            </ButtonLink>
            {secondary && (
              <Link
                href={secondary.href}
                className={`${btn} border border-white/40 text-white`}
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
