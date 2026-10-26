import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/client";
import { CustomerForm } from "@/components/admin/customer-form";
import { PageHeader, Panel } from "@/components/admin/ui";
import { TrashIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { isUuid } from "@/lib/validate";
import { deleteCustomerAction } from "../../actions";

export const metadata: Metadata = { title: "Modifier le client" };

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("customers.write");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const db = await getDb();
  const [c] = await db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
  if (!c) notFound();
  return (
    <>
      <PageHeader eyebrow="Clients" title={c.name} back={{ href: `/admin/clients/${c.id}`, label: "Fiche client" }} />
      <CustomerForm
        values={{ id: c.id, type: c.type, name: c.name, company: c.company ?? "", email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "", city: c.city ?? "", nif: c.nif ?? "", stat: c.stat ?? "", notes: c.notes ?? "" }}
      />
      <Panel title="Zone sensible" className="mt-6">
        <form action={deleteCustomerAction} className="flex flex-wrap items-center justify-between gap-4">
          <input type="hidden" name="id" value={c.id} />
          <p className="max-w-xl text-sm text-muted">Un client qui a reçu des factures ne peut pas être supprimé. Ses commandes et devis restent dans l&apos;historique, sans client rattaché.</p>
          <ConfirmButton title="Supprimer ce client ?" message={`La fiche de ${c.name} sera supprimée définitivement.`} confirmLabel="Supprimer">
            <TrashIcon className="size-4" />
            Supprimer
          </ConfirmButton>
        </form>
      </Panel>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
