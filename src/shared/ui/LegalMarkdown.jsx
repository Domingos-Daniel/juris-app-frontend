import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const CITE_MARKER = '\u241F'

function normalizeBrackets(text) {
  if (!text) return ''
  return text
    // Double brackets
    .replace(/\[\[(.*?)\]\]/g, (_, inner) => `${CITE_MARKER}${inner}${CITE_MARKER}`)
    .replace(/\[\[([^\]\n]{3,200}?)\]/g, (_, inner) => `${CITE_MARKER}${inner}${CITE_MARKER}`)
    .replace(/\[\[(?=Art)/g, '[')
    // Single brackets
    .replace(/\[(Art(?:\S+)?\s*\d+\S*\s*[,\s][^\]]{3,180}?)\]/g, (_, inner) => {
      if (/^Art/i.test(inner.trim())) return `${CITE_MARKER}${inner}${CITE_MARKER}`
      return `[${inner}]`
    })
    // Pull bare "Art." references that start on a new line up to the previous sentence
    .replace(/\n+\s*(Art\.?\s*)/gi, ' $1')
    // Bare Art. N references (no brackets — full citation with diploma or just article number)
    .replace(/(?:^|(?<=[\s(]))(Art(?:igo)?\.?\s*(?:n\.?[º°]?\s*)?\d+(?:\s*(?:[,;]\s*[^.]{4,80}?)?(?:\s*[,;]\s*p\.?\s*\d+)?)?)/gi, (match) => {
      const trimmed = match.trim()
      if (trimmed.length < 5) return match
      return `${CITE_MARKER}${trimmed}${CITE_MARKER}`
    })
    .replace(/\(\(/g, '(')
    .replace(/\)\)/g, ')')
    .replace(/^\s*[.•·]+\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseCitation(text) {
  const cleaned = text.trim().replace(/^Art(?:igo|s|\.)?\.?\s*(?:n\.?[º°]?\s*)?/i, '')
  if (!cleaned) return null
  const am = cleaned.match(/^(\d+(?:\.?[º°ª]\d*)?)/)
  if (!am) return null
  const article = am[1]
  const rest = cleaned.slice(am[0].length).replace(/^[\s,;.]+/, '')
  const pm = rest.match(/[,;]?\s*p(?:\s*[aá]g)?\.?\s*(\d+)\s*$/)
  let page = null
  let diploma = rest
  if (pm) {
    page = pm[1]
    diploma = rest.slice(0, pm.index).replace(/^[\s,;.]+/, '').replace(/[\s,;.]+$/, '')
  } else {
    diploma = rest.replace(/^[\s,;.]+/, '').replace(/[\s,;.]+$/, '') || null
  }
  if (!diploma) diploma = null
  return { article, diploma, page }
}

function CitationReference({ text, sourceRefs, onSelectRef }) {
  const citation = parseCitation(text)
  if (!citation?.article) {
    return <span className="font-semibold text-[var(--color-accent)]">{text}</span>
  }
  const cleanNum = citation.article.replace(/[^\d]/g, '')
  const sourceIndex = sourceRefs.findIndex(s => {
    if (!s?.article_number) return false
    return String(s.article_number).replace(/[^\d]/g, '').includes(cleanNum)
  })

  const articleBase = citation.article.replace(/[\.\u00BA\u00AA].*$/, '').trim()
  const suffix = citation.article.replace(/^[\d]+/, '')  // e.g. "-A" in "267-A"
  const label = `Art. ${articleBase}${suffix}\u00BA`

  return (
    <span>
      <span className="font-semibold text-[var(--color-accent)]">{label}</span>
      {sourceIndex >= 0 && (
        <button
          type="button"
          data-ref-index={sourceIndex + 1}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectRef?.(sourceRefs[sourceIndex]) }}
          className="inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-sm bg-[var(--color-accent)]/15 px-1 text-[9px] font-bold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 align-super leading-none ml-1"
          title={citation.diploma ? `${citation.diploma}${citation.page ? ' · pág. ' + citation.page : ''}` : text}
        >
          {sourceIndex + 1}
        </button>
      )}
    </span>
  )
}

const markdownComponents = {
  h1: ({ children, ...props }) => <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-white/90 mt-5 mb-2 first:mt-0" {...props}>{children}</h2>,
  h2: ({ children, ...props }) => <h3 className="text-sm font-semibold tracking-[-0.01em] text-white/85 mt-4 mb-1.5 first:mt-0" {...props}>{children}</h3>,
  h3: ({ children, ...props }) => <h4 className="text-[13px] font-semibold text-white/80 mt-3 mb-1 first:mt-0" {...props}>{children}</h4>,
  p: ({ children, ...props }) => <p className="text-sm leading-[1.68] tracking-[0.01em] mt-1.5 first:mt-0 text-white/78" {...props}>{children}</p>,
  ul: ({ children, ...props }) => <ul className="mt-2 mb-2 pl-5 list-disc space-y-1" {...props}>{children}</ul>,
  ol: ({ children, ...props }) => <ol className="mt-2 mb-2 pl-5 list-decimal space-y-1" {...props}>{children}</ol>,
  li: ({ children, ...props }) => <li className="text-sm leading-relaxed text-white/75" {...props}>{children}</li>,
  strong: ({ children, ...props }) => <strong className="font-semibold text-white/92" {...props}>{children}</strong>,
  em: ({ children, ...props }) => <em className="italic text-white/65" {...props}>{children}</em>,
  code: ({ children, ...props }) => <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-[12px] text-[var(--color-accent)]/80 font-normal" {...props}>{children}</code>,
  blockquote: ({ children, ...props }) => <blockquote className="border-l-2 border-white/[0.08] pl-3 my-3 text-white/55 italic text-[13px]" {...props}>{children}</blockquote>,
  hr: (props) => <hr className="my-4 border-white/[0.05]" {...props} />,
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-[#7aa2f7] hover:text-[#9fc4ff] underline underline-offset-2 decoration-white/20" {...props}>
      {children}
    </a>
  ),
}

export default function LegalMarkdown({ text = '', sourceRefs = [], onSelectRef, className = '' }) {
  const normalized = normalizeBrackets(text)

  // Override p/li to re-split on CITE_MARKER so citations stay inline.
  function inlineTextChildren(children) {
    if (typeof children !== 'string') return children
    const parts = children.split(CITE_MARKER)
    if (parts.length < 2) return children
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <CitationReference key={i} text={part} sourceRefs={sourceRefs} onSelectRef={onSelectRef} />
      }
      part = part.replace(/^\s*[.•·]+\s*$/gm, '').replace(/\n{3,}/g, '\n\n')
      return part || null
    })
  }

  const inlineComponents = {
    ...markdownComponents,
    p: ({ children, ...props }) => (
      <p className="text-sm leading-[1.68] tracking-[0.01em] mt-1.5 first:mt-0 text-white/78" {...props}>
        {inlineTextChildren(children)}
      </p>
    ),
    li: ({ children, ...props }) => (
      <li className="text-sm leading-relaxed text-white/75" {...props}>
        {inlineTextChildren(children)}
      </li>
    ),
  }

  return (
    <div className={`legal-answer ${className}`}>
      <Markdown remarkPlugins={[remarkGfm]} components={inlineComponents}>
        {normalized}
      </Markdown>
    </div>
  )
}
