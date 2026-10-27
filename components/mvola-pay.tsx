"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { ArrowIcon, CheckIcon, PhoneIcon } from "./icons";
import { fieldClass } from "./quote-form";

type Dict = Dictionary["checkout"];
type Phase = "form" | "starting" | "pending" | "paid" | "failed" | "timeout" | "error";

const MSISDN = /^03[48]\d{7}$/;
const POLL_MS = 3000;
const TIMEOUT_MS = 3 * 60 * 1000;

/**
 * Paiement MVola depuis la commande : le client saisit son numéro, reçoit une demande de
 * confirmation sur son téléphone, et cette page interroge le statut jusqu'au résultat. Le montant est
 * recalculé côté serveur à partir du panier ; ici on n'envoie que les lignes (id, quantité).
 */
export function MvolaPay({
  dict,
  reference,
  lines,
  amountLabel,
  onPaid,
}: {
  dict: Dict;
  reference: string;
  lines: { id: string; qty: number; o?: Record<string, string> }[];
  amountLabel: string;
  onPaid: (transactionId: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("form");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const attempt = useRef(1);
  const timers = useRef<{ poll?: number; stop?: number }>({});

  const clean = phone.replace(/[\s.-]/g, "");
  const valid = MSISDN.test(clean);

  const stop = useCallback(() => {
    window.clearInterval(timers.current.poll);
    window.clearTimeout(timers.current.stop);
  }, []);
  useEffect(() => stop, [stop]);

  const watch = useCallback(
    (id: string) => {
      stop();
      timers.current.poll = window.setInterval(async () => {
        try {
          const res = await fetch(`/api/mvola/status?id=${encodeURIComponent(id)}`, { cache: "no-store" });
          if (!res.ok) return; // erreur passagère : on réessaie au prochain tour
          const { status } = (await res.json()) as { status: string };
          if (status === "completed") {
            stop();
            setPhase("paid");
            onPaid(id);
          } else if (status === "failed") {
            stop();
            setPhase("failed");
          }
        } catch {
          // réseau instable : on réessaie
        }
      }, POLL_MS);
      timers.current.stop = window.setTimeout(() => {
        stop();
        setPhase("timeout");
      }, TIMEOUT_MS);
    },
    [onPaid, stop],
  );

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setPhase("starting");
    try {
      const res = await fetch("/api/mvola/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: reference, lines, msisdn: clean, attempt: attempt.current }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { id } = (await res.json()) as { id: string };
      setPhase("pending");
      watch(id);
    } catch {
      setPhase("error");
    }
  }

  function retry() {
    attempt.current += 1;
    setPhase("form");
  }

  const box = "rounded-3xl border border-white/70 bg-white/45 p-5 text-left text-ink backdrop-blur-xl sm:p-6";

  return (
    <div aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={phase === "starting" ? "form" : phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={box}
        >
          {(phase === "form" || phase === "starting") && (
            <form method="post" onSubmit={pay} className="grid gap-4" noValidate>
              <label className="grid gap-2 text-sm font-medium">
                {dict.mvolaPhone}
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="034 00 000 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched(true)}
                  aria-invalid={touched && !valid}
                  className={fieldClass}
                />
                <span className={`text-xs ${touched && !valid ? "text-red-700" : "text-muted"}`}>
                  {touched && !valid ? dict.mvolaBadPhone : dict.mvolaPhoneHelp}
                </span>
              </label>
              <button
                type="submit"
                disabled={phase === "starting"}
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent px-6 text-base font-semibold text-on-accent transition-opacity enabled:hover:opacity-90 disabled:opacity-60 sm:w-fit"
              >
                <PhoneIcon className="size-5" />
                {dict.mvolaPayBtn.replace("{amount}", amountLabel)}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}

          {phase === "pending" && (
            <div className="flex items-start gap-4">
              <span className="relative mt-1 grid size-10 shrink-0 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
                <span className="relative grid size-10 place-items-center rounded-full bg-accent text-on-accent">
                  <PhoneIcon className="size-5" />
                </span>
              </span>
              <div>
                <p className="text-lg font-semibold">{dict.mvolaPending}</p>
                <p className="mt-1 text-muted">{dict.mvolaPendingHelp}</p>
              </div>
            </div>
          )}

          {phase === "paid" && (
            <div className="flex items-start gap-4">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 14 }}
                className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-teal text-lime"
              >
                <CheckIcon className="size-5" />
              </motion.span>
              <div>
                <p className="text-lg font-semibold">{dict.mvolaPaid}</p>
                <p className="mt-1 text-muted">{dict.mvolaPaidHelp}</p>
              </div>
            </div>
          )}

          {(phase === "failed" || phase === "timeout" || phase === "error") && (
            <div className="grid gap-4">
              <div>
                <p className="text-lg font-semibold">{dict.mvolaFailed}</p>
                {phase !== "failed" && (
                  <p className="mt-1 text-muted">{phase === "timeout" ? dict.mvolaTimeout : dict.mvolaError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={retry}
                className="inline-flex h-12 w-fit items-center rounded-full bg-accent px-6 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
              >
                {dict.mvolaRetry}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
