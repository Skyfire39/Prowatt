/** Lignes de la fiche technique d'une moto, dans l'ordre d'affichage. */
export const specFields = [
  { key: "power", label: "Puissance du moteur", placeholder: "ex. 3 000 W" },
  { key: "speed", label: "Vitesse maximale", placeholder: "ex. 75 km/h" },
  { key: "range", label: "Autonomie", placeholder: "ex. 120 km" },
  { key: "battery", label: "Type de batterie", placeholder: "ex. Lithium" },
  { key: "batteryPower", label: "Capacité de la batterie", placeholder: "ex. 28A 74V" },
  { key: "charge", label: "Temps de charge", placeholder: "ex. 6 à 8 h" },
  { key: "warranty", label: "Garantie", placeholder: "ex. 2 ans ou 20 000 km" },
  { key: "trunk", label: "Caisse arrière", placeholder: "ex. 9 L" },
  { key: "brakes", label: "Freins", placeholder: "ex. Disque avant, tambour arrière" },
  { key: "tires", label: "Pneus", placeholder: "ex. 90/90-12" },
  { key: "dimensions", label: "Dimensions", placeholder: "ex. 1 750 × 690 × 1 080 mm" },
  { key: "weight", label: "Poids", placeholder: "ex. 85 kg" },
  { key: "load", label: "Charge maximale", placeholder: "ex. 150 kg" },
  { key: "seat", label: "Hauteur de selle", placeholder: "ex. 760 mm" },
] as const;
