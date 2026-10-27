"use client";

import { TrashIcon } from "@/components/icons";
import { ConfirmButton, SubmitButton, useActionForm } from "./client";
import { MailCheckIcon, MailOffIcon, UploadIcon } from "./icons";
import { Field, FormError, btn, textareaClass } from "./ui";
import {
  deleteSubscriberAction,
  importSubscribersAction,
  syncAllAction,
  syncOneAction,
  testConnectionAction,
  toggleStatusAction,
} from "@/app/admin/(panel)/newsletter/actions";

const Ok = ({ message }: { message?: string | null }) =>
  message ? (
    <p role="status" className="rounded-xl border border-lime bg-lime/40 px-4 py-3 text-sm font-medium text-teal">
      {message}
    </p>
  ) : null;

/** Collage d'adresses : une par ligne, ou séparées par des virgules. */
export function ImportForm() {
  const { state, onSubmit, pending } = useActionForm(importSubscribersAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-4">
      <Field label="Adresses e-mail" hint="Une par ligne, ou séparées par des virgules. Les doublons sont ignorés.">
        <textarea name="emails" rows={5} className={textareaClass} placeholder={"client@exemple.com\nautre@exemple.com"} />
      </Field>
      <FormError message={state?.error} />
      <Ok message={state?.ok} />
      <SubmitButton pending={pending} pendingLabel="Ajout…" className="w-fit">
        Ajouter à la liste
      </SubmitButton>
    </form>
  );
}

/** Test de la clé API et de l'audience Mailchimp. */
export function ConnectionTest() {
  const { state, onSubmit, pending } = useActionForm(testConnectionAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-3">
      <SubmitButton variant="soft" pending={pending} pendingLabel="Test en cours…" className="w-fit">
        Tester la connexion
      </SubmitButton>
      <FormError message={state?.error} />
      <Ok message={state?.ok} />
    </form>
  );
}

/** Envoie à Mailchimp tous les abonnés en attente ou en échec. */
export function SyncAll({ pendingCount }: { pendingCount: number }) {
  const { state, onSubmit, pending } = useActionForm(syncAllAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-3">
      <SubmitButton variant={pendingCount > 0 ? "primary" : "soft"} pending={pending} pendingLabel="Envoi en cours…" className="w-fit">
        {pendingCount > 0 ? `Envoyer ${pendingCount} abonné${pendingCount > 1 ? "s" : ""} à Mailchimp` : "Tout est synchronisé"}
      </SubmitButton>
      <FormError message={state?.error} />
      <Ok message={state?.ok} />
    </form>
  );
}

/** Actions d'une ligne : renvoyer à Mailchimp, (ré)abonner, supprimer. */
export function RowActions({ id, email, status, canSync }: { id: string; email: string; status: string; canSync: boolean }) {
  return (
    <form className="relative flex justify-end gap-1.5">
      <input type="hidden" name="id" value={id} />
      {canSync && status === "subscribed" && (
        <SubmitButton formAction={syncOneAction} variant="soft" size="icon" title="Envoyer à Mailchimp" aria-label={`Envoyer ${email} à Mailchimp`}>
          <UploadIcon className="size-[18px]" />
        </SubmitButton>
      )}
      <SubmitButton
        formAction={toggleStatusAction}
        variant="ghost"
        size="icon"
        title={status === "subscribed" ? "Désabonner" : "Réabonner"}
        aria-label={`${status === "subscribed" ? "Désabonner" : "Réabonner"} ${email}`}
      >
        {status === "subscribed" ? <MailOffIcon className="size-[18px]" /> : <MailCheckIcon className="size-[18px]" />}
      </SubmitButton>
      <ConfirmButton
        formAction={deleteSubscriberAction}
        variant="danger"
        size="icon"
        title="Supprimer cette adresse ?"
        message={`${email} sera retirée de la sauvegarde du site. Le contact éventuel dans Mailchimp n'est pas supprimé.`}
        confirmLabel="Supprimer"
      >
        <TrashIcon className="size-[18px]" />
        <span className="sr-only">Supprimer {email}</span>
      </ConfirmButton>
    </form>
  );
}

/** Lien de téléchargement CSV (le fichier est généré côté serveur avec les filtres en cours). */
export function ExportLink({ href, children, variant = "soft" }: { href: string; children: React.ReactNode; variant?: "soft" | "primary" }) {
  return (
    <a href={href} download className={btn(variant, "md")}>
      {children}
    </a>
  );
}
