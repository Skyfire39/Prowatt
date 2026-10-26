"use client";

import { motion } from "motion/react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { mailto, whatsappHref } from "@/lib/site";
import { useSite } from "./catalog-provider";
import { MailIcon, WhatsAppIcon } from "./icons";

/**
 * Bulles de contact flottantes : WhatsApp (verre teal) et e-mail (verre lime),
 * dans le même langage que la barre de navigation.
 */
export function FloatingContact({ dict }: { dict: Dictionary["floating"] }) {
  const site = useSite();
  const items = [
    {
      key: "mail",
      href: mailto(dict.mailSubject, "", site.email),
      label: dict.mail,
      tone: "glass-lime",
      icon: MailIcon,
      external: false,
    },
    {
      key: "whatsapp",
      href: whatsappHref(dict.message, site.whatsappNumber),
      label: dict.whatsapp,
      tone: "glass-teal",
      icon: WhatsAppIcon,
      external: true,
    },
  ];

  return (
    <div
      role="group"
      aria-label={dict.group}
      className="floating-contact fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 + i * 0.12 }}
          className="group relative"
        >
          <span
            className="glass-nav pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-ink opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 sm:block"
            aria-hidden="true"
          >
            {item.label}
          </span>

          {item.key === "whatsapp" && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-teal/40 motion-safe:animate-ping"
              style={{ animationDuration: "2.6s" }}
            />
          )}

          <a
            href={item.href}
            aria-label={item.label}
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`${item.tone} relative grid size-12 place-items-center sm:size-14 rounded-full outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-4 focus-visible:ring-accent/40 active:scale-95`}
          >
            <item.icon className="size-6" />
          </a>
        </motion.div>
      ))}
    </div>
  );
}
