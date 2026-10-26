import type { Tone } from "@/components/admin/ui";

export const orderStatuses = {
  new: { label: "Nouvelle", tone: "amber" },
  confirmed: { label: "Confirmée", tone: "blue" },
  preparing: { label: "En préparation", tone: "blue" },
  ready: { label: "Prête / expédiée", tone: "lime" },
  delivered: { label: "Livrée", tone: "teal" },
  cancelled: { label: "Annulée", tone: "red" },
} as const satisfies Record<string, { label: string; tone: Tone }>;
export type OrderStatus = keyof typeof orderStatuses;
export const orderStatusList = Object.keys(orderStatuses) as OrderStatus[];

export const quoteStatuses = {
  draft: { label: "Brouillon", tone: "neutral" },
  sent: { label: "Envoyé", tone: "blue" },
  accepted: { label: "Accepté", tone: "teal" },
  declined: { label: "Refusé", tone: "red" },
  expired: { label: "Expiré", tone: "amber" },
} as const satisfies Record<string, { label: string; tone: Tone }>;
export type QuoteStatus = keyof typeof quoteStatuses;
export const quoteStatusList = Object.keys(quoteStatuses) as QuoteStatus[];

export const paymentMethods = {
  mvola: "MVola",
  virement: "Virement bancaire",
  carte: "Carte bancaire",
  especes: "Espèces",
  cheque: "Chèque",
} as const;
export type PaymentMethod = keyof typeof paymentMethods;
export const isPaymentMethod = (v: string): v is PaymentMethod => v in paymentMethods;

export type InvoiceState = "draft" | "cancelled" | "paid" | "partial" | "overdue" | "due";
export const invoiceStates: Record<InvoiceState, { label: string; tone: Tone }> = {
  draft: { label: "Brouillon", tone: "neutral" },
  cancelled: { label: "Annulée", tone: "red" },
  paid: { label: "Payée", tone: "teal" },
  partial: { label: "Partiellement payée", tone: "blue" },
  overdue: { label: "En retard", tone: "red" },
  due: { label: "À payer", tone: "amber" },
};

/** État d'une facture, déduit de son statut, des paiements reçus et de l'échéance. */
export function invoiceState(inv: { status: string; total: number; dueAt: string | null }, paid: number, today: string): InvoiceState {
  if (inv.status === "cancelled") return "cancelled";
  if (inv.status === "draft") return "draft";
  if (paid >= inv.total && inv.total > 0) return "paid";
  if (inv.total === 0) return "paid";
  if (paid > 0) return inv.dueAt && inv.dueAt < today ? "overdue" : "partial";
  return inv.dueAt && inv.dueAt < today ? "overdue" : "due";
}

export const customerTypes = { individual: "Particulier", company: "Société" } as const;
