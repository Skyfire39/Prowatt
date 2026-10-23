"use client";

import type { FormEvent } from "react";
import { mailto } from "@/lib/site";
import { ArrowIcon } from "./icons";
import { fieldClass } from "./quote-form";

export function ContactForm({
  labels,
  subject,
}: {
  labels: { name: string; email: string; message: string; send: string };
  subject: string;
}) {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = `${labels.name} : ${d.get("name")}\n${labels.email} : ${d.get("email")}\n\n${d.get("message")}`;
    window.location.href = mailto(subject, body);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          {labels.name}
          <input name="name" required autoComplete="name" className={fieldClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {labels.email}
          <input name="email" type="email" required autoComplete="email" className={fieldClass} />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        {labels.message}
        <textarea name="message" rows={6} required className={`${fieldClass} resize-none`} />
      </label>
      <button
        type="submit"
        className="group inline-flex h-12 w-fit items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-medium text-on-accent shadow-lg shadow-teal/25 transition-transform hover:scale-[1.03] active:scale-95"
      >
        {labels.send}
        <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
