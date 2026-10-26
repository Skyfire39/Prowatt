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

export function toSiteInfo(s: AppSettings): SiteInfo {
  return {
    name: s.company.name,
    email: s.company.email,
    phone: s.company.phone,
    phoneHref: `tel:+${s.company.phone.replace(/\D/g, "")}`,
    whatsappNumber: s.company.whatsappNumber,
    address: s.company.address,
    hours: s.company.hours,
    payment: s.payment,
  };
}
