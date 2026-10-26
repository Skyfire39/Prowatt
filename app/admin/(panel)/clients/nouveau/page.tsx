import type { Metadata } from "next";
import { CustomerForm } from "@/components/admin/customer-form";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nouveau client" };

export default async function NewCustomerPage() {
  await requireUser("customers.write");
  return (
    <>
      <PageHeader eyebrow="Ventes" title="Nouveau client" back={{ href: "/admin/clients", label: "Tous les clients" }} />
      <CustomerForm values={{ type: "individual", name: "", company: "", email: "", phone: "", address: "", city: "", nif: "", stat: "", notes: "" }} />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
