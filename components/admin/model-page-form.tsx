"use client";

import { useEffect, useRef, useState } from "react";
import { saveEcooterPageAction, resetEcooterPageAction } from "@/app/admin/(panel)/motos/page-actions";
import { LIMITS, SHARED_ID, type Bi, type EcooterPageContent, type PageBlock, type PageButton } from "@/lib/ecooter-page";
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
  gallery,
  onChange,
  onMove,
  onRemove,
}: {
  block: PageBlock;
  index: number;
  total: number;
  photo: string;
  gallery: string[];
  onChange: (b: PageBlock) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
}) {
  const set = (patch: Partial<PageBlock>) => onChange({ ...block, ...patch });
  // Photo de détail : celle déjà enregistrée, ou le fichier qui vient d'être choisi (envoyé à l'enregistrement).
  const fileRef = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  useEffect(() => () => {
    if (chosen) URL.revokeObjectURL(chosen);
  }, [chosen]);
  const detail = chosen ?? block.image ?? null;
  const pick = (file: File | undefined) => {
    setFileError(null);
    if (!file) return setChosen(null);
    if (file.size > 2 * 1024 * 1024) {
      if (fileRef.current) fileRef.current.value = "";
      return setFileError("Image trop lourde (2 Mo maximum).");
    }
    setChosen(URL.createObjectURL(file));
  };
  const clearDetail = () => {
    if (fileRef.current) fileRef.current.value = "";
    setChosen(null);
    setFileError(null);
    set({ image: null });
  };
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
        {/* Visuel du bloc */}
        <div className="grid max-w-sm content-start gap-4">
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(135deg, #175c55 0%, #2f7d6e 52%, #c8e0a2 130%)" }}
          >
            {!detail && <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/25" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={detail ?? photo} alt="" draggable={false} className={`pointer-events-none absolute inset-0 size-full select-none ${detail ? "object-cover" : "object-contain"}`} />
          </div>
          <div className="grid gap-2 rounded-2xl border border-line/70 bg-white/40 p-3">
            <p className="text-sm font-semibold">Photo de détail</p>
            <p className="text-xs text-muted">Sans photo de détail, le bloc affiche la photo principale de la moto. PNG, JPEG ou WebP, 2 Mo maximum.</p>
            <input
              ref={fileRef}
              type="file"
              name={`image-${block.id}`}
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => pick(e.target.files?.[0])}
              className="block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent hover:file:opacity-90"
            />
            {fileError && <p role="alert" className="text-xs font-medium text-red-700">{fileError}</p>}
            {gallery.length > 0 && (
              <div className="grid gap-2">
                <p className="text-xs font-semibold text-muted">Ou choisir dans les photos de la moto</p>
                <div className="flex flex-wrap gap-2">
                  {gallery.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => {
                        if (fileRef.current) fileRef.current.value = "";
                        setChosen(null);
                        set({ image: src });
                      }}
                      aria-label="Utiliser cette photo"
                      aria-pressed={block.image === src && !chosen}
                      className={`relative size-14 overflow-hidden rounded-xl ring-2 transition-all ${block.image === src && !chosen ? "ring-accent" : "ring-transparent opacity-80 hover:opacity-100"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {detail && (
              <button type="button" className={`${btn("soft", "sm")} w-fit`} onClick={clearDetail}>
                Retirer la photo de détail
              </button>
            )}
          </div>
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

/** Galerie de la moto : photos déjà enregistrées (retirables) et nouvelles photos à envoyer à l'enregistrement. */
function GalleryPanel({ saved, onRemove }: { saved: string[]; onRemove: (src: string) => void }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const room = LIMITS.gallery - saved.length;
  return (
    <Panel
      title="Photos de détail de la moto"
      subtitle="Ajoutez plusieurs photos d'un coup : elles s'affichent en galerie en bas de la page, et vous pouvez les choisir dans chaque bloc ci-dessous."
    >
      <div className="grid gap-4">
        {saved.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {saved.map((src) => (
              <li key={src} className="group relative size-24 overflow-hidden rounded-2xl bg-accent-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemove(src)}
                  aria-label="Retirer cette photo"
                  className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/60 text-base text-white transition-colors hover:bg-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {room > 0 ? (
          <>
            <input
              type="file"
              name="gallery"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const files = [...(e.target.files ?? [])];
                setError(null);
                if (files.length > room) {
                  e.target.value = "";
                  setPreviews([]);
                  return setError(`Vous pouvez encore ajouter ${room} photo${room > 1 ? "s" : ""} (${LIMITS.gallery} au maximum).`);
                }
                if (files.some((f) => f.size > 2 * 1024 * 1024)) {
                  e.target.value = "";
                  setPreviews([]);
                  return setError("Une photo dépasse 2 Mo.");
                }
                setPreviews(files.map((f) => URL.createObjectURL(f)));
              }}
              className="block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent hover:file:opacity-90"
            />
            {error && <p role="alert" className="text-xs font-medium text-red-700">{error}</p>}
            {previews.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-muted">À envoyer à l&apos;enregistrement :</p>
                <ul className="flex flex-wrap gap-3">
                  {previews.map((u) => (
                    <li key={u} className="size-24 overflow-hidden rounded-2xl bg-accent-soft ring-2 ring-accent/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt="" className="size-full object-cover" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">La galerie est pleine ({LIMITS.gallery} photos). Retirez-en une pour en ajouter.</p>
        )}
        <p className="text-xs text-muted">PNG, JPEG ou WebP, 2 Mo maximum par photo.</p>
      </div>
    </Panel>
  );
}

export function ModelPageForm({ initial, photo, scope, custom }: { initial: EcooterPageContent; photo: string; scope: string; custom: boolean }) {
  const [content, setContent] = useState(initial);
  const { state, onSubmit, pending } = useActionForm(saveEcooterPageAction);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const gallery = content.gallery ?? [];
  // Les formulaires acceptent 20 Mo au total : on prévient avant l'envoi plutôt que d'échouer sans message.
  const guard = (e: React.FormEvent<HTMLFormElement>) => {
    const total = [...e.currentTarget.querySelectorAll<HTMLInputElement>("input[type=file]")].flatMap((i) => [...(i.files ?? [])]).reduce((s, f) => s + f.size, 0);
    if (total > 18 * 1024 * 1024) {
      e.preventDefault();
      return setSizeError("Les photos choisies dépassent 18 Mo au total. Enregistrez-les en plusieurs fois.");
    }
    setSizeError(null);
    onSubmit(e);
  };
  const setBlock = (i: number, b: PageBlock) => setContent({ ...content, blocks: content.blocks.map((x, k) => (k === i ? b : x)) });

  return (
    <div className="grid gap-6">
      <form method="post" onSubmit={guard} className="grid gap-6">
        <input type="hidden" name="scope" value={scope} />
        <input type="hidden" name="data" value={JSON.stringify(content)} />

        {scope !== SHARED_ID && <GalleryPanel saved={gallery} onRemove={(src) => setContent({ ...content, gallery: gallery.filter((g) => g !== src) })} />}

        {content.blocks.map((b, i) => (
          <BlockEditor
            key={b.id}
            block={b}
            index={i}
            total={content.blocks.length}
            photo={photo}
            gallery={scope === SHARED_ID ? [] : gallery}
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
            {scope === SHARED_ID ? "Enregistrer le contenu commun" : "Enregistrer la fiche"}
          </SubmitButton>
          <FormError message={sizeError ?? state?.error} />
        </div>
      </form>

      {(custom || scope === SHARED_ID) && (
        <form>
          <input type="hidden" name="scope" value={scope} />
          <ConfirmButton
            variant="soft"
            size="sm"
            title={scope === SHARED_ID ? "Rétablir le contenu d'origine ?" : "Revenir au contenu commun ?"}
            message={
              scope === SHARED_ID
                ? "Vos modifications du contenu commun seront remplacées par le contenu d'origine du site."
                : "La fiche personnalisée de cette moto sera supprimée : elle reprendra le contenu commun."
            }
            confirmLabel={scope === SHARED_ID ? "Rétablir" : "Revenir au commun"}
            formAction={resetEcooterPageAction}
          >
            {scope === SHARED_ID ? "Rétablir le contenu d'origine" : "Revenir au contenu commun"}
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
