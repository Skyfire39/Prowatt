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

/**
 * E-mails envoyés à chaque demande de devis du site. Les textes acceptent des champs entre doubles accolades
 * ({{nom}}, {{reference}}, {{reponses}}…) : voir lib/mail-templates.ts.
 */
export type MailSettings = {
  /** Prévenir les commerciaux à chaque nouvelle demande. */
  notifySales: boolean;
  /** Adresses des commerciaux qui reçoivent la demande. */
  salesEmails: string[];
  salesSubject: string;
  salesBody: string;
  /** Envoyer une confirmation au demandeur (s'il a donné son adresse). */
  confirmCustomer: boolean;
  customerSubject: string;
  customerBody: string;
  /** Adresse où arrivent les réponses du client ; vide : l'e-mail de l'entreprise. */
  replyTo: string;
};

export type AppSettings = {
  company: CompanySettings;
  payment: PaymentSettings;
  billing: BillingSettings;
  mail: MailSettings;
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
  mail: {
    notifySales: true,
    salesEmails: [],
    salesSubject: "Nouvelle demande de devis {{type}} — {{nom}} ({{reference}})",
    salesBody:
      "Bonjour,\n\nUne nouvelle demande de devis vient d'arriver sur le site.\n\nDemandeur : {{nom}}\nTéléphone : {{telephone}}\nE-mail : {{email}}\nVille : {{ville}}\nObjectif : {{objectif}}\n\n{{reponses}}\n\nMerci de contacter le client rapidement.\nRéférence {{reference}}, reçue le {{date}}.\nVoir dans l'administration : {{lien_admin}}",
    confirmCustomer: true,
    customerSubject: "Nous avons bien reçu votre demande de devis ({{reference}})",
    customerBody:
      "Bonjour {{nom}},\n\nMerci d'avoir demandé un devis à {{entreprise}}. Votre demande {{reference}} est bien enregistrée : un conseiller vous recontacte très prochainement au {{telephone}}.\n\nRécapitulatif de votre demande :\n\n{{reponses}}\n\nÀ très vite,\nL'équipe {{entreprise}}\n{{telephone_entreprise}} · {{email_entreprise}}",
    replyTo: "",
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
