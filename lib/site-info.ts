import type { AppSettings } from "./settings";

/** Même forme que l'objet `site` statique, alimentée par les réglages de l'administration. */
export type SiteInfo = {
  name: string;
  email: string;
  phone: string;
  phoneHref: string;
  whatsappNumber: string;
  address: { fr: string; en: string };
  hours: { fr: string[]; en: string[] };
  payment: AppSettings["payment"];
};

/** Numéro au format international sans « + » : un numéro malgache saisi en local (038…) devient 26138…. */
export const intlDigits = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `261${d.slice(1)}` : d;
};

export function toSiteInfo(s: AppSettings): SiteInfo {
  return {
    name: s.company.name,
    email: s.company.email,
    phone: s.company.phone,
    phoneHref: `tel:+${intlDigits(s.company.phone)}`,
    whatsappNumber: intlDigits(s.company.whatsappNumber),
    address: s.company.address,
    hours: s.company.hours,
    payment: s.payment,
  };
}
