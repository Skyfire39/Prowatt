import { Suspense } from "react";
import { AdminFrame, LogoutButton, type NavGroup } from "@/components/admin/client";
import { DatabaseMissing } from "@/components/admin/auth-shell";
import { logoutAction } from "../auth-actions";
import { can, roleLabels, type Role } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getNavCounts } from "@/lib/admin/queries";
import { dbConfigured } from "@/lib/db";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Chargement…</div>}>
      <PanelShell>{children}</PanelShell>
    </Suspense>
  );
}

async function PanelShell({ children }: { children: React.ReactNode }) {
  if (!dbConfigured()) return <DatabaseMissing />;
  const user = await requireUser();
  const counts = await getNavCounts();
  const r = user.role;

  const groups = [
    {
      label: "Pilotage",
      items: [{ href: "/admin", label: "Tableau de bord", icon: "dashboard" as const }],
    },
    {
      label: "Ventes",
      items: [
        can(r, "orders.read") && { href: "/admin/commandes", label: "Commandes", icon: "orders" as const, badge: counts.newOrders },
        can(r, "quotes.read") && { href: "/admin/devis", label: "Devis", icon: "quotes" as const },
        can(r, "invoices.read") && { href: "/admin/factures", label: "Factures", icon: "invoices" as const, badge: counts.overdueInvoices },
        can(r, "customers.read") && { href: "/admin/clients", label: "Clients", icon: "customers" as const },
      ].filter(Boolean) as NavGroup["items"],
    },
    {
      label: "Catalogue",
      items: [
        can(r, "products.read") && { href: "/admin/produits", label: "Produits", icon: "products" as const },
        can(r, "motos.write") && { href: "/admin/motos", label: "Motos Ecooter", icon: "motos" as const },
        can(r, "motos.write") && { href: "/admin/fiche-modele", label: "Fiche modèle", icon: "modelpage" as const },
      ].filter(Boolean) as NavGroup["items"],
    },
    {
      label: "Site",
      items: [
        can(r, "content.write") && { href: "/admin/contenu", label: "Avis et partenaires", icon: "content" as const },
        can(r, "content.write") && { href: "/admin/mise-en-avant", label: "Mise en avant", icon: "featured" as const },
        can(r, "settings.manage") && { href: "/admin/parametres", label: "Paramètres", icon: "settings" as const },
      ].filter(Boolean) as NavGroup["items"],
    },
    {
      label: "Système",
      items: [
        can(r, "users.manage") && { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "users" as const },
        can(r, "audit.read") && { href: "/admin/journal", label: "Journal d'activité", icon: "audit" as const },
      ].filter(Boolean) as NavGroup["items"],
    },
  ].filter((g) => g.items.length > 0) as NavGroup[];

  return (
    <AdminFrame
      groups={groups}
      user={{ name: user.name, roleLabel: roleLabels[r as Role] ?? r }}
      logout={
        <form action={logoutAction}>
          <LogoutButton />
        </form>
      }
    >
      {children}
    </AdminFrame>
  );
}
