import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DocEditor } from "@/components/admin/doc-editor";
import { PageHeader } from "@/components/admin/ui";
import { getDocFormLists } from "@/lib/admin/doc-form";
import { loadQuote } from "@/lib/admin/load";
import { requireUser } from "@/lib/auth/session";
import { saveQuoteAction } from "../../actions";

export const metadata: Metadata = { title: "Modifier le devis" };

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("quotes.write");
  const { id } = await params;
  const loaded = await loadQuote(id);
  if (!loaded) notFound();
  const { quote, items } = loaded;
  if (quote.invoiceId) redirect(`/admin/devis/${id}?ok=locked`);
  const lists = await getDocFormLists();
  return (
    <>
      <PageHeader eyebrow="Devis" title={quote.number} back={{ href: `/admin/devis/${id}`, label: "Retour au devis" }} />
      <DocEditor
        kind="quote"
        action={saveQuoteAction}
        customers={lists.customers}
        products={lists.products}
        values={{
          id: quote.id,
          customerId: quote.customerId ?? "",
          title: quote.title ?? "",
          issuedAt: quote.issuedAt,
          endDate: quote.validUntil ?? "",
          vatRate: Number(quote.vatRate),
          vatIncluded: quote.vatIncluded,
          discount: quote.discount || "",
          notes: quote.notes ?? "",
          terms: quote.terms ?? "",
          lines: items.map((i) => ({ key: i.id, productId: i.productId ?? "", description: i.description, unitPrice: i.unitPrice, qty: i.qty })),
        }}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
