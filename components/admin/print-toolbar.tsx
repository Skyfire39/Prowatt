import Link from "next/link";
import { PrintButton } from "./client";
import { ArrowLeftIcon } from "./icons";

/** Barre d'outils de la page d'impression : visible à l'écran, masquée à l'impression. */
export function PrintToolbar({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <div className="no-print mx-auto mb-5 flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeftIcon className="size-4" />
        {backLabel}
      </Link>
      <div className="flex items-center gap-3">
        <p className="hidden text-sm text-muted sm:block">Choisissez « Enregistrer au format PDF » dans la fenêtre d&apos;impression.</p>
        <PrintButton />
      </div>
    </div>
  );
}
