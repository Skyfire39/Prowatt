import { Suspense } from "react";
import { DatabaseMissing } from "@/components/admin/auth-shell";
import { requireUser } from "@/lib/auth/session";
import { dbConfigured } from "@/lib/db";

/** Pages d'impression : aucune navigation, seulement le document et sa barre d'outils (masquée à l'impression). */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Chargement…</div>}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}

async function Guard({ children }: { children: React.ReactNode }) {
  if (!dbConfigured()) return <DatabaseMissing />;
  await requireUser();
  return <main className="px-3 py-6 sm:px-6 print:p-0">{children}</main>;
}
