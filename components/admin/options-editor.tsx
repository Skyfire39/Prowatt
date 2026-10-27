"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type DragEvent, type ReactNode, type RefObject } from "react";
import { ChevronIcon, CloseIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { OptionPicker } from "@/components/option-picker";
import { OPTION_LIMITS, selectionDelta, selectionImage, type OptionKind, type OptionValue, type ProductOption, type Selection } from "@/lib/options";
import { Panel, btn, inputClass } from "./ui";

/** Valeur en cours d'édition : `uid` relie le choix à son fichier photo dans le formulaire (jamais enregistré). */
type EditValue = OptionValue & { uid: string };
type EditOption = Omit<ProductOption, "values"> & { uid: string; values: EditValue[] };
type Seed = { label: string; color?: string };

const money = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
const MAX_FILE = 2 * 1024 * 1024;
const MAX_TOTAL = 14 * 1024 * 1024;
const PALETTE = ["#1f2933", "#f5f5f0", "#c0392b", "#2563eb", "#16a34a", "#6b7280", "#eab308", "#ea580c"];

const COLORS: Seed[] = [
  { label: "Noir", color: "#1f2933" },
  { label: "Blanc", color: "#f5f5f0" },
  { label: "Rouge", color: "#c0392b" },
  { label: "Bleu", color: "#2563eb" },
  { label: "Vert", color: "#16a34a" },
  { label: "Gris", color: "#6b7280" },
  { label: "Jaune", color: "#eab308" },
  { label: "Orange", color: "#ea580c" },
];
/** Suggestions de choix selon le nom de l'attribut (insensible à la casse). */
const SUGGEST: Record<string, Seed[]> = {
  couleur: COLORS,
  batterie: [{ label: "Graphène" }, { label: "Lithium" }],
  taille: [{ label: "S" }, { label: "M" }, { label: "L" }, { label: "XL" }],
  type: [{ label: "Standard" }, { label: "Premium" }],
};

const KINDS: { kind: OptionKind; label: string; hint: string }[] = [
  { kind: "color", label: "Couleur", hint: "Pastilles de couleur" },
  { kind: "image", label: "Photo", hint: "Vignettes photo" },
  { kind: "text", label: "Texte", hint: "Boutons de texte" },
];

const presets: { key: string; title: string; hint: string; kind: OptionKind; name: string; values: Seed[]; icon: ReactNode }[] = [
  {
    key: "couleur",
    title: "Couleur",
    hint: "Pastilles de teinte",
    kind: "color",
    name: "Couleur",
    values: COLORS.slice(0, 2),
    icon: (
      <span className="flex -space-x-1.5">
        {["#c0392b", "#2563eb", "#16a34a"].map((c) => (
          <span key={c} className="size-4 rounded-full ring-2 ring-white" style={{ backgroundColor: c }} />
        ))}
      </span>
    ),
  },
  { key: "batterie", title: "Batterie", hint: "Graphène ou lithium", kind: "text", name: "Batterie", values: SUGGEST.batterie, icon: <Glyph>⚡</Glyph> },
  { key: "taille", title: "Taille", hint: "S, M, L, XL…", kind: "text", name: "Taille", values: SUGGEST.taille.slice(0, 3), icon: <Glyph>S·M·L</Glyph> },
  { key: "type", title: "Type", hint: "Standard, premium…", kind: "text", name: "Type", values: SUGGEST.type, icon: <Glyph>Aa</Glyph> },
  { key: "finition", title: "Avec photos", hint: "Une photo par choix", kind: "image", name: "Finition", values: [{ label: "" }, { label: "" }], icon: <Glyph>▣</Glyph> },
  { key: "custom", title: "Personnalisé", hint: "Votre propre attribut", kind: "text", name: "", values: [{ label: "" }], icon: <Glyph>＋</Glyph> },
];

function Glyph({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-bold leading-none tracking-tight text-accent">{children}</span>;
}

const parseDelta = (t: string, fallback: number) => {
  const n = Number(t.replace(/[\s  ]/g, "").replace(",", "."));
  return t === "" || t === "-" || t === "+" ? 0 : Number.isFinite(n) ? Math.round(n) : fallback;
};

/** Prix de base saisi dans le formulaire (champ « price »), pour montrer le prix final de chaque choix. */
function useFormPrice(root: RefObject<HTMLElement | null>) {
  const field = () => root.current?.closest("form")?.elements.namedItem("price") as HTMLInputElement | null | undefined;
  const raw = useSyncExternalStore(
    (notify) => {
      const el = field();
      el?.addEventListener("input", notify);
      return () => el?.removeEventListener("input", notify);
    },
    () => field()?.value ?? "",
    () => "",
  );
  const n = Number(raw.replace(/\D/g, ""));
  return raw.trim() !== "" && Number.isFinite(n) ? n : null;
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors disabled:opacity-30 ${danger ? "enabled:hover:bg-red-500/10 enabled:hover:text-red-700" : "enabled:hover:bg-accent-soft enabled:hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

/** Supplément de prix : saisie libre (« -20 000 » accepté), unité Ar en fin de champ. */
function DeltaInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));
  return (
    <div className="relative">
      <input
        inputMode="numeric"
        value={raw}
        onChange={(e) => {
          const t = e.target.value.replace(/[^\d\s\-+,.]/g, "");
          setRaw(t);
          onChange(parseDelta(t, value));
        }}
        onBlur={() => setRaw(value === 0 ? "" : String(value))}
        className={`${inputClass} pr-10 tabular-nums ${value < 0 ? "text-teal" : ""}`}
        placeholder="± 0"
        aria-label={label}
      />
      <span aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
        Ar
      </span>
    </div>
  );
}

/** Vignette photo d'un choix : clic ou glisser-déposer. L'input fichier reste dans le formulaire (champ `optimg-<uid>`). */
function PhotoTile({ id, src, warn, onFile, onRemove }: { id: string; src: string | null; warn: boolean; onFile: (input: HTMLInputElement, file: File | undefined) => void; onRemove: () => void }) {
  const [over, setOver] = useState(false);
  const drop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files[0];
    const input = e.currentTarget.querySelector("input");
    if (!file || !input) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    onFile(input, file);
  };
  return (
    <div className="relative shrink-0">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
        title={src ? "Changer la photo" : "Ajouter une photo (clic ou glisser-déposer)"}
        className={`grid size-[3.25rem] cursor-pointer place-items-center overflow-hidden rounded-xl border-2 transition-colors ${src ? "border-transparent ring-1 ring-line" : over ? "border-accent bg-accent-soft" : warn ? "border-dashed border-amber-500/70 bg-amber-50/60 text-amber-700" : "border-dashed border-line text-muted hover:border-accent hover:bg-accent-soft hover:text-accent"}`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="m4 18 5-5 4 4 3-3 4 4" />
          </svg>
        )}
        <input type="file" name={`optimg-${id}`} accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Photo de ce choix" onChange={(e) => onFile(e.currentTarget, e.currentTarget.files?.[0])} />
      </label>
      {src && (
        <button type="button" aria-label="Retirer la photo de ce choix" onClick={onRemove} className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-white shadow transition-transform hover:scale-110">
          <CloseIcon className="size-3" />
        </button>
      )}
    </div>
  );
}

/** Ajout rapide : tapez un ou plusieurs choix séparés par des virgules, ou touchez une suggestion. */
function QuickAdd({ suggestions, onAdd, full }: { suggestions: Seed[]; onAdd: (seeds: Seed[]) => void; full: boolean }) {
  const [text, setText] = useState("");
  const commit = () => {
    const seeds = text.split(",").map((t) => ({ label: t.trim() })).filter((s) => s.label);
    if (seeds.length) onAdd(seeds);
    setText("");
  };
  if (full) return <p className="text-xs text-muted">Maximum de {OPTION_LIMITS.values} choix atteint.</p>;
  return (
    <div className="grid gap-2.5">
      <div className="flex gap-2">
        <input
          value={text}
          maxLength={OPTION_LIMITS.label * 6}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          className={`${inputClass} flex-1`}
          placeholder="Ajouter des choix : Rouge, Bleu… puis Entrée"
          aria-label="Ajouter des choix"
        />
        <button type="button" onClick={commit} disabled={!text.trim()} className={`${btn("soft", "md")} shrink-0 disabled:opacity-40`}>
          <PlusIcon className="size-4" />
          Ajouter
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted">Suggestions</span>
          {suggestions.map((s) => (
            <button key={s.label} type="button" onClick={() => onAdd([s])} className="glass-chip inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors hover:bg-accent-soft">
              {s.color && <span className="size-3.5 rounded-full border border-ink/15" style={{ backgroundColor: s.color }} />}
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Éditeur d'attributs d'un produit ou d'une moto, à la manière des attributs personnalisés de WooCommerce :
 * chaque attribut (couleur, batterie, taille…) a ses choix, chaque choix sa teinte ou sa photo et son supplément de prix.
 * Un aperçu côté client se met à jour en direct. Les options partent dans un champ caché `options` (JSON) ; le serveur les revalide.
 */
export function OptionsEditor({ initial, subject }: { initial: ProductOption[]; subject: string }) {
  // Identifiants déterministes (jamais aléatoires) : le rendu serveur et le navigateur doivent produire les mêmes noms de champs fichier.
  const prefix = useId().replace(/\W/g, "");
  const counter = useRef(0);
  const uid = () => `${prefix}n${counter.current++}`;
  const withUid = (o: ProductOption): EditOption => ({ ...o, uid: uid(), values: o.values.map((v) => ({ ...v, uid: uid() })) });
  const [options, setOptions] = useState<EditOption[]>(() => initial.map((o, i) => ({ ...o, uid: `${prefix}o${i}`, values: o.values.map((v, j) => ({ ...v, uid: `${prefix}o${i}v${j}` })) })));
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [askDelete, setAskDelete] = useState<string | null>(null);
  const [focusUid, setFocusUid] = useState<string | null>(null);
  const [picked, setPicked] = useState<Selection>({});
  const root = useRef<HTMLDivElement>(null);
  const base = useFormPrice(root);

  useEffect(() => () => Object.values(previews).forEach((u) => URL.revokeObjectURL(u)), [previews]);
  useEffect(() => {
    if (focusUid) root.current?.querySelector<HTMLInputElement>(`[data-opt-name="${focusUid}"]`)?.focus();
  }, [focusUid]);

  const dropPreview = (id: string) => setPreviews((m) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== id)));
  const setOption = (i: number, patch: Partial<EditOption>) => setOptions((l) => l.map((o, k) => (k === i ? { ...o, ...patch } : o)));
  const setValue = (i: number, j: number, patch: Partial<EditValue>) =>
    setOptions((l) => l.map((o, k) => (k === i ? { ...o, values: o.values.map((v, m) => (m === j ? { ...v, ...patch } : v)) } : o)));
  const move = <T,>(list: T[], from: number, to: number) => {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    next.splice(to, 0, next.splice(from, 1)[0]);
    return next;
  };

  const addOption = (p: (typeof presets)[number]) => {
    const o = withUid({ name: p.name, kind: p.kind, values: p.values.map((s, k) => ({ label: s.label, color: p.kind === "color" ? (s.color ?? PALETTE[k % PALETTE.length]) : null, delta: 0 })) });
    setOptions((l) => [...l, o]);
    setFocusUid(o.uid);
  };

  const addValues = (i: number, seeds: Seed[]) =>
    setOptions((l) =>
      l.map((o, k) => {
        if (k !== i) return o;
        const values = [...o.values];
        for (const s of seeds) {
          if (values.length >= OPTION_LIMITS.values) break;
          if (values.some((v) => v.label.trim().toLowerCase() === s.label.toLowerCase())) continue;
          const known = COLORS.find((c) => c.label.toLowerCase() === s.label.toLowerCase());
          values.push({ uid: uid(), label: s.label.slice(0, OPTION_LIMITS.label), color: o.kind === "color" ? (s.color ?? known?.color ?? PALETTE[values.length % PALETTE.length]) : null, delta: 0 });
        }
        return { ...o, values };
      }),
    );

  const changeKind = (i: number, kind: OptionKind) =>
    setOption(i, { kind, values: options[i].values.map((v, k) => ({ ...v, color: kind === "color" ? (v.color ?? PALETTE[k % PALETTE.length]) : null })) });

  const onFile = (id: string, input: HTMLInputElement, file: File | undefined) => {
    setFileError(null);
    const reset = () => {
      input.value = "";
      dropPreview(id);
    };
    if (!file) return reset();
    const others = [...(root.current?.querySelectorAll<HTMLInputElement>("input[type=file]") ?? [])].filter((x) => x !== input).reduce((n, x) => n + (x.files?.[0]?.size ?? 0), 0);
    if (file.size > MAX_FILE) {
      reset();
      return setFileError("Une photo dépasse 2 Mo.");
    }
    if (others + file.size > MAX_TOTAL) {
      reset();
      return setFileError("Les photos des options dépassent 14 Mo au total. Enregistrez-en une partie, puis ajoutez les autres.");
    }
    setPreviews((m) => ({ ...m, [id]: URL.createObjectURL(file) }));
  };

  /** Ce que verrait le client : choix vides et doublons écartés, photos non enregistrées comprises. */
  const seen = new Set<string>();
  const preview: ProductOption[] = [];
  for (const o of options) {
    const name = o.name.trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    const labels = new Set<string>();
    const values = o.values
      .filter((v) => {
        const l = v.label.trim().toLowerCase();
        if (!l || labels.has(l)) return false;
        labels.add(l);
        return true;
      })
      .map((v) => ({ ...v, label: v.label.trim(), image: previews[v.uid] ?? v.image ?? null }));
    if (values.length === 0) continue;
    seen.add(name.toLowerCase());
    preview.push({ name, kind: o.kind, values });
  }
  const selection: Selection = Object.fromEntries(preview.map((o) => [o.name, o.values.some((v) => v.label === picked[o.name]) ? picked[o.name] : o.values[0].label]));
  const previewImage = selectionImage(preview, selection);
  const delta = selectionDelta(preview, selection);

  const taken = new Set(options.map((o) => o.name.trim().toLowerCase()));

  return (
    <Panel
      title="Attributs et options"
      subtitle={`Couleur, batterie, taille… Le client choisit sur la fiche de ${subject} ; chaque choix peut avoir sa teinte ou sa photo et changer le prix.`}
      actions={options.length > 0 ? <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{options.length} attribut{options.length > 1 ? "s" : ""}</span> : undefined}
    >
      <input type="hidden" name="options" value={JSON.stringify(options)} />
      <div ref={root} className="grid gap-5">
        {options.map((o, i) => {
          const isOpen = !closed[o.uid];
          const dupName = o.name.trim() !== "" && options.some((p, k) => k !== i && p.name.trim().toLowerCase() === o.name.trim().toLowerCase());
          const suggestions = (SUGGEST[o.name.trim().toLowerCase()] ?? []).filter((s) => !o.values.some((v) => v.label.trim().toLowerCase() === s.label.toLowerCase())).map((s) => (o.kind === "color" ? s : { label: s.label }));
          const deltas = o.values.filter((v) => v.label.trim()).map((v) => v.delta);
          return (
            <section key={o.uid} className="rounded-2xl border border-line/70 bg-white/40">
              <header className="flex flex-wrap items-center gap-3 p-4 sm:px-5">
                <div className="flex flex-col">
                  <IconBtn label="Monter cet attribut" disabled={i === 0} onClick={() => setOptions((l) => move(l, i, i - 1))}>
                    <ChevronIcon className="size-4 rotate-180" />
                  </IconBtn>
                  <IconBtn label="Descendre cet attribut" disabled={i === options.length - 1} onClick={() => setOptions((l) => move(l, i, i + 1))}>
                    <ChevronIcon className="size-4" />
                  </IconBtn>
                </div>
                <label className="grid min-w-44 flex-1 gap-1 text-xs font-semibold uppercase tracking-wider text-muted">
                  Nom de l&apos;attribut
                  <input
                    data-opt-name={o.uid}
                    value={o.name}
                    maxLength={OPTION_LIMITS.name}
                    onChange={(e) => setOption(i, { name: e.target.value })}
                    className={`${inputClass} text-base font-semibold normal-case tracking-normal ${dupName ? "border-red-400" : ""}`}
                    placeholder="ex. Couleur"
                  />
                </label>
                <div role="radiogroup" aria-label="Affichage côté client" className="inline-flex rounded-full bg-accent-soft/70 p-1">
                  {KINDS.map((k) => (
                    <button
                      key={k.kind}
                      type="button"
                      role="radio"
                      aria-checked={o.kind === k.kind}
                      title={k.hint}
                      onClick={() => changeKind(i, k.kind)}
                      className={`h-9 rounded-full px-3.5 text-sm font-semibold transition-colors ${o.kind === k.kind ? "bg-accent text-on-accent shadow-sm" : "text-muted hover:text-ink"}`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
                <IconBtn label={isOpen ? "Replier cet attribut" : "Déplier cet attribut"} onClick={() => setClosed((c) => ({ ...c, [o.uid]: isOpen }))}>
                  <ChevronIcon className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </IconBtn>
                {askDelete === o.uid ? (
                  <span className="flex items-center gap-1.5">
                    <button type="button" className={btn("danger", "sm")} onClick={() => (setOptions((l) => l.filter((_, k) => k !== i)), setAskDelete(null))}>
                      Supprimer
                    </button>
                    <button type="button" className={btn("soft", "sm")} onClick={() => setAskDelete(null)}>
                      Annuler
                    </button>
                  </span>
                ) : (
                  <IconBtn label="Supprimer cet attribut" danger onClick={() => setAskDelete(o.uid)}>
                    <TrashIcon className="size-4" />
                  </IconBtn>
                )}
              </header>

              {(dupName || !isOpen) && (
                <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
                  {dupName && <p className="text-xs font-medium text-red-700">Un autre attribut porte déjà ce nom : celui-ci sera ignoré à l&apos;enregistrement.</p>}
                  {!isOpen &&
                    o.values
                      .filter((v) => v.label.trim())
                      .map((v) => (
                        <span key={v.uid} className="glass-chip inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold">
                          {o.kind === "color" && <span className="size-3 rounded-full border border-ink/15" style={{ backgroundColor: v.color ?? "#ccc" }} />}
                          {v.label}
                          {v.delta !== 0 && <span className="font-medium tabular-nums text-muted">{v.delta > 0 ? "+" : "−"}{money(Math.abs(v.delta))}</span>}
                        </span>
                      ))}
                </div>
              )}

              <div className={isOpen ? "border-t border-line/60 p-4 sm:p-5" : "hidden"}>
                <div className="grid gap-2.5">
                  {o.values.map((v, j) => {
                    const label = v.label.trim().toLowerCase();
                    const dup = label !== "" && o.values.some((w, m) => m !== j && w.label.trim().toLowerCase() === label);
                    const src = previews[v.uid] ?? v.image ?? null;
                    const missing = o.kind === "image" && !src;
                    return (
                      <div key={v.uid} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/60 bg-white/60 p-3 transition-shadow focus-within:shadow-[0_0_0_3px_rgb(23_92_85/0.08)]">
                        {o.kind === "color" && (
                          <label title="Choisir la teinte" className="relative size-[3.25rem] shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.15)] transition-transform hover:scale-105" style={{ backgroundColor: v.color ?? "#cccccc" }}>
                            <input type="color" aria-label={`Teinte de ${v.label || "ce choix"}`} value={v.color ?? "#cccccc"} onChange={(e) => setValue(i, j, { color: e.target.value })} className="absolute inset-0 size-full cursor-pointer opacity-0" />
                          </label>
                        )}
                        <PhotoTile
                          id={v.uid}
                          src={src}
                          warn={missing}
                          onFile={(input, file) => onFile(v.uid, input, file)}
                          onRemove={() => {
                            const input = root.current?.querySelector<HTMLInputElement>(`input[name="optimg-${v.uid}"]`);
                            if (input) input.value = "";
                            dropPreview(v.uid);
                            setValue(i, j, { image: null });
                          }}
                        />
                        <label className="grid min-w-36 flex-1 gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                          Choix
                          <input
                            value={v.label}
                            maxLength={OPTION_LIMITS.label}
                            onChange={(e) => setValue(i, j, { label: e.target.value })}
                            className={`${inputClass} text-sm font-semibold normal-case tracking-normal text-ink ${dup ? "border-red-400" : ""}`}
                            placeholder={o.kind === "color" ? "ex. Rouge" : o.kind === "image" ? "ex. Édition sport" : "ex. Lithium"}
                          />
                        </label>
                        <div className="grid w-40 gap-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Supplément</span>
                          <DeltaInput value={v.delta} onChange={(n) => setValue(i, j, { delta: n })} label={`Supplément de prix pour ${v.label || "ce choix"}`} />
                        </div>
                        <div className="ml-auto flex items-center">
                          <IconBtn label="Monter ce choix" disabled={j === 0} onClick={() => setOption(i, { values: move(o.values, j, j - 1) })}>
                            <ChevronIcon className="size-4 rotate-180" />
                          </IconBtn>
                          <IconBtn label="Descendre ce choix" disabled={j === o.values.length - 1} onClick={() => setOption(i, { values: move(o.values, j, j + 1) })}>
                            <ChevronIcon className="size-4" />
                          </IconBtn>
                          <IconBtn label="Retirer ce choix" danger disabled={o.values.length <= 1} onClick={() => setOption(i, { values: o.values.filter((_, m) => m !== j) })}>
                            <CloseIcon className="size-4" />
                          </IconBtn>
                        </div>
                        {(dup || missing || (base !== null && v.delta !== 0)) && (
                          <p className="basis-full text-xs">
                            {dup && <span className="font-medium text-red-700">Ce choix existe déjà dans cet attribut.</span>}
                            {!dup && missing && <span className="font-medium text-amber-700">Sans photo, ce choix s&apos;affichera en texte.</span>}
                            {!dup && !missing && base !== null && v.delta !== 0 && (
                              <span className="text-muted">
                                Prix avec ce choix : <strong className="tabular-nums text-ink">{money(base + v.delta)} Ar</strong>
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <QuickAdd suggestions={suggestions} onAdd={(seeds) => addValues(i, seeds)} full={o.values.length >= OPTION_LIMITS.values} />
                </div>
                {deltas.length > 1 && Math.min(...deltas) !== Math.max(...deltas) && (
                  <p className="mt-3 text-xs text-muted">
                    Cet attribut fait varier le prix de {money(Math.min(...deltas))} à {money(Math.max(...deltas))} Ar.
                  </p>
                )}
              </div>
            </section>
          );
        })}

        {options.length < OPTION_LIMITS.options ? (
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted">{options.length === 0 ? "Aucun attribut : le produit s'achète tel quel. Ajoutez-en un" : "Ajouter un attribut"}</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {presets.map((p) => {
                const used = p.name !== "" && taken.has(p.name.toLowerCase());
                return (
                  <button
                    key={p.key}
                    type="button"
                    disabled={used}
                    onClick={() => addOption(p)}
                    className="group flex items-center gap-3 rounded-2xl border border-dashed border-line bg-white/30 p-3 text-left transition-all enabled:hover:-translate-y-0.5 enabled:hover:border-accent enabled:hover:bg-accent-soft/60 disabled:opacity-40"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft">{p.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{p.title}</span>
                      <span className="block truncate text-xs text-muted">{used ? "Déjà ajouté" : p.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Le maximum de {OPTION_LIMITS.options} attributs est atteint.</p>
        )}

        {fileError && (
          <p role="alert" className="text-xs font-medium text-red-700">
            {fileError}
          </p>
        )}

        {preview.length > 0 && (
          <div className="rounded-2xl border border-accent/25 bg-accent-soft/50 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              Aperçu côté client
            </p>
            <div className="grid items-start gap-5 sm:grid-cols-[9rem_1fr]">
              <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-white/70 p-2 text-center text-xs text-muted ring-1 ring-line/60">
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImage} alt="" className="size-full rounded-xl object-cover" />
                ) : (
                  <span>Photo principale du produit</span>
                )}
              </div>
              <div className="grid gap-4">
                <OptionPicker options={preview} selection={selection} onChange={setPicked} lang="fr" currency="Ar" />
                {base !== null && (
                  <p className="text-sm text-muted">
                    Prix affiché : <strong className="text-lg tabular-nums text-ink">{money(base + delta)} Ar</strong>
                    {delta !== 0 && <span className="ml-2 text-xs tabular-nums">({money(base)} {delta > 0 ? "+" : "−"} {money(Math.abs(delta))})</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs leading-relaxed text-muted">
          Photo d&apos;un choix : quand le client le sélectionne, elle remplace la photo principale de la fiche et la miniature du panier (PNG, JPEG ou WebP, 2 Mo maximum ; clic ou glisser-déposer). Supplément : montant ajouté au prix de base (négatif pour une réduction, vide pour aucun changement). Les attributs sans nom et les choix vides sont ignorés à l&apos;enregistrement.
        </p>
      </div>
    </Panel>
  );
}
