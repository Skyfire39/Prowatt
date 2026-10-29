import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { PageHero } from "@/components/ui";
import { loadPage } from "@/lib/page";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/content";
import { toSiteInfo } from "@/lib/site-info";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return pageMetadata({ ...dict.seo.contact, path: "/contact" });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang, dict } = await loadPage(params);
  const d = dict.contact;
  const site = toSiteInfo(await getSettings());

  const infos = [
    { icon: PhoneIcon, label: d.phone, value: site.phone, href: site.phoneHref },
    { icon: MailIcon, label: d.email, value: site.email, href: `mailto:${site.email}` },
    { icon: MapPinIcon, label: d.address, value: site.address[lang] },
  ];

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} photo={{ src: "/images/contact-prowatt.webp", pos: "50% 40%", alt: dict.contact.photoAlt }} />
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="grid gap-4">
              {infos.map((i) => (
                <div key={i.label} className="glass flex items-start gap-4 rounded-2xl p-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent">
                    <i.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">{i.label}</p>
                    {i.href ? (
                      <a href={i.href} className="mt-1 block break-words font-medium hover:text-accent">
                        {i.value}
                      </a>
                    ) : (
                      <p className="mt-1 font-medium">{i.value}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="glass flex items-start gap-4 rounded-2xl p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-on-accent">
                  <ClockIcon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">{d.hours}</p>
                  <ul className="mt-1 space-y-0.5 font-medium">
                    {site.hours[lang].map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="glass-strong h-full rounded-3xl p-6 sm:p-10">
              <h2 className="mb-6 text-3xl tracking-tight">{d.formTitle}</h2>
              <ContactForm
                labels={{ name: d.name, email: d.emailField, message: d.message, send: d.send }}
                subject={dict.form.subjectContact}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
