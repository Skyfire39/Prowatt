import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentSheet } from "@/components/admin/document-sheet";
import { PrintToolbar } from "@/components/admin/print-toolbar";
import { loadInvoice } from "@/lib/admin/load";
import { invoiceStamp } from "@/lib/admin/stamps";
import { paymentMethods } from "@/lib/admin/status";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = { title: "Impression de la facture" };

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("invoices.read");
  const { id } = await params;
  const [loaded, settings] = await Promise.all([loadInvoice(id), getSettings()]);
  if (!loaded) notFound();
  const { invoice, items, customer, totals, payments, state } = loaded;
  return (
    <>
      <PrintToolbar backHref={`/admin/factures/${id}`} backLabel="Retour à la facture" />
      <DocumentSheet
        kind="invoice"
        number={invoice.status === "draft" ? "Brouillon" : invoice.number}
        stamp={invoiceStamp(state)}
        title={invoice.title}
        issuedAt={invoice.issuedAt}
        endDate={invoice.dueAt}
        settings={settings}
        customer={customer}
        items={items}
        discount={invoice.discount}
        vatRate={Number(invoice.vatRate)}
        vatIncluded={invoice.vatIncluded}
        totals={totals}
        notes={invoice.notes}
        paid={invoice.paid}
        payments={payments.map((p) => ({ paidAt: p.paidAt, method: paymentMethods[p.method as keyof typeof paymentMethods] ?? p.method, amount: p.amount }))}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
