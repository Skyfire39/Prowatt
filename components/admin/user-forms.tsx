"use client";

import { createUserAction, resetUserPasswordAction, updateUserAction } from "@/app/admin/(panel)/utilisateurs/actions";
import { changeOwnPasswordAction, updateOwnNameAction } from "@/app/admin/(panel)/compte/actions";
import { ROLES, roleDescriptions, roleLabels, type Role } from "@/lib/auth/permissions";
import { Field, FormError, Panel, Toggle, inputClass, selectClass } from "./ui";
import { SubmitButton, useActionForm } from "./client";

function Result({ state }: { state: { error?: string; ok?: string } | null }) {
  if (state?.ok) return <p role="status" className="rounded-xl border border-lime bg-lime/40 px-4 py-3 text-sm font-medium text-teal">{state.ok}</p>;
  return <FormError message={state?.error} />;
}

export function RoleSelect({ defaultValue, disabled }: { defaultValue: string; disabled?: boolean }) {
  return (
    <select name="role" defaultValue={defaultValue} disabled={disabled} className={selectClass}>
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {roleLabels[r]} — {roleDescriptions[r]}
        </option>
      ))}
    </select>
  );
}

export function CreateUserForm() {
  const { state, onSubmit, pending } = useActionForm(createUserAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-5">
      <Field label="Nom" required>
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Adresse e-mail" required>
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Rôle" required>
        <RoleSelect defaultValue="sales" />
      </Field>
      <Field label="Mot de passe provisoire" required hint="10 caractères minimum, avec une lettre et un chiffre. À transmettre à l'utilisateur.">
        <input name="password" type="text" autoComplete="off" required className={inputClass} />
      </Field>
      <Result state={state} />
      <SubmitButton pending={pending} pendingLabel="Création…">Créer le compte</SubmitButton>
    </form>
  );
}

export function EditUserForm({ user, self }: { user: { id: string; name: string; email: string; role: string; active: boolean }; self: boolean }) {
  const { state, onSubmit, pending } = useActionForm(updateUserAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-5">
      <input type="hidden" name="id" value={user.id} />
      <Field label="Nom" required>
        <input name="name" defaultValue={user.name} required className={inputClass} />
      </Field>
      <Field label="Adresse e-mail">
        <input value={user.email} disabled className={inputClass} readOnly />
      </Field>
      <Field label="Rôle" hint={self ? "Vous ne pouvez pas modifier votre propre rôle." : roleDescriptions[user.role as Role]}>
        {self ? (
          <>
            <input type="hidden" name="role" value={user.role} />
            <input value={roleLabels[user.role as Role] ?? user.role} disabled readOnly className={inputClass} />
          </>
        ) : (
          <RoleSelect defaultValue={user.role} />
        )}
      </Field>
      {self ? <input type="hidden" name="active" value="on" /> : <Toggle name="active" label="Compte actif" defaultChecked={user.active} hint="Un compte désactivé ne peut plus se connecter." />}
      <Result state={state} />
      <SubmitButton pending={pending} pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const { state, onSubmit, pending } = useActionForm(resetUserPasswordAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="id" value={id} />
      <Field label="Nouveau mot de passe provisoire" hint="L'utilisateur sera déconnecté de tous ses appareils.">
        <input name="password" type="text" autoComplete="off" required className={inputClass} />
      </Field>
      <Result state={state} />
      <SubmitButton pending={pending} variant="soft" pendingLabel="Réinitialisation…">Réinitialiser le mot de passe</SubmitButton>
    </form>
  );
}

export function OwnPasswordForm() {
  const { state, onSubmit, pending } = useActionForm(changeOwnPasswordAction);
  return (
    <form method="post" onSubmit={onSubmit}>
      <Panel title="Mot de passe" subtitle="Changer votre mot de passe déconnecte vos autres appareils.">
        <div className="grid gap-5">
          <Field label="Mot de passe actuel" required>
            <input name="current" type="password" autoComplete="current-password" required className={inputClass} />
          </Field>
          <Field label="Nouveau mot de passe" required hint="10 caractères minimum, avec au moins une lettre et un chiffre.">
            <input name="password" type="password" autoComplete="new-password" required className={inputClass} />
          </Field>
          <Field label="Confirmer le nouveau mot de passe" required>
            <input name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
          </Field>
          <Result state={state} />
          <SubmitButton pending={pending} pendingLabel="Mise à jour…" className="w-fit">Changer le mot de passe</SubmitButton>
        </div>
      </Panel>
    </form>
  );
}

export function OwnNameForm({ name }: { name: string }) {
  const { state, onSubmit, pending } = useActionForm(updateOwnNameAction);
  return (
    <form method="post" onSubmit={onSubmit}>
      <Panel title="Profil">
        <div className="grid gap-5">
          <Field label="Nom affiché" required>
            <input name="name" defaultValue={name} required className={inputClass} />
          </Field>
          <Result state={state} />
          <SubmitButton pending={pending} pendingLabel="Enregistrement…" className="w-fit">Enregistrer</SubmitButton>
        </div>
      </Panel>
    </form>
  );
}
