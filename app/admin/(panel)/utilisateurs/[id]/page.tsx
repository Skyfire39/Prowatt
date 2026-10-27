import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditUserForm, ResetPasswordForm } from "@/components/admin/user-forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";
import { isUuid } from "@/lib/validate";

export const metadata: Metadata = { title: "Modifier l'utilisateur" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser("users.manage");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const db = await getDb();
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (!u) notFound();
  return (
    <>
      <PageHeader eyebrow="Utilisateurs" title={u.name} subtitle={`Créé le ${fmtDateTime(u.createdAt)} · dernière connexion : ${u.lastLoginAt ? fmtDateTime(u.lastLoginAt) : "jamais"}`} back={{ href: "/admin/utilisateurs", label: "Tous les utilisateurs" }} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Panel title="Compte">
          <EditUserForm user={{ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active }} self={u.id === me.id} />
        </Panel>
        {u.id !== me.id && (
          <Panel title="Mot de passe">
            <ResetPasswordForm id={u.id} />
          </Panel>
        )}
      </div>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
