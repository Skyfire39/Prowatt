"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { cart, formatPrice, useCart } from "@/lib/cart";
import { tr } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { mailto, whatsappHref, type PaymentConfig } from "@/lib/site";
import { ProductThumb } from "./cart-drawer";
import { ArrowIcon, BagIcon, CheckIcon, MailIcon, WhatsAppIcon } from "./icons";
import { useSite } from "./catalog-provider";
import { MvolaPay } from "./mvola-pay";
import { PaymentPanel, payMethods, type PayMethod } from "./payment-panel";
import { fieldClass } from "./quote-form";

type Step = "form" | "review" | "sent";
type Order = {
  ref: string;
  name: string;
  phone: string;
  email: string;
  mode: "pickup" | "ship";
  address: string;
  city: string;
  note: string;
  pay: PayMethod;
  /** Total à régler, figé à la validation (le panier est vidé à l'envoi). */
  total: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

function newRef() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PW-${ymd}-${rnd}`;
}

/**
 * Commande en trois étapes : coordonnées → relecture → envoi.
 * Sans paiement en ligne : la commande part par WhatsApp ou e-mail et l'équipe confirme
 * disponibilité, prix final et paiement. Le panier n'est vidé qu'au moment de l'envoi.
 */
export function Checkout({
  lang,
  dict,
  currency,
  shopHref,
  pickupAddress,
  payment,
  mvolaLive = false,
}: {
  lang: Locale;
  dict: Dictionary["checkout"];
  currency: string;
  shopHref: string;
  pickupAddress: string;
  payment: PaymentConfig;
  /** Les clés MVola sont configurées côté serveur : on propose le paiement direct. */
  mvolaLive?: boolean;
}) {
  const { views, subtotal } = useCart();
  const site = useSite();
  const [step, setStep] = useState<Step>("form");
  const [mode, setMode] = useState<"pickup" | "ship">("pickup");
  const [pay, setPay] = useState<PayMethod>("mvola");
  // Identifiant de la transaction MVola une fois le paiement confirmé par MVola.
  const [paidTx, setPaidTx] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [draft, setDraft] = useState<Omit<Order, "ref" | "mode" | "pay" | "total">>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    note: "",
  });
  const money = (n: number) => formatPrice(n, lang, currency);
  const set = (k: keyof typeof draft) => (e: { target: { value: string } }) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const ref = order?.ref ?? newRef();
    setSaving(true);
    // La commande est enregistrée côté serveur avant l'étape de paiement, pour que MVola puisse s'y rattacher.
    // Si l'enregistrement échoue ou tarde, le client peut quand même envoyer sa commande par WhatsApp ou e-mail.
    try {
      await Promise.race([
        fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ref,
            lang,
            name: draft.name,
            phone: draft.phone,
            email: draft.email,
            mode,
            address: draft.address,
            city: draft.city,
            note: draft.note,
            pay,
            lines: views.map((v) => ({ id: v.product.id, qty: v.qty })),
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
    } catch {
      /* hors ligne : on continue */
    }
    setSaving(false);
    setOrder({ ...draft, mode, pay, total: subtotal, ref });
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function message(o: Order) {
    const lines = views.map((v) => `- ${v.qty} × ${tr(v.product.name, lang)} — ${money(v.total)}`);
    return [
      dict.intro.replace("{ref}", o.ref),
      "",
      `${dict.msgClient} : ${[o.name, o.phone, o.email].filter(Boolean).join(" · ")}`,
      `${dict.msgReception} : ${
        o.mode === "pickup" ? `${dict.pickup} (${pickupAddress})` : `${dict.ship} — ${o.address}, ${o.city}`
      }`,
      "",
      `${dict.msgItems} :`,
      ...lines,
      "",
      `${dict.msgTotal} : ${money(subtotal)}`,
      paidTx
        ? dict.msgPaid.replace("{id}", paidTx)
        : `${dict.msgPayment} : ${dict[payMethods.find((m) => m.id === o.pay)!.title]}`,
      ...(o.note ? ["", `${dict.msgNote} : ${o.note}`] : []),
    ].join("\n");
  }

  function sent() {
    cart.clear();
    setStep("sent");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Panier vide (et commande pas encore envoyée)
  if (step !== "sent" && views.length === 0) {
    return (
      <div className="glass mx-auto grid max-w-xl justify-items-center gap-3 rounded-3xl p-10 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-accent-soft text-accent">
          <BagIcon className="size-9" />
        </span>
        <p className="text-3xl tracking-tight">{dict.emptyTitle}</p>
        <p className="text-muted">{dict.emptyText}</p>
        <Link href={shopHref} className="mt-3 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent">
          {dict.back}
          <ArrowIcon className="size-4" />
        </Link>
      </div>
    );
  }

  if (step === "sent" && order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="glass-lime mx-auto grid max-w-xl justify-items-center gap-3 rounded-3xl p-10 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.15 }}
          className="grid size-20 place-items-center rounded-full bg-teal text-lime"
        >
          <CheckIcon className="size-10" />
        </motion.span>
        <p className="text-4xl tracking-tight">{dict.thanksTitle}</p>
        <p className="rounded-full bg-white/60 px-5 py-2 text-sm font-semibold tabular-nums">
          {dict.ref} : {order.ref}
        </p>
        <p className="max-w-md opacity-80">{dict.thanksText}</p>
        <div className="mt-2 w-full">
          {paidTx ? (
            <p className="rounded-2xl bg-white/60 px-5 py-3 text-sm font-semibold">
              {dict.mvolaPaid} · {paidTx}
            </p>
          ) : (
            <PaymentPanel
              method={order.pay}
              amount={money(order.total)}
              reference={order.ref}
              dict={dict}
              config={payment}
            />
          )}
        </div>
        <Link href={shopHref} className="mt-3 inline-flex h-12 items-center gap-2 rounded-full bg-teal px-6 text-sm font-semibold text-white">
          {dict.back}
          <ArrowIcon className="size-4" />
        </Link>
      </motion.div>
    );
  }

  const stepper = (
    <ol className="mb-8 flex items-center gap-3 text-sm font-semibold" aria-label={dict.eyebrow}>
      {[dict.stepContact, dict.stepSend].map((label, i) => {
        const on = (step === "form" ? 0 : 1) >= i;
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={`grid size-8 place-items-center rounded-full text-xs transition-colors ${
                on ? "bg-accent text-on-accent" : "glass-chip text-muted"
              }`}
            >
              {i === 0 && step === "review" ? <CheckIcon className="size-4" /> : i + 1}
            </span>
            <span className={on ? "text-ink" : "text-muted"}>{label}</span>
            {i === 0 && <span className="h-px w-8 bg-line sm:w-14" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );

  const summary = (
    <aside className="glass rounded-3xl p-6 lg:sticky lg:top-28">
      <h2 className="text-2xl tracking-tight">{dict.summary}</h2>
      <ul className="mt-5 space-y-4">
        {views.map(({ product, qty, total }) => (
          <li key={product.id} className="flex gap-3">
            <div className="relative">
              <ProductThumb src={product.image} className="size-16" />
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-5 text-on-accent tabular-nums">
                {qty}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug">{tr(product.name, lang)}</p>
              <p className="mt-0.5 text-sm tabular-nums text-muted">{money(total)}</p>
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">{dict.subtotal}</dt>
          <dd className="font-medium tabular-nums">{money(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">{dict.shipping}</dt>
          <dd className="font-medium">{dict.shippingTbd}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <dt className="font-semibold">{dict.total}</dt>
          <dd className="text-3xl font-semibold tabular-nums tracking-tight">{money(subtotal)}</dd>
        </div>
      </dl>
    </aside>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
      <div className="lg:col-span-7">
        {stepper}
        <AnimatePresence mode="wait" initial={false}>
          {step === "form" ? (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease }}
              className="glass grid gap-8 rounded-3xl p-6 sm:p-8"
            >
              <fieldset className="grid gap-5">
                <legend className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">{dict.contactTitle}</legend>
                <label className="grid gap-2 text-sm font-medium">
                  {dict.name} <span className="sr-only">*</span>
                  <input required autoComplete="name" value={draft.name} onChange={set("name")} className={fieldClass} />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    {dict.phone} <span className="sr-only">*</span>
                    <input required type="tel" autoComplete="tel" inputMode="tel" value={draft.phone} onChange={set("phone")} className={fieldClass} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    {dict.email}
                    <input type="email" autoComplete="email" value={draft.email} onChange={set("email")} className={fieldClass} />
                  </label>
                </div>
              </fieldset>

              <fieldset className="grid gap-4 border-t border-line pt-8">
                <legend className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">{dict.deliveryTitle}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["pickup", "ship"] as const).map((m) => (
                    <label key={m} className="block cursor-pointer">
                      <input
                        type="radio"
                        name="mode"
                        value={m}
                        checked={mode === m}
                        onChange={() => setMode(m)}
                        className="peer sr-only"
                      />
                      <span className="flex min-h-16 flex-col justify-center rounded-2xl border border-line bg-white/50 px-5 py-3 backdrop-blur-md transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30 hover:border-accent">
                        <span className="font-semibold">{m === "pickup" ? dict.pickup : dict.ship}</span>
                        <span className="text-sm opacity-75">{m === "pickup" ? dict.pickupText : dict.shipText}</span>
                      </span>
                    </label>
                  ))}
                </div>

                <AnimatePresence initial={false}>
                  {mode === "ship" && (
                    <motion.div
                      key="ship"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-5 pt-2 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                          {dict.address} <span className="sr-only">*</span>
                          <input required autoComplete="street-address" value={draft.address} onChange={set("address")} className={fieldClass} />
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                          {dict.city} <span className="sr-only">*</span>
                          <input required autoComplete="address-level2" value={draft.city} onChange={set("city")} className={fieldClass} />
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <label className="grid gap-2 text-sm font-medium">
                  {dict.noteLabel}
                  <textarea rows={3} value={draft.note} onChange={set("note")} className={`${fieldClass} resize-none`} />
                </label>
              </fieldset>

              <fieldset className="grid gap-4 border-t border-line pt-8">
                <legend className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">{dict.payTitle}</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {payMethods.map((m) => (
                    <label key={m.id} className="block cursor-pointer">
                      <input
                        type="radio"
                        name="pay"
                        value={m.id}
                        checked={pay === m.id}
                        onChange={() => setPay(m.id)}
                        className="peer sr-only"
                      />
                      <span className="flex h-full min-h-24 flex-col gap-2 rounded-2xl border border-line bg-white/50 px-4 py-3.5 backdrop-blur-md transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30 hover:border-accent">
                        <m.icon className="size-6" />
                        <span>
                          <span className="block font-semibold">{dict[m.title]}</span>
                          <span className="block text-sm opacity-75">{dict[m.text]}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted">{dict.payNote}</p>
              </fieldset>

              <button
                type="submit"
                disabled={saving}
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent px-8 text-base font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-fit"
              >
                {dict.place}
                <ArrowIcon className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.form>
          ) : (
            order && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.35, ease }}
                className="glass grid gap-6 rounded-3xl p-6 sm:p-8"
              >
                <div>
                  <h2 className="text-3xl tracking-tight">{dict.reviewTitle}</h2>
                  <p className="mt-2 leading-relaxed text-muted">{dict.reviewText}</p>
                </div>
                <p className="w-fit rounded-full bg-accent-soft px-5 py-2 text-sm font-semibold tabular-nums">
                  {dict.ref} : {order.ref}
                </p>

                {order.pay === "mvola" && mvolaLive ? (
                  <MvolaPay
                    key={order.ref}
                    dict={dict}
                    reference={order.ref}
                    lines={views.map((v) => ({ id: v.product.id, qty: v.qty }))}
                    amountLabel={money(order.total)}
                    onPaid={setPaidTx}
                  />
                ) : (
                  <PaymentPanel
                    method={order.pay}
                    amount={money(order.total)}
                    reference={order.ref}
                    dict={dict}
                    config={payment}
                  />
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href={whatsappHref(message(order), site.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={sent}
                    className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-teal px-6 text-base font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <WhatsAppIcon className="size-5" />
                    {dict.sendWhatsapp}
                  </a>
                  <a
                    href={mailto(dict.subject.replace("{ref}", order.ref), message(order), site.email)}
                    onClick={sent}
                    className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-lime px-6 text-base font-semibold text-teal transition-opacity hover:opacity-90"
                  >
                    <MailIcon className="size-5" />
                    {dict.sendEmail}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-fit text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  {dict.edit}
                </button>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      <div className="lg:col-span-5">{summary}</div>
    </div>
  );
}
