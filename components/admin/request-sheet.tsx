import { Logo } from "@/components/logo";
import type { QuoteRequestAnswers } from "@/lib/db/schema";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { requestKinds, requestStatuses, type RequestStatus } from "@/lib/quote-requests";
import type { AppSettings } from "@/lib/settings";

export type RequestSheetProps = {
  reference: string;
  kind: string;
  status: string;
  createdAt: Date;
  name: string;
  contact: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  answers: QuoteRequestAnswers;
  settings: AppSettings;
};

/** Mêmes valeurs que les autres champs : une date AAAA-MM-JJ s'affiche en français. */
const show = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtDate(v) : v);

/** Feuille A4 d'une demande de devis reçue : logo Prowatt, coordonnées du demandeur, puis toutes ses réponses. */
export function RequestSheet(p: RequestSheetProps) {
  const { company, billing } = p.settings;
  const st = requestStatuses[p.status as RequestStatus] ?? requestStatuses.new;

  return (
    <article className="print-sheet relative mx-auto w-full max-w-[210mm] overflow-hidden rounded-2xl bg-white p-[12mm] text-[13px] leading-relaxed text-[#12413c] shadow-[0_20px_60px_rgb(23_92_85/0.18)] sm:p-[14mm]">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-[#175c55] pb-6">
        <div>
          <Logo variant="wordmark" className="h-11 w-auto" />
          <div className="mt-4 space-y-0.5 text-[12px] text-[#4b6f6a]">
            <p className="font-semibold text-[#12413c]">{billing.legalName || company.name}</p>
            <p>{billing.address || company.address.fr}</p>
            <p>
              {company.phone} · {company.email}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold uppercase leading-tight tracking-[0.1em] text-[#175c55]">
            Demande
            <br />
            de devis
          </p>
          <p className="mt-2 text-lg font-semibold tabular-nums">{p.reference}</p>
          <dl className="mt-3 grid grid-cols-[auto_auto] justify-end gap-x-4 gap-y-0.5 text-[12px]">
            <dt className="text-[#4b6f6a]">Reçue le</dt>
            <dd className="font-medium">{fmtDateTime(p.createdAt)}</dd>
            <dt className="text-[#4b6f6a]">Type</dt>
            <dd className="font-medium">{requestKinds[p.kind as keyof typeof requestKinds] ?? p.kind}</dd>
            <dt className="text-[#4b6f6a]">Suivi</dt>
            <dd className="font-medium">{st.label}</dd>
          </dl>
        </div>
      </header>

      <section className="mt-8 rounded-2xl bg-[#eef6e1] p-5">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4b6f6a]">Demandeur</p>
        <p className="text-lg font-semibold">{p.name}</p>
        <dl className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {p.contact && <Row label="Contact" value={p.contact} />}
          <Row label="Téléphone" value={p.phone} />
          {p.email && <Row label="E-mail" value={p.email} />}
          {p.city && <Row label="Ville" value={p.city} />}
        </dl>
      </section>

      {p.answers.map((section) => (
        <section key={section.section} className="mt-7 break-inside-avoid">
          <h2 className="rounded-lg bg-[#175c55] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white">{section.section}</h2>
          <table className="w-full border-collapse text-left">
            <tbody>
              {section.items.map((it, i) => (
                <tr key={i} className="break-inside-avoid border-b border-[#175c55]/12">
                  <th className="w-[46%] px-3 py-2.5 align-top font-normal text-[#4b6f6a]">{it.label}</th>
                  <td className="px-3 py-2.5 font-medium">{show(it.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <footer className="mt-10 border-t border-[#175c55]/20 pt-4 text-center text-[11px] text-[#4b6f6a]">
        {billing.legalName || company.name} · {company.phone} · {company.email}
      </footer>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-[#4b6f6a]">{label}</dt>
      <dd className="break-words font-medium">{value}</dd>
    </div>
  );
}
