/** Formats d'affichage de l'administration (français, ariary). */
const nf = new Intl.NumberFormat("fr-FR");
export const ar = (n: number | null | undefined) => `${nf.format(Math.round(n ?? 0))} Ar`;
export const num = (n: number | null | undefined) => nf.format(n ?? 0);

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", timeZone: "Indian/Antananarivo" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Indian/Antananarivo",
});

export const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(`${d.slice(0, 10)}T12:00:00Z`) : d;
  return dateFmt.format(date);
};
export const fmtDateTime = (d: Date | string | null | undefined) => (d ? dateTimeFmt.format(new Date(d)) : "—");

/** Date du jour (AAAA-MM-JJ) à Antananarivo. */
export const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Indian/Antananarivo" });
export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Totaux d'un document, en ariary entiers.
 *  - prix HT (par défaut) : total = HT après remise + TVA ;
 *  - prix TTC (`included`) : le total est le sous-total moins la remise, la TVA est « dont » (comme sur le site).
 */
export function computeTotals(items: { unitPrice: number; qty: number }[], discount: number, vatRate: number, included = false) {
  const subtotal = items.reduce((s, i) => s + Math.round(i.unitPrice) * Math.round(i.qty), 0);
  const after = Math.max(0, subtotal - Math.max(0, Math.round(discount)));
  if (included) {
    const vat = Math.round((after * vatRate) / (100 + vatRate));
    return { subtotal, net: after - vat, vat, total: after };
  }
  const vat = Math.round((after * vatRate) / 100);
  return { subtotal, net: after, vat, total: after + vat };
}
