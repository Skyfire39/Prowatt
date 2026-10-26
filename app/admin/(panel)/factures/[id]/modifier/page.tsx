import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DocEditor } from "@/components/admin/doc-editor";
import { PageHeader } from "@/components/admin/ui";
import { getDocFormLists } from "@/lib/admin/doc-form";
import { loadInvoice } from "@/lib/admin/load";
import { requireUser } from "@/lib/auth/session";
import { saveInvoiceAction } from "../../actions";

export const metadata: Metadata = { title: "Modifier la facture" };

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("invoices.write");
  const { id } = await params;
  const loaded = await loadInvoice(id);
  if (!loaded) notFound();
  const { invoice, items } = loaded;
  if (invoice.status !== "draft") redirect(`/admin/factures/${id}?ok=locked`);
  const lists = await getDocFormLists();
  return (
    <>
      <PageHeader eyebrow="Factures" title="Brouillon de facture" back={{ href: `/admin/factures/${id}`, label: "Retour à la facture" }} />
      <DocEditor
        kind="invoice"
        action={saveInvoiceAction}
        customers={lists.customers}
        products={lists.products}
        values={{
          id: invoice.id,
          customerId: invoice.customerId ?? "",
          title: invoice.title ?? "",
          issuedAt: invoice.issuedAt,
          endDate: invoice.dueAt ?? "",
          vatRate: Number(invoice.vatRate),
          vatIncluded: invoice.vatIncluded,
          discount: invoice.discount || "",
          notes: invoice.notes ?? "",
          terms: "",
          lines: items.map((i) => ({ key: i.id, productId: i.productId ?? "", description: i.description, unitPrice: i.unitPrice, qty: i.qty })),
        }}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
