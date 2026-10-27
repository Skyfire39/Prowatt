/** Réalisations : limites et champs chiffrés communs au formulaire et à l'action d'enregistrement. */
export const MAX_PROJECT_IMAGES = 12;

/** Caractéristiques chiffrées d'un chantier (toutes facultatives). */
export const projectNumbers = [
  { key: "kwc", label: "Puissance (kWc)", placeholder: "ex. 132" },
  { key: "storageKwh", label: "Stockage (kWh)", placeholder: "ex. 60" },
  { key: "inverterKva", label: "Onduleur (kVA)", placeholder: "ex. 30" },
  { key: "capacityL", label: "Capacité (L)", placeholder: "ex. 200" },
  { key: "coveragePct", label: "Couverture des besoins (%)", placeholder: "ex. 80" },
  { key: "autonomyHours", label: "Autonomie (h)", placeholder: "ex. 12" },
  { key: "annualKwh", label: "Production annuelle (kWh)", placeholder: "ex. 21 000" },
  { key: "roiYears", label: "Retour sur investissement (ans)", placeholder: "ex. 4" },
  { key: "co2", label: "CO₂ évité (t/an)", placeholder: "ex. 59" },
  { key: "warrantyYears", label: "Garantie (ans)", placeholder: "ex. 3" },
] as const;
