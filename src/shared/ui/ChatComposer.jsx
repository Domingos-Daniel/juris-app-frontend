import { Mic, Paperclip, SendHorizontal, X } from 'lucide-react'
import { classNames } from '../utils/format'
import { VoiceVisualizer } from './VoiceVisualizer'
import { useEffect, useRef } from 'react'

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  loading,
  voiceState,
  onVoiceToggle,
  onOpenPdfPicker,
  activeDocument,
  pendingAttachment,
  onClearActiveDocument,
  onClearPendingAttachment,
  voiceAnalyserNode,
}) {
  const isRecording = voiceState === 'recording' || voiceState === 'listening' || voiceState === 'connecting'
  const isProcessing = voiceState === 'processing'
  const textareaRef = useRef(null)

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  useEffect(() => { autoResize() }, [value])

  return (
    <form className="mx-auto w-full max-w-3xl rounded-[var(--radius-xl)] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[var(--shadow-2)] transition-shadow focus-within:shadow-[var(--shadow-3)]" onSubmit={onSubmit}>
      {/* Active document context chip */}
      {activeDocument ? (
        <div className="flex items-center gap-2 border-b border-[color:var(--stroke)] px-4 py-2.5 sm:px-5">
          <Paperclip size={13} className="shrink-0 text-[color:var(--accent)]" />
          <span className="min-w-0 flex-1 truncate text-xs text-[color:var(--ink-soft)]">
            <span className="font-medium text-[color:var(--ink)]">Contexto:</span> {activeDocument.filename}
          </span>
          <button type="button" onClick={onClearActiveDocument} className="shrink-0 rounded-full p-0.5 text-[color:var(--ink-soft)] transition-colors hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--ink)]">
            <X size={13} />
          </button>
        </div>
      ) : null}

      {/* Pending attachment chip */}
      {pendingAttachment ? (
        <div className="flex items-center gap-2 border-b border-dashed border-[color:var(--stroke)] px-4 py-2.5 sm:px-5">
          <Paperclip size={13} className="shrink-0 text-[color:var(--gold)]" />
          <span className="min-w-0 flex-1 truncate text-xs text-[color:var(--ink-soft)]">
            <span className="font-medium text-[color:var(--ink)]">Anexo:</span> {pendingAttachment.name}
          </span>
          <button type="button" onClick={onClearPendingAttachment} className="shrink-0 rounded-full p-0.5 text-[color:var(--ink-soft)] transition-colors hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--ink)]">
            <X size={13} />
          </button>
        </div>
      ) : null}

      {/* Input row */}
      <div className="flex items-end gap-1 px-3 py-3 sm:gap-2 sm:px-5 sm:py-3">
        <button
          type="button"
          onClick={onOpenPdfPicker}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] text-[color:var(--ink-soft)] transition-all hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--accent)] active:scale-95 sm:h-9 sm:w-9"
          aria-label="Anexar PDF"
        >
          <Paperclip size={17} />
        </button>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={1}
            placeholder="Escreva a sua pergunta jurídica..."
            className="w-full resize-none bg-transparent px-3 py-2.5 text-[16px] leading-relaxed text-[color:var(--ink)] outline-none placeholder:text-[color:var(--ink-soft)]/50 sm:px-4 sm:py-2 sm:text-sm"
            style={{ maxHeight: '160px', overflowY: 'auto' }}
            onInput={autoResize}
          />
        </div>

        <button
          type="button"
          onClick={onVoiceToggle}
          className={classNames(
            'grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] transition-all active:scale-95 sm:h-9 sm:w-9',
            isRecording
              ? 'bg-rose-500 text-white pulse-glow'
              : 'text-[color:var(--ink-soft)] hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--gold)]',
          )}
          aria-label={isRecording ? 'Parar gravacao' : 'Iniciar gravacao de voz'}
        >
          <Mic size={17} />
        </button>

        <button
          type="submit"
          disabled={loading || value.trim().length < 5}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[color:var(--accent)] text-white transition-all hover:bg-[color:var(--accent-hover)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none sm:h-9 sm:w-9"
          aria-label="Enviar pergunta"
        >
          <SendHorizontal size={17} />
        </button>
      </div>

      <VoiceVisualizer isActive={isRecording} analyserNode={voiceAnalyserNode?.current} />
    </form>
  )
}
