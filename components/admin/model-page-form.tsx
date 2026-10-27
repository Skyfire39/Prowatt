"use client";

import Image from "next/image";
import { useState } from "react";
import { saveEcooterPageAction, resetEcooterPageAction } from "@/app/admin/(panel)/fiche-modele/actions";
import { LIMITS, type Bi, type EcooterPageContent, type PageBlock, type PageButton } from "@/lib/ecooter-page";
import { ConfirmButton, SubmitButton, useActionForm } from "./client";
import { Field, FormError, Panel, Toggle, btn, inputClass, selectClass, textareaClass } from "./ui";

const move = <T,>(list: T[], i: number, d: -1 | 1) => {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function BiInput({ label, value, onChange, rows, max }: { label: string; value: Bi; onChange: (v: Bi) => void; rows?: number; max: number }) {
  const Tag = rows ? "textarea" : "input";
  const cls = rows ? textareaClass : inputClass;
  return (
    <Field label={label}>
      <Tag
        value={value.fr}
        maxLength={max}
        {...(rows ? { rows } : {})}
        onChange={(e) => onChange({ fr: e.target.value, en: e.target.value })}
        className={cls}
      />
    </Field>
  );
}

const iconBtn = "grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink disabled:opacity-30";

function BlockEditor({
  block,
  index,
  total,
  photo,
  onChange,
  onMove,
  onRemove,
}: {
  block: PageBlock;
  index: number;
  total: number;
  photo: string;
  onChange: (b: PageBlock) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
}) {
  const set = (patch: Partial<PageBlock>) => onChange({ ...block, ...patch });
  const setButton = (i: number, patch: Partial<PageButton>) => set({ buttons: block.buttons.map((b, k) => (k === i ? { ...b, ...patch } : b)) });

  return (
    <section className={`glass rounded-3xl p-5 sm:p-7 ${block.enabled ? "" : "opacity-70"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-bold text-on-accent">{index + 1}</span>
          <h2 className="text-xl tracking-tight">{block.title.fr || "Nouveau bloc"}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className={iconBtn} onClick={() => onMove(-1)} disabled={index === 0} aria-label="Monter ce bloc" title="Monter">
            ↑
          </button>
          <button type="button" className={iconBtn} onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Descendre ce bloc" title="Descendre">
            ↓
          </button>
          <button type="button" className={`${iconBtn} hover:!bg-red-500/10 hover:!text-red-700`} onClick={onRemove} aria-label="Supprimer ce bloc" title="Supprimer">
            ×
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-8 min-[1280px]:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        {/* Visuel : réglage du cadrage */}
        <div className="grid max-w-sm content-start gap-4">
          <div
            role="button"
            tabIndex={0}
            aria-label="Cliquez pour choisir le point de zoom"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              set({ originX: Math.round(((e.clientX - r.left) / r.width) * 100), originY: Math.round(((e.clientY - r.top) / r.height) * 100) });
            }}
            className="relative aspect-[4/3] cursor-crosshair overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(135deg, #175c55 0%, #2f7d6e 52%, #c8e0a2 130%)" }}
          >
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/25" />
            <Image
              src={photo}
              unoptimized={photo.startsWith("/api/")}
              alt=""
              width={500}
              height={500}
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full select-none object-contain"
              style={{ transform: `scale(${block.zoom})`, transformOrigin: `${block.originX}% ${block.originY}%` }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent/60 shadow"
              style={{ left: `${block.originX}%`, top: `${block.originY}%` }}
            />
          </div>
          <p className="text-xs text-muted">Aperçu du cadrage : cliquez sur l&apos;image pour choisir le point sur lequel zoomer.</p>
          <Field label={`Zoom : ×${block.zoom.toFixed(1)}`}>
            <input type="range" min={1} max={3} step={0.1} value={block.zoom} onChange={(e) => set({ zoom: Number(e.target.value) })} className="accent-[#175c55]" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Image à gauche">
              <button type="button" onClick={() => set({ side: "left" })} aria-pressed={block.side === "left"} className={`${btn(block.side === "left" ? "primary" : "soft", "sm")} w-full`}>
                À gauche
              </button>
            </Field>
            <Field label="Image à droite">
              <button type="button" onClick={() => set({ side: "right" })} aria-pressed={block.side === "right"} className={`${btn(block.side === "right" ? "primary" : "soft", "sm")} w-full`}>
                À droite
              </button>
            </Field>
          </div>
          <Toggle name={`enabled-${block.id}`} label="Bloc affiché sur le site" checked={block.enabled} onChange={(v) => set({ enabled: v })} />
        </div>

        {/* Textes */}
        <div className="grid min-w-0 content-start gap-6">
          <BiInput label="Titre" value={block.title} onChange={(title) => set({ title })} max={LIMITS.title} />

          <div className="grid gap-3">
            <p className="text-sm font-semibold">Lignes de texte</p>
            {block.bullets.map((b, i) => (
              <div key={i} className="grid gap-2 rounded-2xl border border-line/70 bg-white/40 p-3">
                <BiInput label={`Ligne ${i + 1}`} value={b} rows={2} max={LIMITS.bullet} onChange={(v) => set({ bullets: block.bullets.map((x, k) => (k === i ? v : x)) })} />
                <div className="flex gap-1">
                  <button type="button" className={iconBtn} onClick={() => set({ bullets: move(block.bullets, i, -1) })} disabled={i === 0} aria-label="Monter la ligne">
                    ↑
                  </button>
                  <button type="button" className={iconBtn} onClick={() => set({ bullets: move(block.bullets, i, 1) })} disabled={i === block.bullets.length - 1} aria-label="Descendre la ligne">
                    ↓
                  </button>
                  <button type="button" className={`${iconBtn} hover:!text-red-700`} onClick={() => set({ bullets: block.bullets.filter((_, k) => k !== i) })} aria-label="Supprimer la ligne">
                    ×
                  </button>
                </div>
              </div>
            ))}
            {block.bullets.length < LIMITS.bullets && (
              <button type="button" className={`${btn("soft", "sm")} w-fit`} onClick={() => set({ bullets: [...block.bullets, { fr: "", en: "" }] })}>
                + Ajouter une ligne
              </button>
            )}
            <p className="text-xs leading-relaxed text-muted">
              Mettez un passage en gras avec <code className="rounded bg-ink/5 px-1">**double étoile**</code>. Coordonnées de l&apos;entreprise à insérer :{" "}
              <code className="rounded bg-ink/5 px-1">{"{address}"}</code> <code className="rounded bg-ink/5 px-1">{"{hours}"}</code>{" "}
              <code className="rounded bg-ink/5 px-1">{"{phone}"}</code> (modifiables dans Paramètres).
            </p>
          </div>

          <div className="grid gap-3">
            <p className="text-sm font-semibold">Boutons</p>
            {block.buttons.map((b, i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-line/70 bg-white/40 p-3">
                <BiInput label="Texte du bouton" value={b.label} max={LIMITS.label} onChange={(label) => setButton(i, { label })} />
                <div className="grid gap-3 min-[1500px]:grid-cols-[1fr_10rem_auto] min-[1500px]:items-end">
                  <Field label="Lien" hint="/ecooter/lithium · https://… · mailto:… · {phoneHref} (appel) · {emailHref}">
                    <input value={b.href} maxLength={LIMITS.href} onChange={(e) => setButton(i, { href: e.target.value })} className={inputClass} />
                  </Field>
                  <Field label="Style">
                    <select value={b.style} onChange={(e) => setButton(i, { style: e.target.value as PageButton["style"] })} className={selectClass}>
                      <option value="glass">Discret (verre)</option>
                      <option value="primary">Principal (vert)</option>
                    </select>
                  </Field>
                  <button type="button" className={`${btn("danger", "sm")} h-11`} onClick={() => set({ buttons: block.buttons.filter((_, k) => k !== i) })}>
                    Retirer
                  </button>
                </div>
              </div>
            ))}
            {block.buttons.length < LIMITS.buttons && (
              <button
                type="button"
                className={`${btn("soft", "sm")} w-fit`}
                onClick={() => set({ buttons: [...block.buttons, { label: { fr: "", en: "" }, href: "/contact", style: "glass" }] })}
              >
                + Ajouter un bouton
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ModelPageForm({ initial, photo }: { initial: EcooterPageContent; photo: string }) {
  const [content, setContent] = useState(initial);
  const { state, onSubmit, pending } = useActionForm(saveEcooterPageAction);
  const setBlock = (i: number, b: PageBlock) => setContent({ ...content, blocks: content.blocks.map((x, k) => (k === i ? b : x)) });

  return (
    <div className="grid gap-6">
      <form method="post" onSubmit={onSubmit} className="grid gap-6">
        <input type="hidden" name="data" value={JSON.stringify(content)} />

        {content.blocks.map((b, i) => (
          <BlockEditor
            key={b.id}
            block={b}
            index={i}
            total={content.blocks.length}
            photo={photo}
            onChange={(nb) => setBlock(i, nb)}
            onMove={(d) => setContent({ ...content, blocks: move(content.blocks, i, d) })}
            onRemove={() => {
              if (window.confirm(`Supprimer le bloc « ${b.title.fr || i + 1} » ?`)) setContent({ ...content, blocks: content.blocks.filter((_, k) => k !== i) });
            }}
          />
        ))}

        {content.blocks.length < LIMITS.blocks && (
          <button
            type="button"
            className="glass flex h-20 items-center justify-center rounded-3xl border border-dashed border-line text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
            onClick={() =>
              setContent({
                ...content,
                blocks: [
                  ...content.blocks,
                  {
                    id: `bloc-${Date.now().toString(36)}`,
                    enabled: true,
                    side: content.blocks.length % 2 === 0 ? "left" : "right",
                    zoom: 1,
                    originX: 50,
                    originY: 50,
                    title: { fr: "", en: "" },
                    bullets: [{ fr: "", en: "" }],
                    buttons: [],
                  },
                ],
              })
            }
          >
            + Ajouter un bloc image et texte
          </button>
        )}

        <Panel title="Textes de la page" subtitle="La note sous les paramètres du produit et la bande d'appel à l'action en bas de la page.">
          <div className="grid gap-5">
            <BiInput label="Note sous les paramètres" value={content.paramsNote} rows={2} max={300} onChange={(paramsNote) => setContent({ ...content, paramsNote })} />
            <BiInput label="Titre de la bande finale" value={content.cta.title} max={120} onChange={(title) => setContent({ ...content, cta: { ...content.cta, title } })} />
            <BiInput label="Sous-titre de la bande finale" value={content.cta.subtitle} rows={2} max={200} onChange={(subtitle) => setContent({ ...content, cta: { ...content.cta, subtitle } })} />
          </div>
        </Panel>

        <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-full glass-nav px-4 py-3">
          <SubmitButton pending={pending} pendingLabel="Enregistrement…">
            Enregistrer la fiche
          </SubmitButton>
          {state?.ok && <p role="status" className="text-sm font-semibold text-accent">{state.ok}</p>}
          <FormError message={state?.error} />
        </div>
      </form>

      <form>
        <ConfirmButton
          variant="soft"
          size="sm"
          title="Rétablir le contenu d'origine ?"
          message="Vos modifications de cette page seront remplacées par le contenu d'origine du site."
          confirmLabel="Rétablir"
          formAction={resetEcooterPageAction}
        >
          Rétablir le contenu d&apos;origine
        </ConfirmButton>
      </form>
    </div>
  );
}
