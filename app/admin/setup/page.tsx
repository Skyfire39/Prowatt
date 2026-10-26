import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AuthShell, DatabaseMissing } from "@/components/admin/auth-shell";
import { SetupForm } from "@/components/admin/auth-forms";
import { countUsers } from "@/lib/auth/users";
import { dbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Première configuration" };

export default function SetupPage() {
  return (
    <Suspense fallback={<AuthShell title="Première configuration">{null}</AuthShell>}>
      <SetupContent />
    </Suspense>
  );
}

async function SetupContent() {
  await connection();
  if (!dbConfigured()) return <DatabaseMissing />;
  if ((await countUsers()) > 0) redirect("/admin/login");
  return (
    <AuthShell title="Créez le compte propriétaire" subtitle="Ce premier compte gère tout, y compris les autres utilisateurs. Vous pourrez en ajouter ensuite.">
      <SetupForm needsCode={process.env.NODE_ENV === "production"} />
    </AuthShell>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
