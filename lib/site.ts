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
};

export const mailto = (subject: string, body = "") =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`;

export const whatsappHref = (text: string) =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
