"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { startTransition, useActionState, useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { BagIcon, CloseIcon, MenuIcon, UsersIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import {
  BoxIcon,
  DashboardIcon,
  HistoryIcon,
  ImageIcon,
  InvoiceIcon,
  LogoutIcon,
  QuoteIcon,
  ScooterIcon,
  SlidersIcon,
  StarIcon,
  UserCogIcon,
} from "./icons";
import type { FormState } from "@/lib/validate";
import { btn, type BtnVariant } from "./ui";

const icons = {
  dashboard: DashboardIcon,
  orders: BagIcon,
  quotes: QuoteIcon,
  invoices: InvoiceIcon,
  customers: UsersIcon,
  products: BoxIcon,
  motos: ScooterIcon,
  content: ImageIcon,
  featured: StarIcon,
  users: UserCogIcon,
  settings: SlidersIcon,
  audit: HistoryIcon,
};
export type NavIcon = keyof typeof icons;
export type NavGroup = { label: string; items: { href: string; label: string; icon: NavIcon; badge?: number }[] };

function NavList({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation de l'administration" className="grid gap-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{g.label}</p>
          <ul className="grid gap-0.5">
            {g.items.map((it) => {
              const Icon = icons[it.icon];
              const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium transition-colors ${
                      active ? "text-teal" : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-nav-pill"
                        className="absolute inset-0 rounded-full bg-lime shadow-[0_6px_18px_rgb(200_224_162/0.35)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon className="relative size-[18px] shrink-0" />
                    <span className="relative flex-1 truncate">{it.label}</span>
                    {!!it.badge && (
                      <span
                        className={`relative grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold leading-5 tabular-nums ${
                          active ? "bg-teal text-lime" : "bg-lime text-teal"
                        }`}
                      >
                        {it.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-3">
      <Logo variant="mark" className="h-9 w-auto" color="text-lime" />
      <div className="leading-tight">
        <p className="text-base font-semibold tracking-tight">Prowatt</p>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">Administration</p>
      </div>
    </div>
  );
}

function UserCard({ name, roleLabel, logout }: { name: string; roleLabel: string; logout: ReactNode }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="glass-on-teal flex items-center gap-2 rounded-2xl p-2.5">
      <Link href="/admin/compte" aria-label="Mon compte" className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-0.5 transition-colors hover:bg-white/10">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-sm font-bold text-teal">{initials}</span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-white/65">{roleLabel}</p>
        </div>
      </Link>
      {logout}
    </div>
  );
}

/**
 * Cadre de l'administration : barre latérale flottante en verre teinté sur ordinateur,
 * tiroir sur mobile. La déconnexion est un formulaire (action serveur) passé en `logout`.
 */
export function AdminFrame({
  groups,
  user,
  logout,
  children,
}: {
  groups: NavGroup[];
  user: { name: string; roleLabel: string };
  logout: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Le tiroir est ouvert « sur une page » : changer de page le referme sans effet supplémentaire.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-dvh">
      {/* Barre latérale (≥ lg) */}
      <aside className="glass-teal fixed bottom-4 left-4 top-4 z-30 hidden w-64 flex-col gap-4 overflow-hidden rounded-[1.75rem] p-4 lg:flex">
        <Brand />
        <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-width:thin]">
          <NavList groups={groups} />
        </div>
        <UserCard {...user} logout={logout} />
      </aside>

      {/* Barre du haut (mobile) */}
      <div className="sticky top-0 z-30 px-3 pt-3 lg:hidden">
        <div className="glass-nav flex h-14 items-center justify-between rounded-full px-3 pl-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo variant="mark" className="h-7 w-auto" />
            <span className="text-sm font-semibold tracking-tight">Administration</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            className="glass-chip grid size-10 place-items-center rounded-full"
          >
            <MenuIcon className="size-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-teal/40 backdrop-blur-sm"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
              className="glass-teal absolute bottom-3 left-3 top-3 flex w-[min(20rem,calc(100%-1.5rem))] flex-col gap-4 overflow-hidden rounded-[1.75rem] p-4"
            >
              <div className="flex items-center justify-between">
                <Brand />
                <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le menu" className="glass-on-teal grid size-9 place-items-center rounded-full">
                  <CloseIcon className="size-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <NavList groups={groups} onNavigate={() => setOpen(false)} />
              </div>
              <UserCard {...user} logout={logout} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="px-4 pb-20 pt-6 sm:px-6 lg:pl-[18.5rem] lg:pr-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

export function LogoutButton() {
  return (
    <button
      type="submit"
      aria-label="Se déconnecter"
      title="Se déconnecter"
      className="grid size-9 shrink-0 place-items-center rounded-full text-white/75 transition-colors hover:bg-white/15 hover:text-white"
    >
      <LogoutIcon className="size-[18px]" />
    </button>
  );
}

/* ───────────── Boutons de formulaire ───────────── */

/**
 * Formulaire branché sur une action serveur, SANS la réinitialisation automatique de React 19 :
 * quand le serveur renvoie une erreur de validation, l'utilisateur garde tout ce qu'il a saisi.
 * `onSubmit` transmet aussi le bouton d'envoi cliqué (ex. « Enregistrer » ou « Enregistrer et émettre »).
 */
export function useActionForm(action: (prev: FormState, fd: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, null as FormState);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(fd));
  };
  return { state, onSubmit, pending };
}

/** Bouton d'envoi : se désactive et affiche un indicateur pendant l'action serveur. */
export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  pendingLabel,
  pending: pendingProp,
  ...props
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: "md" | "sm" | "icon";
  className?: string;
  pendingLabel?: string;
  /** État d'attente fourni par `useActionForm` ; sans lui, on lit celui du formulaire parent. */
  pending?: boolean;
} & Omit<React.ComponentProps<"button">, "type">) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button {...props} type="submit" disabled={pending || props.disabled} className={`${btn(variant, size)} ${className}`}>
      {pending && <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/**
 * Bouton qui demande confirmation dans une boîte de dialogue avant d'envoyer le formulaire parent
 * (suppression, annulation…). Supporte `formAction` comme un bouton d'envoi classique.
 */
export function ConfirmButton({
  children,
  title,
  message,
  confirmLabel = "Confirmer",
  variant = "danger",
  size = "md",
  formAction,
  className = "",
}: {
  children: ReactNode;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: BtnVariant;
  size?: "md" | "sm" | "icon";
  formAction?: (formData: FormData) => void | Promise<void>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const submitter = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${btn(variant, size)} ${className}`}>
        {children}
      </button>
      <button ref={submitter} type="submit" formAction={formAction} hidden tabIndex={-1} aria-hidden="true" />
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[80] grid place-items-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 bg-teal/40 backdrop-blur-sm"
                />
                <motion.div
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="confirm-title"
                  initial={{ opacity: 0, scale: 0.94, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="glass-strong relative w-full max-w-md rounded-3xl p-7 text-ink"
                >
                  <h2 id="confirm-title" className="text-2xl tracking-tight">
                    {title}
                  </h2>
                  <p className="mt-2 leading-relaxed text-muted">{message}</p>
                  <div className="mt-6 flex justify-end gap-2">
                    <button type="button" onClick={() => setOpen(false)} className={btn("soft")}>
                      Annuler
                    </button>
                    <button
                      type="button"
                      autoFocus
                      onClick={() => {
                        setOpen(false);
                        const b = submitter.current;
                        b?.form?.requestSubmit(b);
                      }}
                      className={btn(variant === "danger" ? "primary" : variant)}
                      style={variant === "danger" ? { background: "#b91c1c" } : undefined}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

/** Imprime la page (l'utilisateur choisit « Enregistrer au format PDF »). */
export function PrintButton({ children = "Imprimer / PDF" }: { children?: ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className={btn("primary")}>
      {children}
    </button>
  );
}
