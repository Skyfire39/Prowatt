import { dbConfigured } from "@/lib/db";
import { saveSubscriber, syncSubscriber } from "@/lib/newsletter";
import { isEmail } from "@/lib/validate";

const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

// 6 inscriptions par minute et par IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

/**
 * Inscription à la newsletter depuis le formulaire du site.
 * L'adresse est d'abord sauvegardée dans la base (elle reste visible et exportable dans l'administration),
 * puis envoyée à Mailchimp. Un échec Mailchimp n'est jamais montré au visiteur : l'adresse est gardée
 * et pourra être renvoyée depuis l'administration.
 */
export async function POST(request: Request) {
  if (!dbConfigured()) return json({ ok: false, error: "not_configured" }, 503);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  let b: Record<string, unknown>;
  try {
    b = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  // Champ piège invisible : seuls les robots le remplissent. On répond « ok » sans rien enregistrer.
  if (typeof b.website === "string" && b.website.trim()) return json({ ok: true });

  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (email.length > 254 || !isEmail(email)) return json({ ok: false, error: "invalid_email" }, 400);

  try {
    const { id, alreadySubscribed } = await saveSubscriber(email, "site");
    // Même pour une adresse déjà connue, on renvoie à Mailchimp : cela rattrape un envoi qui avait échoué.
    const res = await syncSubscriber(id);
    if (!res.ok && !res.notConfigured && !res.skipped) console.error("[newsletter] Mailchimp :", res.error);
    if (alreadySubscribed) return json({ ok: false, error: "already_subscribed" }, 409);
  } catch (e) {
    console.error("[newsletter] échec d'enregistrement", e instanceof Error ? e.message : e);
    return json({ ok: false, error: "server_error" }, 500);
  }
  return json({ ok: true });
}
