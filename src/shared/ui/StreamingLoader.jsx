import { Search, ShieldCheck, PenLine } from 'lucide-react'

const PHASES = [
  { key: 'classifying', label: 'A classificar o ramo juridico', Icon: Search },
  { key: 'retrieving', label: 'A pesquisar legislacao', Icon: ShieldCheck },
  { key: 'composing', label: 'A redigir resposta', Icon: PenLine },
]

function cleanStreamText(text) {
  if (!text) return ''
  return text
    .replace(/\{\s*"rich_content"\s*:\s*"/g, '')
    .replace(/\{\s*"answer"\s*:\s*"/g, '')
    .replace(/\{\s*"token"\s*:\s*"/g, '')
    .replace(/\{\s*"sources?"\s*:\s*/g, '')
    .replace(/\{\s*"confidence"\s*:\s*/g, '')
    .replace(/\{\s*"legal_basis"\s*:\s*/g, '')
    .replace(/\{\s*"answer_mode"\s*:\s*/g, '')
    .replace(/^\s*[\{\[]\s*/, '')
    .replace(/\s*["\}\]]\s*$/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .trim()
}

export function StreamingLoader({ content = '', phase = 'idle' }) {
  const cleanContent = cleanStreamText(content)
  const hasContent = cleanContent.length > 0
  const activePhaseIndex = phase === 'idle' ? 0 : PHASES.findIndex((p) => p.key === phase)

  return (
    <div className="fade-rise w-full rounded-2xl rounded-bl-md border border-[color:var(--stroke)] bg-[color:var(--chat-assistant)] p-5">
      {hasContent ? (
        <div className="space-y-3">
          <div className="text-sm leading-[1.72] tracking-[0.01em] text-white/78 whitespace-pre-wrap">
            {cleanContent}
            <span className="inline-block w-1.5 h-[14px] ml-0.5 bg-[[var(--color-accent)]] animate-pulse rounded-sm align-middle" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/25">
            <span className="h-1.5 w-1.5 rounded-full bg-[[var(--color-accent)]] animate-pulse" />
            A redigir...
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[[var(--color-accent)]] opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[[var(--color-accent)]]" />
            </span>
            <p className="text-[13px] font-medium text-white/60">A processar a sua questao juridica</p>
          </div>
          <div className="space-y-2">
            {PHASES.map(({ key, label, Icon }, index) => {
              const isPast = activePhaseIndex >= 0 && index < activePhaseIndex
              const isCurrent = index === activePhaseIndex
              return (
                <div key={key} className="flex items-center gap-3 text-[12px]">
                  <span className={`grid h-5 w-5 place-items-center rounded-full transition-colors duration-300 ${
                    isPast ? 'bg-emerald-500/15 text-emerald-400' : isCurrent ? 'bg-[[var(--color-accent)]]/15 text-[[var(--color-accent)]]' : 'bg-white/[0.03] text-white/15'
                  }`}>
                    <Icon size={11} />
                  </span>
                  <span className={isPast ? 'text-emerald-300/70' : isCurrent ? 'text-white/70' : 'text-white/20'}>
                    {label}{isPast ? ' OK' : isCurrent ? '...' : ''}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full bg-[[var(--color-accent)]]/50 transition-[width] duration-700 ease-out"
              style={{ width: `${Math.max(3, Math.min(100, (activePhaseIndex < 0 ? 0 : activePhaseIndex + 1) * 33))}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}
