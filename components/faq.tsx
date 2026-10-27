import { JsonLd } from "./json-ld";
import { Reveal } from "./motion";

/**
 * Questions fréquentes : accordéon natif (`details`, sans JavaScript) et données structurées FAQPage pour que les réponses
 * puissent apparaître directement dans les résultats de recherche. Les réponses affichées sont exactement celles du balisage.
 */
export function Faq({ eyebrow, title, items }: { eyebrow: string; title: string; items: { q: string; a: string }[] }) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
        }}
      />
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 text-balance text-4xl tracking-tight sm:text-5xl">{title}</h2>
        </Reveal>
        <div className="mt-10 grid gap-3">
          {items.map((it, i) => (
            <Reveal key={it.q} delay={Math.min(i, 4) * 0.05}>
              <details className="glass group rounded-2xl open:bg-white/70">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-lg font-semibold tracking-tight marker:hidden [&::-webkit-details-marker]:hidden sm:px-6">
                  {it.q}
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-transform duration-300 group-open:rotate-45">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-muted sm:px-6">{it.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
