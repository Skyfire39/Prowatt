import { CheckIcon } from "./icons";
import type { Block } from "@/lib/guides";

/** Identifiant d'ancre d'un intertitre : « Le vrai calcul : le coût par cycle » → « le-vrai-calcul-le-cout-par-cycle ». */
export const anchor = (h: string) =>
  h
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Corps d'un guide : paragraphes, listes, tableaux et encadrés, mis en page pour la lecture. */
export function GuideBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mt-5 grid gap-5">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return (
              <p key={i} className="text-lg leading-relaxed text-ink/80">
                {b.text}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="grid gap-3">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-3 text-lg leading-relaxed text-ink/80">
                    <span className="mt-1.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                      <CheckIcon className="size-3.5" />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="grid gap-3">
                {b.items.map((it, n) => (
                  <li key={it} className="flex gap-3.5 text-lg leading-relaxed text-ink/80">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-on-accent tabular-nums">{n + 1}</span>
                    {it}
                  </li>
                ))}
              </ol>
            );
          case "table":
            return (
              <figure key={i} className="grid gap-2">
                <div className="glass overflow-x-auto rounded-2xl">
                  <table className="w-full min-w-[34rem] border-collapse text-left text-[15px]">
                    <thead>
                      <tr className="border-b border-line bg-accent-soft/60">
                        {b.head.map((h, c) => (
                          <th key={c} scope="col" className="px-4 py-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r, n) => (
                        <tr key={n} className="border-b border-line/60 last:border-0">
                          {r.map((cell, c) => (c === 0 ? <th key={c} scope="row" className="px-4 py-3 align-top font-semibold">{cell}</th> : <td key={c} className="px-4 py-3 align-top text-ink/80">{cell}</td>))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {b.note && <figcaption className="px-1 text-sm text-muted">{b.note}</figcaption>}
              </figure>
            );
          case "tip":
            return (
              <aside key={i} className="glass-lime rounded-2xl p-5 sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.14em]">{b.title}</p>
                <p className="mt-1.5 leading-relaxed">{b.text}</p>
              </aside>
            );
        }
      })}
    </div>
  );
}
