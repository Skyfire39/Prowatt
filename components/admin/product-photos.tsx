"use client";

import { useState } from "react";

const SLOTS = 4;

/**
 * Quatre emplacements photo pour la fiche produit (le premier est la photo principale). Chaque emplacement montre sa photo
 * actuelle ou celle qui vient d'être choisie, et peut être vidé. Les champs `photoN`, `currentN` et `removeN` sont lus par l'action serveur.
 */
export function ProductPhotos({ photos }: { photos: string[] }) {
  const [previews, setPreviews] = useState<(string | null)[]>(Array(SLOTS).fill(null));
  const [removed, setRemoved] = useState<boolean[]>(Array(SLOTS).fill(false));

  const choose = (i: number, file: File | undefined) => {
    setPreviews((p) => p.map((v, k) => (k === i ? (file ? URL.createObjectURL(file) : null) : v)));
    if (file) setRemoved((r) => r.map((v, k) => (k === i ? false : v)));
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: SLOTS }, (_, i) => {
        const current = photos[i] ?? null;
        const shown = previews[i] ?? (removed[i] ? null : current);
        return (
          <div key={i} className="grid content-start gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{i === 0 ? "Photo principale" : `Photo ${i + 1}`}</p>
            <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-accent-soft/60">
              {shown ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shown} alt="" className="size-full object-contain" />
              ) : (
                <span className="text-xs text-muted">Aucune photo</span>
              )}
            </div>
            {current && <input type="hidden" name={`current${i}`} value={current} />}
            {current && !previews[i] && (
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  name={`remove${i}`}
                  checked={removed[i]}
                  onChange={(e) => setRemoved((r) => r.map((v, k) => (k === i ? e.target.checked : v)))}
                  className="size-4 accent-[var(--accent)]"
                />
                Retirer
              </label>
            )}
            <input
              type="file"
              name={`photo${i}`}
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => choose(i, e.target.files?.[0])}
              className="block w-full min-w-0 cursor-pointer text-xs file:mr-2 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-accent hover:file:opacity-90"
            />
          </div>
        );
      })}
    </div>
  );
}
