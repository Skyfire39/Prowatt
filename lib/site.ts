// Coordonnées publiées sur prowattmadagascar.com
export const site = {
  name: "Prowatt Madagascar",
  email: "info@prowattmadagascar.com",
  phone: "+261 34 34 222 20",
  phoneHref: "tel:+261343422220",
  // Numéro du site utilisé pour WhatsApp (format international sans « + »).
  whatsappNumber: "261343422220",
  address: {
    fr: "Antananarivo, Ankadifotsy, à 20 m de la station Shell",
    en: "Antananarivo, Ankadifotsy, 20 m from the Shell station",
  },
  hours: {
    fr: ["Lundi – vendredi : 8h – 18h30", "Samedi : 8h – 12h30", "Dimanche : fermé"],
    en: ["Monday – Friday: 8am – 6:30pm", "Saturday: 8am – 12:30pm", "Sunday: closed"],
  },
  stats: { kwc: 5200, clients: 1200, co2: 22500 },
  /**
   * Coordonnées de paiement affichées dans la commande. À RENSEIGNER par Prowatt : tant qu'un champ
   * est vide, il n'est pas affiché et le client est prévenu que l'équipe lui communique les
   * coordonnées à la confirmation. Ne jamais mettre ici de clé secrète.
   */
  payment: {
    mvola: { number: "", holder: "" },
    bank: { bank: "", holder: "", account: "" },
    // Lien de paiement hébergé par le prestataire de cartes (page de paiement du prestataire).
    card: { url: "" },
  },
};

export type PaymentConfig = typeof site.payment;

/** Coordonnées utilisées pour les liens e-mail et WhatsApp (celles de l'administration, ou celles par défaut). */
export type Contact = { email: string; whatsappNumber: string };

export const mailto = (subject: string, body = "", email: string = site.email) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;

export const whatsappHref = (text: string, number: string = site.whatsappNumber) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
