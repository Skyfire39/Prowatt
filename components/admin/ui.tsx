import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowLeftIcon } from "./icons";

/* ───────────── Mise en page ───────────── */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  back,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link href={back.href} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink">
          <ArrowLeftIcon className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="text-balance text-4xl leading-tight tracking-[-0.035em] sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-lg leading-relaxed text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = "",
  flush = false,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Sans marge intérieure (tableaux pleine largeur). */
  flush?: boolean;
}) {
  return (
    <section className={`glass rounded-3xl ${className}`}>
      {(title || actions) && (
        <div className={`flex flex-wrap items-center justify-between gap-3 ${flush ? "px-6 pt-6 sm:px-7 sm:pt-7" : "px-6 pt-6 sm:px-7 sm:pt-7"}`}>
          <div>
            {title && <h2 className="text-xl tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={flush ? "mt-4 pb-2" : "p-6 sm:p-7 " + (title || actions ? "pt-5 sm:pt-5" : "")}>{children}</div>
    </section>
  );
}

/* ───────────── Boutons ───────────── */

const btnBase =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50";
const btnSizes = { md: "h-11 px-5 text-sm", sm: "h-9 px-4 text-[13px]", icon: "size-9 text-sm" };
const btnVariants = {
  primary: "bg-accent text-on-accent shadow-sm hover:opacity-90",
  lime: "bg-lime text-teal hover:opacity-90",
  soft: "glass-chip text-ink hover:bg-accent-soft",
  ghost: "text-muted hover:bg-accent-soft hover:text-ink",
  danger: "bg-red-600/10 text-red-700 hover:bg-red-600 hover:text-white",
};
export type BtnVariant = keyof typeof btnVariants;
export const btn = (variant: BtnVariant = "primary", size: keyof typeof btnSizes = "md") =>
  `${btnBase} ${btnSizes[size]} ${btnVariants[variant]}`;

export function LinkBtn({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: BtnVariant; size?: keyof typeof btnSizes }) {
  return <Link {...props} className={`${btn(variant, size)} ${className}`} />;
}

/* ───────────── Champs de formulaire ───────────── */

export const inputClass =
  "h-11 rounded-xl border border-line bg-white/70 px-3.5 text-sm text-ink outline-none transition placeholder:text-muted/55 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15 disabled:opacity-60";
export const textareaClass = `${inputClass} h-auto min-h-24 resize-y py-3 leading-relaxed`;
export const selectClass = `${inputClass} appearance-none bg-[length:1rem] bg-[position:right_0.9rem_center] bg-no-repeat pr-9 [background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23175c55' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]`;

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
  required,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={`grid content-start gap-1.5 text-sm font-medium ${className}`}>
      <span>
        {label}
        {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
      </span>
      {children}
      {error ? <span className="text-xs font-normal text-red-700">{error}</span> : hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

/** Interrupteur (case à cocher stylée). */
export function Toggle({
  name,
  label,
  defaultChecked,
  checked,
  onChange,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  /** Mode contrôlé (composants client) : `checked` + `onChange`. */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  hint?: string;
}) {
  const state = checked === undefined ? { defaultChecked } : { checked, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.checked) };
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} {...state} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-accent/25" />
      <span className="text-sm font-medium">
        {label}
        {hint && <span className="block text-xs font-normal text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/* ───────────── Badges, statistiques, vides ───────────── */

const tones = {
  neutral: "bg-ink/8 text-ink",
  lime: "bg-lime/70 text-teal",
  teal: "bg-teal text-lime",
  amber: "bg-amber-400/25 text-amber-800",
  red: "bg-red-500/15 text-red-700",
  blue: "bg-sky-500/15 text-sky-800",
};
export type Tone = keyof typeof tones;

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: "default" | "teal" | "lime";
}) {
  const surface = tone === "teal" ? "glass-teal" : tone === "lime" ? "glass-lime" : "glass";
  return (
    <div className={`${surface} relative overflow-hidden rounded-3xl p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-medium ${tone === "teal" ? "text-white/75" : "text-muted"}`}>{label}</p>
        <span className={`grid size-10 place-items-center rounded-2xl ${tone === "teal" ? "bg-lime text-teal" : "bg-accent text-on-accent"}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight sm:text-[2rem]">{value}</p>
      {hint && <p className={`mt-1 text-sm ${tone === "teal" ? "text-white/70" : "text-muted"}`}>{hint}</p>}
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent">{icon}</span>
      <p className="mt-2 text-xl tracking-tight">{title}</p>
      {text && <p className="max-w-sm text-muted">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/* ───────────── Tableaux ───────────── */

export function DataTable({ head, children, className = "" }: { head: (string | { label: string; right?: boolean })[]; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {head.map((h) => {
              const o = typeof h === "string" ? { label: h, right: false } : h;
              return (
                <th
                  key={o.label}
                  scope="col"
                  className={`whitespace-nowrap border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted first:pl-7 last:pr-7 ${o.right ? "text-right" : ""}`}
                >
                  {o.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0 [&>tr]:transition-colors [&>tr:hover]:bg-accent-soft/40">{children}</tbody>
      </table>
    </div>
  );
}

export const Td = ({ className = "", right, ...props }: ComponentProps<"td"> & { right?: boolean }) => (
  <td {...props} className={`border-b border-line/70 px-5 py-3.5 align-middle first:pl-7 last:pr-7 ${right ? "whitespace-nowrap text-right tabular-nums" : ""} ${className}`} />
);

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (page: number) => string }) {
  if (pages <= 1) return null;
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const list = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 px-7 py-4 text-sm">
      <p className="text-muted">
        Page {page} sur {pages}
      </p>
      <div className="flex items-center gap-1.5">
        {list.map((n, i) => (
          <span key={n} className="flex items-center gap-1.5">
            {i > 0 && n - list[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
            <Link
              href={hrefFor(n)}
              aria-current={n === page ? "page" : undefined}
              className={`grid size-9 place-items-center rounded-full font-semibold tabular-nums transition-colors ${
                n === page ? "bg-accent text-on-accent" : "glass-chip hover:bg-accent-soft"
              }`}
            >
              {n}
            </Link>
          </span>
        ))}
      </div>
    </nav>
  );
}

/** Barre de recherche et de filtres : un formulaire GET, donc des adresses partageables. */
export function FilterBar({ children, action }: { children: ReactNode; action: string }) {
  return (
    <form action={action} method="get" className="flex flex-wrap items-end gap-3 px-6 pt-6 sm:px-7">
      {children}
      <button type="submit" className={btn("soft", "md")}>
        Filtrer
      </button>
    </form>
  );
}

/* ───────────── Messages ───────────── */

const flashMessages: Record<string, { tone: "ok" | "err"; text: string }> = {
  created: { tone: "ok", text: "Élément créé avec succès." },
  saved: { tone: "ok", text: "Modifications enregistrées." },
  "cat-name": { tone: "err", text: "Le nom de la catégorie doit contenir au moins 2 caractères." },
  "cat-reserved": { tone: "err", text: "Cette catégorie est réservée aux motos : vous pouvez la renommer, pas la supprimer." },
  reset: { tone: "ok", text: "Contenu d'origine rétabli." },
  deleted: { tone: "ok", text: "Élément supprimé." },
  converted: { tone: "ok", text: "Conversion effectuée." },
  paid: { tone: "ok", text: "Paiement enregistré." },
  cancelled: { tone: "ok", text: "Facture annulée." },
  badpromo: { tone: "err", text: "L'ancien prix doit être supérieur au prix actuel." },
  overpay: { tone: "err", text: "Le montant dépasse le reste à payer." },
  notissued: { tone: "err", text: "Émettez d'abord la facture pour enregistrer un paiement." },
  issued: { tone: "ok", text: "Document émis." },
  "nl-synced": { tone: "ok", text: "Abonné envoyé à Mailchimp." },
  "nl-failed": { tone: "err", text: "Mailchimp a refusé l'envoi : le motif est indiqué dans la colonne « Mailchimp »." },
  "nl-unsub": { tone: "ok", text: "Abonné désinscrit (et signalé à Mailchimp)." },
  "nl-resub": { tone: "ok", text: "Abonné réinscrit." },
  password: { tone: "ok", text: "Mot de passe mis à jour." },
  denied: { tone: "err", text: "Vous n'avez pas le droit d'accéder à cette page." },
  notfound: { tone: "err", text: "Élément introuvable." },
  locked: { tone: "err", text: "Ce document n'est plus modifiable." },
  inuse: { tone: "err", text: "Suppression impossible : cet élément est utilisé ailleurs (des produits utilisent cette catégorie)." },
};

export function Flash({ code, denied }: { code?: string; denied?: boolean }) {
  const key = denied ? "denied" : code;
  const msg = key ? flashMessages[key] : undefined;
  if (!msg) return null;
  return (
    <div
      role="status"
      className={`mb-6 rounded-2xl border px-5 py-3.5 text-sm font-medium ${
        msg.tone === "ok" ? "border-lime bg-lime/40 text-teal" : "border-red-300 bg-red-50 text-red-800"
      }`}
    >
      {msg.text}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
      {message}
    </p>
  );
}
