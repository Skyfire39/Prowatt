/**
 * Adresse de rappel (X-Callback-URL) que MVola appelle quand une transaction change d'état.
 * Il n'y a pas de base de données : on accuse réception sans rien en déduire, et la source de
 * vérité reste le statut interrogé auprès de MVola (route /api/mvola/status). À brancher sur une
 * base de commandes si elles doivent être confirmées sans que le client garde la page ouverte.
 */
export async function POST() {
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
