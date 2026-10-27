"use client";

import { loginAction, setupAction } from "@/app/admin/auth-actions";
import { Field, FormError, inputClass } from "./ui";
import { SubmitButton, useActionForm } from "./client";

export function LoginForm() {
  const { state, onSubmit, pending } = useActionForm(loginAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-5" noValidate>
      <Field label="Adresse e-mail">
        <input name="email" type="email" required autoComplete="username" autoFocus className={inputClass} placeholder="vous@prowatt.mg" />
      </Field>
      <Field label="Mot de passe">
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <FormError message={state?.error} />
      <SubmitButton pending={pending} pendingLabel="Connexion…" className="mt-1 h-12 w-full">
        Se connecter
      </SubmitButton>
    </form>
  );
}

export function SetupForm({ needsCode }: { needsCode: boolean }) {
  const { state, onSubmit, pending } = useActionForm(setupAction);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-5" noValidate>
      <Field label="Votre nom" required>
        <input name="name" required autoComplete="name" autoFocus className={inputClass} />
      </Field>
      <Field label="Adresse e-mail" required>
        <input name="email" type="email" required autoComplete="username" className={inputClass} />
      </Field>
      <Field label="Mot de passe" required hint="10 caractères minimum, avec au moins une lettre et un chiffre.">
        <input name="password" type="password" required autoComplete="new-password" className={inputClass} />
      </Field>
      <Field label="Confirmer le mot de passe" required>
        <input name="confirm" type="password" required autoComplete="new-password" className={inputClass} />
      </Field>
      {needsCode && (
        <Field label="Code d'installation" required hint="La valeur de ADMIN_SETUP_CODE définie sur le serveur.">
          <input name="code" type="password" required autoComplete="off" className={inputClass} />
        </Field>
      )}
      <FormError message={state?.error} />
      <SubmitButton pending={pending} pendingLabel="Création…" className="mt-1 h-12 w-full">
        Créer le compte propriétaire
      </SubmitButton>
    </form>
  );
}
