import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

/** Page d'accès centrée : verre dépoli sur le fond ambiant du site. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo variant="wordmark" className="h-10 w-auto" />
          <p className="eyebrow mt-6">Administration</p>
        </div>
        <div className="glass-strong rounded-[2rem] p-7 sm:p-9">
          <h1 className="text-3xl tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 leading-relaxed text-muted">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-muted">Accès réservé à l&apos;équipe Prowatt Madagascar.</p>
      </div>
    </main>
  );
}

/** Affiché quand aucune base de données n'est configurée (production sans DATABASE_URL). */
export function DatabaseMissing() {
  return (
    <AuthShell title="Base de données requise" subtitle="L'administration a besoin d'une base Postgres pour fonctionner.">
      <ol className="grid gap-3 text-sm leading-relaxed">
        <li>
          <strong>1.</strong> Créez une base Postgres (Neon, Supabase…) et copiez son adresse de connexion.
        </li>
        <li>
          <strong>2.</strong> Ajoutez-la dans les variables d&apos;environnement du serveur :
          <code className="mt-1 block rounded-xl bg-ink/8 px-3 py-2 font-mono text-xs">DATABASE_URL=postgres://…</code>
        </li>
        <li>
          <strong>3.</strong> Créez les tables :
          <code className="mt-1 block rounded-xl bg-ink/8 px-3 py-2 font-mono text-xs">npm run db:migrate</code>
        </li>
        <li>
          <strong>4.</strong> Définissez un code d&apos;installation :
          <code className="mt-1 block rounded-xl bg-ink/8 px-3 py-2 font-mono text-xs">ADMIN_SETUP_CODE=…</code>
          puis rechargez cette page pour créer le compte propriétaire.
        </li>
      </ol>
    </AuthShell>
  );
}
