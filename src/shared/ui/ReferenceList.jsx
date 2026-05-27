import { BookOpenCheck, ExternalLink } from 'lucide-react'

export function ReferenceList({ sources }) {
  if (!sources?.length) return null

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[var(--shadow-2)]">
      <header className="border-b border-[color:var(--stroke)] bg-[color:var(--panel)] px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[color:var(--ink-soft)]">Referências consultadas</h3>
      </header>
      <div className="divide-y divide-[color:var(--stroke)]/50">
        {sources.map((source, i) => (
          <article
            key={`${source.source}-${source.page}-${i}`}
            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[color:var(--panel-muted)]/50"
          >
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[color:var(--accent-soft)] text-[var(--color-accent)] shadow-[var(--shadow-xs)]">
              <BookOpenCheck size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-[color:var(--ink)]">
                {source.article_number ? `Art. ${source.article_number}` : source.title}
              </h4>
              <p className="mt-0.5 text-[11px] text-[color:var(--ink-soft)]">{source.title} · pág. {source.page || 'N/D'}</p>
              {source.excerpt ? (
                <p className="mt-1.5 text-[12px] leading-5 text-[color:var(--ink-soft)]">
                  {source.excerpt.slice(0, 180)}{source.excerpt.length > 180 ? '…' : ''}
                </p>
              ) : null}
            </div>
            {source.deep_link ? (
              <a href={source.deep_link} target="_blank" rel="noreferrer" className="mt-1 shrink-0 rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] p-1.5 text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--accent)]">
                <ExternalLink size={13} />
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
