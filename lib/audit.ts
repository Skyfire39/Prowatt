import { resetNavCounts } from "./admin/queries";
import { getDb, schema } from "./db";
import type { SessionUser } from "./auth/session";

/** Journalise une action de l'administration (qui, quoi, sur quoi). Ne doit jamais bloquer l'action. */
export async function logAudit(
  user: Pick<SessionUser, "id" | "name"> | null,
  action: string,
  entity: string,
  entityId?: string | null,
  detail?: string,
) {
  // Toute modification journalisée (commande, facture, paiement…) peut changer les badges de la navigation.
  resetNavCounts();
  try {
    const db = await getDb();
    await db.insert(schema.auditLog).values({
      userId: user?.id ?? null,
      userName: user?.name ?? "Système",
      action,
      entity,
      entityId: entityId ?? null,
      detail: detail?.slice(0, 500) ?? null,
    });
  } catch (e) {
    console.error("[audit] échec d'écriture", e instanceof Error ? e.message : e);
  }
}
