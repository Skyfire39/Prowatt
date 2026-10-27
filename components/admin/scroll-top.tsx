"use client";

import { useEffect } from "react";

/** Remonte en haut de la page à l'affichage : le bandeau de confirmation d'un enregistrement s'y trouve. */
export function ScrollTop() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  return null;
}
