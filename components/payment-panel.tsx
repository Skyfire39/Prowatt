"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { PaymentConfig } from "@/lib/site";
import { ArrowIcon, BuildingIcon, CardIcon, CheckIcon, CopyIcon, PhoneIcon } from "./icons";

export type PayMethod = "mvola" | "bank" | "card";
export const payMethods: {
  id: PayMethod;
  icon: typeof CardIcon;
  title: "payMvola" | "payBank" | "payCard";
  text: "payMvolaText" | "payBankText" | "payCardText";
}[] = [
  { id: "mvola", icon: PhoneIcon, title: "payMvola", text: "payMvolaText" },
  { id: "bank", icon: BuildingIcon, title: "payBank", text: "payBankText" },
  { id: "card", icon: CardIcon, title: "payCard", text: "payCardText" },
];

type Dict = Dictionary["checkout"];

function CopyButton({ value, dict }: { value: string; dict: Dict }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 1800);
    } catch {
      // Presse-papiers indisponible : la valeur reste sélectionnable à la main.
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${done ? dict.copied : dict.copy} : ${value}`}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-3 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-on-accent"
    >
      {done ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      {done ? dict.copied : dict.copy}
    </button>
  );
}

function Row({ label, value, dict, copy = true }: { label: string; value: string; dict: Dict; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-4 py-3">
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
        <dd className="mt-0.5 break-words font-semibold tabular-nums">{value}</dd>
      </div>
      {copy && <CopyButton value={value} dict={dict} />}
    </div>
  );
}

/**
 * Consignes de paiement du mode choisi. Aucune donnée bancaire n'est saisie ici : MVola et virement
 * affichent les coordonnées de Prowatt (à copier), la carte passe par le lien de paiement sécurisé
 * du prestataire. Un champ non renseigné dans la config est simplement omis.
 */
export function PaymentPanel({
  method,
  amount,
  reference,
  dict,
  config,
}: {
  method: PayMethod;
  amount: string;
  reference: string;
  dict: Dict;
  config: PaymentConfig;
}) {
  const fill = (t: string) => t.replace("{amount}", amount).replace("{ref}", reference);
  const mv = config.mvola;
  const bk = config.bank;

  const rows: { label: string; value: string; copy?: boolean }[] =
    method === "mvola"
      ? [
          { label: dict.mvolaNumber, value: mv.number },
          { label: dict.mvolaHolder, value: mv.holder, copy: false },
        ]
      : method === "bank"
        ? [
            { label: dict.bankName, value: bk.bank, copy: false },
            { label: dict.bankHolder, value: bk.holder },
            { label: dict.bankAccount, value: bk.account },
          ]
        : [];
  const filled = rows.filter((r) => r.value);
  const intro = method === "mvola" ? fill(dict.mvolaIntro) : method === "bank" ? fill(dict.bankIntro) : dict.cardIntro;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={method}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-white/70 bg-white/45 p-5 text-left text-ink backdrop-blur-xl sm:p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{dict.payHow}</p>
        <p className="mt-2 leading-relaxed">{intro}</p>

        {filled.length > 0 && (
          <dl className="mt-4 grid gap-2">
            {filled.map((r) => (
              <Row key={r.label} label={r.label} value={r.value} dict={dict} copy={r.copy} />
            ))}
          </dl>
        )}

        {method === "card" && config.card.url ? (
          <a
            href={config.card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
          >
            <CardIcon className="size-5" />
            {dict.cardPay}
            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        ) : (
          method !== "card" &&
          filled.length === 0 && <p className="mt-3 text-sm leading-relaxed text-muted">{dict.payTbd}</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
