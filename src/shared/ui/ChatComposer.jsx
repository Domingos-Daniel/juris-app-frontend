import { Mic, Paperclip, SendHorizontal, X } from 'lucide-react'
import { classNames } from '../utils/format'

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
}) {
  const isRecording = voiceState === 'recording'

  return (
    <form className="w-full rounded-[var(--radius-xl)] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[var(--shadow-2)]" onSubmit={onSubmit}>
      {/* Active document context chip */}
      {activeDocument ? (
        <div className="flex items-center gap-2 border-b border-[color:var(--stroke)] px-4 py-2">
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
        <div className="flex items-center gap-2 border-b border-dashed border-[color:var(--stroke)] px-4 py-2">
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
      <div className="flex items-end gap-1 px-2 py-2 sm:gap-2 sm:px-3">
        <button
          type="button"
          onClick={onOpenPdfPicker}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[color:var(--ink-soft)] transition-all hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--accent)] sm:h-9 sm:w-9"
          aria-label="Anexar PDF"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={1}
          placeholder="Faca a sua pergunta juridica..."
          className="w-full min-w-0 resize-none bg-transparent px-1 py-2 text-[16px] text-[color:var(--ink)] outline-none placeholder:text-[color:var(--ink-soft)]/60 sm:px-1 sm:py-2 sm:text-sm"
          style={{ maxHeight: '120px', overflowY: 'auto' }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
        />

        <button
          type="button"
          onClick={onVoiceToggle}
          className={classNames(
            'grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-sm)] transition-all sm:h-9 sm:w-9',
            isRecording
              ? 'bg-rose-500 text-white pulse-glow'
              : 'text-[color:var(--ink-soft)] hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--gold)]',
          )}
          aria-label={isRecording ? 'Parar gravacao' : 'Iniciar gravacao de voz'}
        >
          <Mic size={18} />
        </button>

        <button
          type="submit"
          disabled={loading || value.trim().length < 5}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[color:var(--accent)] text-white transition-all hover:bg-[color:var(--accent-hover)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none sm:h-9 sm:w-9"
          aria-label="Enviar pergunta"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </form>
  )
}
