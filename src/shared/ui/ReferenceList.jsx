import { BookOpenCheck, Gavel, ExternalLink } from 'lucide-react'

export function ReferenceList({ sources }) {
  if (!sources?.length) return null

  const isJuris = (s) => s.source_kind === 'jurisprudence' || s.source_scope === 'jurisprudence'
  const legislation = sources.filter((s) => !isJuris(s))
  const jurisprudence = sources.filter((s) => isJuris(s))

  const renderItem = (source, i) => (
    <article
      key={`${source.source}-${source.page}-${i}`}
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[color:var(--panel-muted)]/50"
    >
      <div className={classNames(
        'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] shadow-[var(--shadow-xs)]',
        isJuris(source)
          ? 'bg-[color:var(--gold)]/10 text-[color:var(--gold)]'
          : 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
      )}>
        {isJuris(source) ? <Gavel size={14} /> : <BookOpenCheck size={14} />}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-[color:var(--ink)]">
          {source.article_number ? `Art. ${source.article_number}` : source.title?.slice(0, 60)}
        </h4>
        <p className="mt-0.5 text-[11px] text-[color:var(--ink-soft)]">{source.title?.slice(0, 80)} · pag. {source.page || 'N/D'}</p>
        {source.excerpt ? (
          <p className="mt-1.5 text-[12px] leading-5 text-[color:var(--ink-soft)]">
            {source.excerpt.slice(0, 180)}{source.excerpt.length > 180 ? '...' : ''}
          </p>
        ) : null}
      </div>
      {source.deep_link ? (
        <a href={source.deep_link} target="_blank" rel="noreferrer" className="mt-1 shrink-0 rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] p-1.5 text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--accent)]">
          <ExternalLink size={13} />
        </a>
      ) : null}
    </article>
  )

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[var(--shadow-2)]">
      <header className="border-b border-[color:var(--stroke)] bg-[color:var(--panel)] px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[color:var(--ink-soft)]">Referencias consultadas</h3>
      </header>
      <div className="divide-y divide-[color:var(--stroke)]/50">
        {jurisprudence.map((source, i) => renderItem(source, i))}
        {legislation.map((source, i) => renderItem(source, i))}
      </div>
    </section>
  )
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
