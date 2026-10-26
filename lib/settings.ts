import { site } from "./site";

/** Réglages modifiables depuis l'admin. Les valeurs par défaut reprennent le site actuel. */
export type CompanySettings = {
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  address: { fr: string; en: string };
  hours: { fr: string[]; en: string[] };
};

export type PaymentSettings = {
  mvola: { number: string; holder: string };
  bank: { bank: string; holder: string; account: string };
  card: { url: string };
};

export type BillingSettings = {
  legalName: string;
  address: string;
  nif: string;
  stat: string;
  rcs: string;
  /** Taux de TVA appliqué par défaut aux devis et factures, en %. */
  vatRate: number;
  quotePrefix: string;
  invoicePrefix: string;
  quoteValidityDays: number;
  paymentTermsDays: number;
  /** Coordonnées bancaires imprimées sur les factures. */
  bankDetails: string;
  quoteTerms: string;
  invoiceFooter: string;
};

export type AppSettings = {
  company: CompanySettings;
  payment: PaymentSettings;
  billing: BillingSettings;
};

export const defaultSettings: AppSettings = {
  company: {
    name: site.name,
    email: site.email,
    phone: site.phone,
    whatsappNumber: site.whatsappNumber,
    address: { fr: site.address.fr, en: site.address.en },
    hours: { fr: [...site.hours.fr], en: [...site.hours.en] },
  },
  payment: {
    mvola: { ...site.payment.mvola },
    bank: { ...site.payment.bank },
    card: { ...site.payment.card },
  },
  billing: {
    legalName: site.name,
    address: site.address.fr,
    nif: "",
    stat: "",
    rcs: "",
    vatRate: 20,
    quotePrefix: "DV",
    invoicePrefix: "FA",
    quoteValidityDays: 30,
    paymentTermsDays: 30,
    bankDetails: "",
    quoteTerms:
      "Devis valable pour la durée indiquée. Acompte à la commande, solde à la livraison ou à l'installation. Délais et disponibilité confirmés à l'acceptation du devis.",
    invoiceFooter: "Merci pour votre confiance.",
  },
};

/** Fusionne des valeurs stockées (éventuellement partielles) avec les valeurs par défaut. */
export function mergeSettings(stored: Partial<Record<keyof AppSettings, unknown>>): AppSettings {
  const out = structuredClone(defaultSettings) as AppSettings;
  for (const key of Object.keys(out) as (keyof AppSettings)[]) {
    const v = stored[key];
    if (v && typeof v === "object") {
      (out[key] as unknown) = deepMerge(out[key], v as Record<string, unknown>);
    }
  }
  return out;
}

function deepMerge<T>(base: T, over: Record<string, unknown>): T {
  const result = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over)) {
    const cur = result[k];
    if (v && typeof v === "object" && !Array.isArray(v) && cur && typeof cur === "object" && !Array.isArray(cur)) {
      result[k] = deepMerge(cur, v as Record<string, unknown>);
    } else if (v !== undefined && v !== null) {
      result[k] = v;
    }
  }
  return result as T;
}
