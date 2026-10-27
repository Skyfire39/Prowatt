import { CheckIcon } from "./icons";

type Block = { kind: "text"; text: string } | { kind: "list"; title?: string; items: string[] };

/** Découpe la description importée (« • Clé : valeur », titres, paragraphes) en blocs lisibles. */
function parse(raw: string): Block[] {
  const blocks: Block[] = [];
  let pendingTitle: string | undefined;
  for (const line of raw.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const bullet = line.match(/^[•\-–*]\s*(.+)$/);
    if (bullet) {
      const last = blocks[blocks.length - 1];
      if (last?.kind === "list" && !pendingTitle) last.items.push(bullet[1]);
      else blocks.push({ kind: "list", title: pendingTitle, items: [bullet[1]] });
      pendingTitle = undefined;
    } else {
      if (pendingTitle) blocks.push({ kind: "text", text: pendingTitle });
      pendingTitle = line;
    }
  }
  if (pendingTitle) blocks.push({ kind: "text", text: pendingTitle });
  // Une ligne courte placée juste avant une liste est son titre : déjà géré ; sinon, texte courant.
  return blocks;
}

/**
 * Description de la fiche produit : le texte en prose, puis les caractéristiques
 * présentées en tableau (libellé / valeur) ou en liste à coches selon leur forme.
 */
export function ProductDescription({ text, title }: { text: string; title: string }) {
  const blocks = parse(text);
  return (
    <div className="glass shadow-none rounded-3xl p-6 sm:p-10">
      <h2 className="text-3xl tracking-tight sm:text-4xl">{title}</h2>
      <div className="mt-6 grid gap-8">
        {blocks.map((b, i) =>
          b.kind === "text" ? (
            <p key={i} className="max-w-3xl text-lg leading-relaxed text-muted">
              {b.text}
            </p>
          ) : (
            <div key={i}>
              {b.title && <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{b.title}</h3>}
              {b.items.every((it) => /^[^:]{2,40}\s:\s/.test(it)) ? (
                <dl className="grid overflow-hidden rounded-2xl border border-line bg-white/50 sm:grid-cols-2">
                  {b.items.map((it) => {
                    const [label, ...rest] = it.split(/\s:\s/);
                    return (
                      <div key={it} className="flex flex-col gap-0.5 border-b border-line px-5 py-3.5 sm:[&:nth-child(odd)]:border-r">
                        <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
                        <dd className="font-medium text-ink">{rest.join(" : ")}</dd>
                      </div>
                    );
                  })}
                </dl>
              ) : (
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {b.items.map((it) => (
                    <li key={it} className="flex gap-3 leading-relaxed text-ink">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-lime text-teal">
                        <CheckIcon className="size-3.5" />
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
