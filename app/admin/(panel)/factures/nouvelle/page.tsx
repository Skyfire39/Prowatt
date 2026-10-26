import type { Metadata } from "next";
import { DocEditor } from "@/components/admin/doc-editor";
import { PageHeader } from "@/components/admin/ui";
import { getDocFormLists } from "@/lib/admin/doc-form";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/content";
import { addDays, today } from "@/lib/format";
import { isUuid } from "@/lib/validate";
import { saveInvoiceAction } from "../actions";

export const metadata: Metadata = { title: "Nouvelle facture" };

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  await requireUser("invoices.write");
  const { client } = await searchParams;
  const [lists, settings] = await Promise.all([getDocFormLists(), getSettings()]);
  const issuedAt = today();
  return (
    <>
      <PageHeader eyebrow="Factures" title="Nouvelle facture" subtitle="Enregistrez un brouillon, ou émettez directement pour attribuer le numéro légal." back={{ href: "/admin/factures", label: "Toutes les factures" }} />
      <DocEditor
        kind="invoice"
        action={saveInvoiceAction}
        customers={lists.customers}
        products={lists.products}
        values={{
          customerId: client && isUuid(client) ? client : "",
          title: "",
          issuedAt,
          endDate: addDays(issuedAt, settings.billing.paymentTermsDays),
          vatRate: settings.billing.vatRate,
          vatIncluded: false,
          discount: "",
          notes: "",
          terms: "",
          lines: [],
        }}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
