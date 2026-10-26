import { today } from "@/lib/format";
import type { InvoiceState } from "./status";
import type { SheetProps } from "@/components/admin/document-sheet";

type Stamp = SheetProps["stamp"];

export function quoteStamp(status: string, validUntil: string | null): Stamp {
  if (status === "accepted") return { label: "Accepté", tone: "teal" };
  if (status === "declined") return { label: "Refusé", tone: "red" };
  if (status === "expired" || (status === "sent" && validUntil && validUntil < today())) return { label: "Expiré", tone: "grey" };
  if (status === "draft") return { label: "Brouillon", tone: "grey" };
  return undefined;
}

export function invoiceStamp(state: InvoiceState): Stamp {
  if (state === "paid") return { label: "Payée", tone: "teal" };
  if (state === "cancelled") return { label: "Annulée", tone: "red" };
  if (state === "draft") return { label: "Brouillon", tone: "grey" };
  return undefined;
}
