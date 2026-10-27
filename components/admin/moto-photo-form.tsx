"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { changeMotoPhotoAction } from "@/app/admin/(panel)/fiche-modele/actions";
import { SubmitButton, useActionForm } from "./client";
import { FormError } from "./ui";

/** Remplace la photo principale de la moto sans quitter sa fiche. */
export function MotoPhotoForm({ id }: { id: string }) {
  const { state, onSubmit, pending } = useActionForm(changeMotoPhotoAction);
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (state?.ok) {
      if (ref.current) ref.current.value = "";
      router.refresh(); // l'en-tête et la liste affichent la nouvelle photo
    }
  }, [state, router]);

  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm font-semibold">Photo principale</p>
      <input
        ref={ref}
        type="file"
        name="photo"
        required
        accept="image/png,image/jpeg,image/webp"
        className="block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent hover:file:opacity-90"
      />
      <p className="text-xs text-muted">Moto détourée (fond transparent), PNG ou WebP, 2 Mo maximum.</p>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton variant="soft" size="sm" pending={pending} pendingLabel="Envoi…">
          Remplacer la photo
        </SubmitButton>
        {state?.ok && <p role="status" className="text-sm font-semibold text-accent">{state.ok}</p>}
      </div>
      <FormError message={state?.error} />
    </form>
  );
}
