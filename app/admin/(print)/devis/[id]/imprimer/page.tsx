import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentSheet } from "@/components/admin/document-sheet";
import { PrintToolbar } from "@/components/admin/print-toolbar";
import { loadQuote } from "@/lib/admin/load";
import { quoteStamp } from "@/lib/admin/stamps";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = { title: "Impression du devis" };

export default async function PrintQuotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("quotes.read");
  const { id } = await params;
  const [loaded, settings] = await Promise.all([loadQuote(id), getSettings()]);
  if (!loaded) notFound();
  const { quote, items, customer, totals } = loaded;
  return (
    <>
      <PrintToolbar backHref={`/admin/devis/${id}`} backLabel="Retour au devis" />
      <DocumentSheet
        kind="quote"
        number={quote.number}
        stamp={quoteStamp(quote.status, quote.validUntil)}
        title={quote.title}
        issuedAt={quote.issuedAt}
        endDate={quote.validUntil}
        settings={settings}
        customer={customer}
        items={items}
        discount={quote.discount}
        vatRate={Number(quote.vatRate)}
        vatIncluded={quote.vatIncluded}
        totals={totals}
        notes={quote.notes}
        terms={quote.terms}
      />
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
