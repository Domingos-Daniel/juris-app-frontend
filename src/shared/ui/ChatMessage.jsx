import { BookOpenCheck, ChevronDown, ExternalLink, Gavel, Scale, User } from 'lucide-react'
import { useState } from 'react'
import { cleanAnswerBody } from '../utils/markdown'
import { ClarifyingQuestions } from './ClarifyingQuestions'
import LegalMarkdown from './LegalMarkdown'

function CitationCard({ item, index, verification }) {
  const verificationText = verification?.status === 'confirmed' || verification?.status === 'confirmed_in_text'
    ? 'confirmado'
    : verification?.status
      ? 'pendente'
      : item.confirmed
        ? 'confirmado'
        : 'prudencial'

  return (
    <article className="group rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-white/90">
            {item.article ? `Art. ${item.article}` : 'Base normativa'}
          </p>
          <p className="mt-0.5 text-[12px] leading-5 text-white/50">
            {item.diploma}
            {item.page ? <span className="ml-1 tabular-nums">· pág. {item.page}</span> : ''}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/40">
          {verificationText}
        </span>
      </div>
      {item.excerpt ? (
        <p className="mt-2.5 border-t border-white/[0.05] pt-2.5 text-[12px] leading-[1.6] tracking-[0.01em] text-white/55 font-light">
          {item.excerpt}
        </p>
      ) : null}
      {item.deep_link ? (
        <a
          href={item.deep_link}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] transition-colors hover:opacity-80"
        >
          Ver excerto <ExternalLink size={10} />
        </a>
      ) : null}
    </article>
  )
}

export function ChatMessage({ role, content, meta, sourceRefs = [], answerMode = null, clarifyingQuestions = [], legalBasis = [], verifiedArticles = [], classification = null, validationIssues = [], confidence = null, onSelectRef, onClarifyingSelect }) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [legalBasisOpen, setLegalBasisOpen] = useState(false)
  const isUser = role === 'user'
  const displayText = isUser ? content : cleanAnswerBody(content)
  const isClarifying = answerMode === 'clarifying'
  const isRefused = answerMode === 'refused'
  const clarifyingLead = displayText || 'Para garantir rigor juridico, preciso de um pouco mais de contexto sobre o seu caso.'
  const hasLegalBasis = legalBasis.length > 0
  const hasSources = sourceRefs.length > 0

  return (
    <article className={`fade-rise flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${
        isUser
          ? 'bg-[color:var(--chat-user)] text-[color:var(--ink)]'
          : 'bg-[color:var(--color-accent)] text-white'
      }`}>
        {isUser ? <User size={13} strokeWidth={2.5} /> : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
          </svg>
        )}
      </div>

      <div className={`min-w-0 max-w-[88%] sm:max-w-[78%] ${
        isUser
          ? 'rounded-2xl rounded-br-md bg-[color:var(--chat-user)] px-4 py-3'
          : 'rounded-2xl rounded-bl-md bg-[color:var(--chat-assistant)] border border-[color:var(--stroke)] px-5 py-4'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{content}</p>
        ) : isClarifying ? (
          <div className="space-y-3">
            <p className="text-[13px] font-medium text-amber-200/95">{clarifyingLead}</p>
            {clarifyingQuestions.length > 0 ? (
              <ClarifyingQuestions questions={clarifyingQuestions} onSelect={onClarifyingSelect} />
            ) : null}
            <p className="text-[11px] text-white/35">Se preferir, responda a uma das sugestoes abaixo e eu continuo a analise no mesmo fio da conversa.</p>
          </div>
        ) : isRefused ? (
          <p className="text-[13px] leading-relaxed text-rose-200/80">
            O corpus jurídico actual não contém informação suficiente para responder a esta questão com bases legais verificadas.
            Recomendamos consultar um profissional ou reformular a pergunta com mais contexto.
          </p>
        ) : (
          <>
            {displayText ? (
              <LegalMarkdown text={displayText} sourceRefs={sourceRefs} onSelectRef={onSelectRef} />
            ) : null}

            {hasLegalBasis ? (
              <section className="mt-4 border-t border-white/[0.06] pt-3">
                <button
                  type="button"
                  onClick={() => setLegalBasisOpen(!legalBasisOpen)}
                  className="flex w-full items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35 transition-colors hover:text-white/55"
                >
                  <span className="flex items-center gap-1.5">
                    <Scale size={11} />
                    Fundamentos legais ({legalBasis.length})
                  </span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${legalBasisOpen ? 'rotate-180' : ''}`} />
                </button>
                {legalBasisOpen ? (
                  <div className="mt-2.5 space-y-1.5">
                    {legalBasis.slice(0, 4).map((item, index) => {
                      const verification = verifiedArticles.find(
                        (candidate) => String(candidate.article || '').replace('.', '') === String(item.article || '').replace('.', ''),
                      )
                      return <CitationCard key={`${item.diploma}-${item.article}-${index}`} item={item} index={index} verification={verification} />
                    })}
                  </div>
                ) : null}
              </section>
            ) : null}

            {hasSources ? (
              <div className="mt-3 border-t border-white/[0.06] pt-3">
                <button
                  type="button"
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="flex w-full items-center justify-between gap-2 text-[11px] font-medium tracking-[0.06em] text-white/35 transition-colors hover:text-white/55"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpenCheck size={12} />
                    {sourceRefs.length} fonte{sourceRefs.length > 1 ? 's' : ''} consultada{sourceRefs.length > 1 ? 's' : ''}
                  </span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${sourcesOpen ? 'rotate-180' : ''}`} />
                </button>

                {sourcesOpen ? (
                  <ul className="mt-2 space-y-0.5">
                    {sourceRefs.map((source, i) => {
                      const isJuris = source.source_kind === 'jurisprudence'
                      return (
                      <li key={`${source.source}-${source.page}-${i}`}>
                        <button
                          type="button"
                          onClick={() => onSelectRef?.(source)}
                          className="w-full rounded-lg px-2.5 py-1.5 text-left text-[12px] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white/75"
                        >
                          <span className="font-medium">{source.article_number ? `Art. ${source.article_number}` : source.title?.slice(0, 50)}</span>
                          <span className="ml-1.5 text-white/25 tabular-nums">· pag. {source.page || 'N/D'}</span>
                          {isJuris ? <span className="ml-1.5 inline-flex items-center gap-0.5 text-[color:var(--gold)]"><Gavel size={10} /> Jurisprudencia</span> : null}
                        </button>
                      </li>
                      )
                    })}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </article>
  )
}
