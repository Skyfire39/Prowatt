import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "./icons";
import { Reveal } from "./motion";

const btn =
  "group inline-flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-medium transition-transform hover:scale-[1.03] active:scale-95";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "glass" | "lime";
  arrow?: boolean;
  external?: boolean;
}) {
  const style =
    variant === "primary"
      ? "bg-accent text-on-accent shadow-lg shadow-teal/25"
      : variant === "lime"
        ? "bg-lime text-teal"
        : "glass";
  const content = (
    <>
      {children}
      {arrow && <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />}
    </>
  );
  const cls = `${btn} ${style}`;
  if (external || href.startsWith("mailto:") || href.startsWith("tel:")) {
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

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <h2 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-5 text-lg leading-relaxed text-muted">{subtitle}</p>}
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
    <section className="px-4 pb-12 pt-36 sm:px-6 sm:pt-44">
      <Reveal y={20} className="mx-auto max-w-4xl text-center">
        <p className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">
          {eyebrow}
        </p>
        <h1 className="text-balance text-5xl font-semibold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
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
        <div className="glass-strong relative overflow-hidden rounded-[2.75rem] p-10 text-center sm:p-16">
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-lime/50 blur-3xl dark:bg-lime/15"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{subtitle}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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
        </div>
      </Reveal>
    </section>
  );
}
