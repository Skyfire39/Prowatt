import type { Metadata } from "next";
import { OwnNameForm, OwnPasswordForm } from "@/components/admin/user-forms";
import { Badge, PageHeader, Panel } from "@/components/admin/ui";
import { PERMISSIONS, roleDescriptions, roleLabels, can, type Role } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mon compte" };

const permLabels: Record<string, string> = {
  "dashboard.view": "Tableau de bord",
  "products.read": "Voir les produits",
  "products.write": "Modifier les produits",
  "motos.write": "Modifier les motos",
  "customers.read": "Voir les clients",
  "customers.write": "Modifier les clients",
  "orders.read": "Voir les commandes",
  "orders.write": "Traiter les commandes",
  "quotes.read": "Voir les devis",
  "quotes.write": "Créer des devis",
  "invoices.read": "Voir les factures",
  "invoices.write": "Créer et émettre des factures",
  "payments.write": "Enregistrer des paiements",
  "content.write": "Modifier le contenu du site",
  "settings.manage": "Gérer les paramètres",
  "users.manage": "Gérer les utilisateurs",
  "audit.read": "Consulter le journal",
};

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader eyebrow="Mon compte" title={user.name} subtitle={user.email} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <div className="grid content-start gap-6">
          <OwnNameForm name={user.name} />
          <OwnPasswordForm />
        </div>
        <Panel title="Mes droits" subtitle={`${roleLabels[user.role as Role] ?? user.role} — ${roleDescriptions[user.role as Role] ?? ""}`}>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {PERMISSIONS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm">
                <Badge tone={can(user.role, p) ? "teal" : "neutral"}>{can(user.role, p) ? "Oui" : "Non"}</Badge>
                <span className={can(user.role, p) ? "" : "text-muted"}>{permLabels[p] ?? p}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
