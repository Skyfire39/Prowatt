import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton, SubmitButton } from "@/components/admin/client";
import { Badge, Field, Flash, LinkBtn, PageHeader, Panel, selectClass, textareaClass } from "@/components/admin/ui";
import { MailIcon, PhoneIcon } from "@/components/icons";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { requestKinds, requestStatusList, requestStatuses, type RequestStatus } from "@/lib/quote-requests";
import { isUuid } from "@/lib/validate";
import { createRequestCustomerAction, deleteRequestAction, updateRequestAction } from "../actions";

export const metadata: Metadata = { title: "Demande de devis" };

const show = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtDate(v) : v);

export default async function RequestPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser("quotes.read");
  const { id } = await params;
  const { ok } = await searchParams;
  if (!isUuid(id)) notFound();
  const db = await getDb();
  const [r] = await db.select().from(schema.quoteRequests).where(eq(schema.quoteRequests.id, id)).limit(1);
  if (!r) notFound();

  const customer = r.customerId ? (await db.select({ id: schema.customers.id, name: schema.customers.name }).from(schema.customers).where(eq(schema.customers.id, r.customerId)).limit(1))[0] : undefined;
  const st = requestStatuses[r.status as RequestStatus] ?? requestStatuses.new;
  const canWrite = can(user.role, "quotes.write");

  return (
    <>
      <Flash code={ok} />
      <PageHeader
        eyebrow={`Demande de devis · ${fmtDateTime(r.createdAt)}`}
        title={r.name}
        subtitle={<span className="tabular-nums">{r.ref}</span>}
        back={{ href: "/admin/demandes", label: "Toutes les demandes" }}
        actions={
          <>
            <Badge tone={r.kind === "company" ? "blue" : "lime"}>{requestKinds[r.kind as keyof typeof requestKinds] ?? r.kind}</Badge>
            <Badge tone={st.tone}>{st.label}</Badge>
            <LinkBtn href={`/admin/demandes/${r.id}/imprimer`} variant="primary">
              Exporter en PDF
            </LinkBtn>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          {r.answers.map((section) => (
            <Panel key={section.section} title={section.section}>
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {section.items.map((it, i) => (
                  <div key={i}>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{it.label}</dt>
                    <dd className="mt-0.5 font-medium">{show(it.value)}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          ))}
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Demandeur">
            <p className="text-lg font-semibold">{r.name}</p>
            {r.contact && <p className="text-sm text-muted">Contact : {r.contact}</p>}
            <div className="mt-3 grid gap-2 text-sm">
              <a href={`tel:${r.phone}`} className="flex items-center gap-2.5 font-medium hover:underline">
                <PhoneIcon className="size-4 text-muted" />
                {r.phone}
              </a>
              {r.email && (
                <a href={`mailto:${r.email}`} className="flex items-center gap-2.5 break-all font-medium hover:underline">
                  <MailIcon className="size-4 text-muted" />
                  {r.email}
                </a>
              )}
              {r.city && <p className="text-muted">{r.city}</p>}
            </div>
          </Panel>

          {canWrite && (
            <Panel title="Suivi">
              <form action={updateRequestAction} className="grid gap-4">
                <input type="hidden" name="id" value={r.id} />
                <Field label="Statut">
                  <select name="status" defaultValue={r.status} className={selectClass}>
                    {requestStatusList.map((s) => (
                      <option key={s} value={s}>
                        {requestStatuses[s].label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Note interne" hint="Visible seulement dans l'administration, absente du PDF.">
                  <textarea name="note" defaultValue={r.note ?? ""} rows={4} maxLength={2000} className={textareaClass} />
                </Field>
                <SubmitButton pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
              </form>
            </Panel>
          )}

          <Panel title="Client et devis">
            {customer ? (
              <div className="grid gap-3 text-sm">
                <p>
                  Fiche client : {" "}
                  <Link href={`/admin/clients/${customer.id}`} className="font-semibold text-accent hover:underline">
                    {customer.name}
                  </Link>
                </p>
                {can(user.role, "quotes.write") && (
                  <LinkBtn href={`/admin/devis/nouveau?client=${customer.id}`} variant="lime">
                    Préparer un devis
                  </LinkBtn>
                )}
              </div>
            ) : can(user.role, "customers.write") ? (
              <form action={createRequestCustomerAction} className="grid gap-3">
                <input type="hidden" name="id" value={r.id} />
                <p className="text-sm text-muted">Aucune fiche client n&apos;est liée à cette demande.</p>
                <SubmitButton variant="lime" pendingLabel="Création…">
                  Créer la fiche client
                </SubmitButton>
              </form>
            ) : (
              <p className="text-sm text-muted">Aucune fiche client liée.</p>
            )}
          </Panel>

          {canWrite && (
            <form action={deleteRequestAction}>
              <input type="hidden" name="id" value={r.id} />
              <ConfirmButton title="Supprimer cette demande ?" message="La demande disparaît définitivement de l'administration. La fiche client n'est pas supprimée." confirmLabel="Supprimer" variant="danger" className="w-full">
                Supprimer la demande
              </ConfirmButton>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// Espace authentifié : la page lit la session à chaque requête et n'est pas prérendue.
export const instant = false;
