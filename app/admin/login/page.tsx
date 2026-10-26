import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell, DatabaseMissing } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/auth-forms";
import { getSessionUser } from "@/lib/auth/session";
import { countUsers } from "@/lib/auth/users";
import { dbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell title="Connexion">{null}</AuthShell>}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  if (!dbConfigured()) return <DatabaseMissing />;
  if (await getSessionUser()) redirect("/admin");
  if ((await countUsers()) === 0) redirect("/admin/setup");
  return (
    <AuthShell title="Bon retour" subtitle="Connectez-vous pour gérer la boutique, les clients et les documents.">
      <LoginForm />
    </AuthShell>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
