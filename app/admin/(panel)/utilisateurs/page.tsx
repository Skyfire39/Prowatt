import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { CreateUserForm } from "@/components/admin/user-forms";
import { Badge, DataTable, Flash, PageHeader, Panel, Td } from "@/components/admin/ui";
import { roleLabels, type Role } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Utilisateurs" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const me = await requireUser("users.manage");
  const { ok } = await searchParams;
  const db = await getDb();
  const users = await db.select().from(schema.users).orderBy(asc(schema.users.name));

  return (
    <>
      <Flash code={ok} />
      <PageHeader eyebrow="Système" title="Utilisateurs" subtitle="Chaque membre de l'équipe a son compte et ses droits." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-3">
        <Panel flush className="xl:col-span-2">
          <DataTable head={["Utilisateur", "Rôle", "État", "Dernière connexion"]}>
            {users.map((u) => (
              <tr key={u.id}>
                <Td>
                  <Link href={`/admin/utilisateurs/${u.id}`} className="font-semibold hover:underline">
                    {u.name}
                    {u.id === me.id && <span className="ml-2 text-xs font-medium text-muted">(vous)</span>}
                  </Link>
                  <p className="text-xs text-muted">{u.email}</p>
                </Td>
                <Td>
                  <Badge tone={u.role === "owner" ? "teal" : "lime"}>{roleLabels[u.role as Role] ?? u.role}</Badge>
                </Td>
                <Td>{u.active ? <Badge tone="lime">Actif</Badge> : <Badge tone="neutral">Désactivé</Badge>}</Td>
                <Td className="whitespace-nowrap text-muted">{u.lastLoginAt ? fmtDateTime(u.lastLoginAt) : "Jamais"}</Td>
              </tr>
            ))}
          </DataTable>
        </Panel>
        <Panel title="Nouvel utilisateur">
          <CreateUserForm />
        </Panel>
      </div>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
