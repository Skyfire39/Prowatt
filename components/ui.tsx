import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "./icons";
import { Reveal } from "./motion";

const btn =
  "group inline-flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-medium transition-colors";

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
      ? "bg-accent text-on-accent hover:opacity-85"
      : variant === "lime"
        ? "bg-lime text-teal hover:opacity-85"
        : "border border-ink/30 text-ink hover:border-ink hover:bg-accent-soft";
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

/** En-tête de section éditorial : titre à gauche, texte d'appui à droite. */
export function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="grid gap-6 border-t border-line pt-8 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-5 text-balance text-5xl leading-[1] tracking-tight sm:text-6xl">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-lg leading-relaxed text-muted lg:col-span-5 lg:self-end">{subtitle}</p>
      )}
    </Reveal>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="px-4 pb-16 pt-36 sm:px-6 sm:pt-44">
      <Reveal y={16} className="mx-auto max-w-6xl">
        <p className="eyebrow">{eyebrow}</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-14">
          <h1 className="text-balance text-6xl leading-[0.96] tracking-tight sm:text-8xl lg:col-span-8">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg leading-relaxed text-muted lg:col-span-4 lg:self-end">{subtitle}</p>
          )}
        </div>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </Reveal>
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
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="mx-auto max-w-6xl">
        <div className="grid gap-10 rounded-3xl bg-band p-8 text-on-band sm:p-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h2 className="text-balance text-5xl leading-[0.98] tracking-tight sm:text-7xl">{title}</h2>
            <p className="mt-5 max-w-xl text-lg opacity-80">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <ButtonLink href={primary.href} arrow>
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink href={secondary.href} variant="glass">
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
