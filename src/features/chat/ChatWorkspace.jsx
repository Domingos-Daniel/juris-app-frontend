import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { ArrowDown } from 'lucide-react'
import { ErrorBanner } from '../../shared/ui/ErrorBanner'
import { StreamingLoader } from '../../shared/ui/StreamingLoader'
import { EmptyState } from '../../shared/ui/EmptyState'
import { ChatMessage } from '../../shared/ui/ChatMessage'
import { ChatComposer } from '../../shared/ui/ChatComposer'
import { InfoTooltip } from '../../shared/ui/InfoTooltip'
import { formatNow } from '../../shared/utils/format'
import { sendChatQuestionStream, uploadPdfDocument, preflightChatQuestion } from '../../shared/services/apiClient'

const MAX_PDF_BYTES = 1024 * 1024

export function ChatWorkspace({
  selectedConversation,
  draftActiveDocumentId,
  documents,
  provider,
  onAppendMessagePair,
  onSelectSourceRef,
  onSetConversationActiveDocument,
  onAddUploadedDocument,
  authToken,
  onRefreshAppState,
}) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [voiceState, setVoiceState] = useState('idle')
  const [pendingUserQuestion, setPendingUserQuestion] = useState('')
  const [loadingElapsedMs, setLoadingElapsedMs] = useState(0)
  const [showBackToBottom, setShowBackToBottom] = useState(false)
  const [pendingAttachment, setPendingAttachment] = useState(null)
  const [clarifyingChosen, setClarifyingChosen] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingPhase, setStreamingPhase] = useState('idle')
  const [conversationLoading, setConversationLoading] = useState(false)
  const prevConversationIdRef = useRef(null)
  const loadingStartedAtRef = useRef(0)
  const scrollContainerRef = useRef(null)
  const shouldAutoScrollRef = useRef(true)
  const fileInputRef = useRef(null)
  const activeStreamRef = useRef(null)

  const activeDocumentIdForDisplay = selectedConversation?.activeDocumentId || draftActiveDocumentId || null
  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeDocumentIdForDisplay) || null,
    [documents, activeDocumentIdForDisplay],
  )

  const scrollToBottom = (smooth = true) => {
    const element = scrollContainerRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }

  const handleMessagesScroll = () => {
    const element = scrollContainerRef.current
    if (!element) return
    const thresholdPx = 72
    const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight
    const hasScrollableContent = element.scrollHeight > element.clientHeight + 24
    const isNearBottom = distanceToBottom <= thresholdPx
    setShowBackToBottom(hasScrollableContent && !isNearBottom)
    shouldAutoScrollRef.current = isNearBottom
  }

  useEffect(() => {
    if (!loading) {
      loadingStartedAtRef.current = 0
      return undefined
    }
    if (!loadingStartedAtRef.current) loadingStartedAtRef.current = Date.now()
    const tick = () => setLoadingElapsedMs(Math.max(0, Date.now() - loadingStartedAtRef.current))
    tick()
    const id = window.setInterval(tick, 300)
    return () => window.clearInterval(id)
  }, [loading])

  const messages = useMemo(() => {
    if (!selectedConversation) return []
    const persisted = selectedConversation.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      meta: message.role === 'assistant' ? `${message.provider_used || provider} · ${message.createdAt}` : '',
      sources: message.sources || [],
      answer_mode: message.answer_mode || null,
      confidence: message.confidence || null,
      validation_issues: message.validation_issues || [],
      clarifying_questions: message.clarifying_questions || [],
      legal_basis: message.legal_basis || [],
      verified_articles: message.verified_articles || [],
      classification: message.classification || null,
    }))
    if (loading && pendingUserQuestion) {
      return [...persisted, { id: 'pending-user', role: 'user', content: pendingUserQuestion, meta: '', sources: [] }]
    }
    return persisted
  }, [selectedConversation, provider, loading, pendingUserQuestion])

  useEffect(() => {
    if (shouldAutoScrollRef.current) scrollToBottom(loading ? false : true)
  }, [loading, messages.length, streamingContent])

  useEffect(() => {
    const id = window.setTimeout(() => handleMessagesScroll(), 0)
    return () => window.clearTimeout(id)
  }, [messages.length, loading, streamingContent])

  useEffect(() => {
    const element = scrollContainerRef.current
    if (!element) return undefined
    const onResize = () => handleMessagesScroll()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const currentId = selectedConversation?.id || null
    if (prevConversationIdRef.current !== null && currentId !== prevConversationIdRef.current) {
      const hasMessages = selectedConversation?.messages?.length > 0
      if (hasMessages) {
        setConversationLoading(true)
        const timer = window.setTimeout(() => setConversationLoading(false), 300)
        prevConversationIdRef.current = currentId
        return () => window.clearTimeout(timer)
      }
    }
    prevConversationIdRef.current = currentId
    shouldAutoScrollRef.current = true
    scrollToBottom(false)
  }, [selectedConversation?.id])

  const conversationHistory = useMemo(() => {
    if (!selectedConversation?.messages?.length) return []
    return selectedConversation.messages.slice(-10).map((message) => {
      const prefix = message.role === 'assistant' ? 'Assistente' : 'Utilizador'
      const compact = String(message.content || '')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
      const snippet = compact.length > 380 ? `${compact.slice(0, 380)}...` : compact
      return `${prefix}: ${snippet}`
    })
  }, [selectedConversation])

  const cancelStream = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.cancelled = true
    }
  }, [])

  const handleClarifyingSelect = (text) => {
    setQuestion(text)
    setClarifyingChosen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const normalized = question.trim()
    if ((normalized.length < 5 && !pendingAttachment) || loading) return

    setQuestion('')  // Clear immediately for UX

    let uploadedDocument = null
    setLoading(true)
    loadingStartedAtRef.current = Date.now()
    shouldAutoScrollRef.current = true
    setError('')
    setPendingUserQuestion(normalized || 'Processar PDF anexado')
    setClarifyingChosen(false)
    setStreamingContent('')
    setStreamingPhase('classifying')

    let accumulated = ''
    const ctx = { cancelled: false }
    activeStreamRef.current = ctx

    try {
      if (pendingAttachment) {
        uploadedDocument = await uploadPdfDocument(pendingAttachment, authToken)
        const mapped = onAddUploadedDocument?.(uploadedDocument) || uploadedDocument
        try { await onRefreshAppState?.() } catch { /* keep optimistic */ }
        if (selectedConversation?.id) {
          onSetConversationActiveDocument?.(selectedConversation.id, mapped.id)
        } else {
          onSetConversationActiveDocument?.(null, mapped.id)
        }
        setPendingAttachment(null)
      }

      const activeDocumentId = uploadedDocument?.id || selectedConversation?.activeDocumentId || draftActiveDocumentId || null

      // Preflight: detect vague queries before committing to expensive RAG pipeline
      setStreamingPhase('classifying')
      let preflight = null
      try {
        preflight = await preflightChatQuestion(
          normalized || 'Analise o PDF anexado e aguarde instrucoes posteriores.',
          provider,
          conversationHistory,
          selectedConversation?.id || null,
          authToken,
        )
      } catch {
        // preflight failed — fall through to full stream
      }

      if (!ctx.cancelled && preflight?.needs_clarification) {
        onAppendMessagePair({
          chat_id: selectedConversation?.id || '',
          question: normalized,
          answer: preflight.clarifying_message || preflight.answer || '',
          sources: [],
          provider_used: provider || 'deepseek',
          createdAt: formatNow(),
          active_document_id: activeDocumentId,
          answer_mode: 'clarifying',
          confidence: null,
          validation_issues: [],
          clarifying_questions: preflight.clarifying_questions || [],
          legal_basis: [],
          verified_articles: [],
          classification: null,
        })
        setStreamingContent('')
        setStreamingPhase('idle')
        return
      }

      const stream = await sendChatQuestionStream(
        normalized || 'Analise o PDF anexado e aguarde instrucoes posteriores.',
        provider,
        conversationHistory,
        selectedConversation?.id || null,
        activeDocumentId,
        authToken,
      )

      setStreamingPhase('composing')
      let finalMeta = null

      for await (const chunk of stream) {
        if (ctx.cancelled) break
        if (chunk.token) {
          accumulated += chunk.token
          setStreamingContent(accumulated)
        }
        if (chunk.done) {
          finalMeta = chunk
        }
      }

      if (!ctx.cancelled && finalMeta) {
        const cleanAnswer = finalMeta.answer || accumulated || ''
        onAppendMessagePair({
          chat_id: finalMeta.chat_id,
          question: normalized || 'Analise o PDF anexado e aguarde instrucoes posteriores.',
          answer: cleanAnswer,
          sources: finalMeta.sources || [],
          provider_used: finalMeta.provider_used,
          createdAt: formatNow(),
          active_document_id: finalMeta.active_document_id,
          answer_mode: finalMeta.answer_mode || 'limited',
          confidence: finalMeta.confidence,
          validation_issues: finalMeta.validation_issues || [],
          clarifying_questions: finalMeta.clarifying_questions || [],
          legal_basis: finalMeta.legal_basis || [],
          verified_articles: finalMeta.verified_articles || [],
          classification: finalMeta.classification || null,
        })
      } else if (accumulated) {
        onAppendMessagePair({
          chat_id: selectedConversation?.id || '',
          question: normalized || 'Analise o PDF anexado e aguarde instrucoes posteriores.',
          answer: accumulated,
          sources: [],
          provider_used: provider || 'deepseek',
          createdAt: formatNow(),
          active_document_id: activeDocumentId,
          answer_mode: 'grounded',
          confidence: null,
          validation_issues: [],
          clarifying_questions: [],
          legal_basis: [],
          verified_articles: [],
          classification: null,
        })
      }
      setQuestion('')
      setVoiceState('idle')
      setPendingUserQuestion('')
      setStreamingContent('')
      setStreamingPhase('idle')
    } catch (err) {
      setError(err.message || 'Falha ao consultar o backend.')
      setPendingUserQuestion('')
      setStreamingContent('')
      setStreamingPhase('idle')
    } finally {
      setLoading(false)
      setLoadingElapsedMs(0)
      activeStreamRef.current = null
    }
  }

  const handleVoiceToggle = () => {
    setVoiceState((prev) => (prev === 'recording' ? 'idle' : 'recording'))
  }

  const handlePdfSelection = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Apenas ficheiros PDF são suportados.')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      setError('O PDF excede 1 MB.')
      return
    }
    setError('')
    setPendingAttachment(file)
  }

  return (
    <section className="relative flex h-full min-h-0 w-full flex-col">
      {error ? <div className="mb-2"><ErrorBanner message={error} onRetry={() => setError('')} /></div> : null}

      <div
        ref={scrollContainerRef}
        onScroll={handleMessagesScroll}
        className="custom-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-4 sm:px-2"
      >
        {(!selectedConversation || (selectedConversation && selectedConversation.messages.length === 0)) && !loading ? (
          <EmptyState
            title="Pronto para nova consulta"
            description="Envie uma pergunta jurídica ou anexe um PDF para receber resposta fundamentada na legislação angolana."
            onSuggestionClick={(text) => setQuestion(text)}
          />
        ) : null}

        {conversationLoading ? (
          <div className="mx-auto max-w-3xl flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-[color:var(--ink-soft)]">
              <span className="h-5 w-5 rounded-full border-2 border-[color:var(--accent)] border-t-transparent animate-spin" />
              <span className="text-sm">A carregar conversa...</span>
            </div>
          </div>
        ) : null}

        <div className={conversationLoading ? 'hidden' : 'mx-auto max-w-3xl space-y-4'}>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              meta={message.meta}
              sourceRefs={message.role === 'assistant' ? message.sources || [] : []}
              answerMode={message.answer_mode}
              confidence={message.confidence}
              validationIssues={message.validation_issues}
              clarifyingQuestions={message.clarifying_questions}
              legalBasis={message.legal_basis}
              verifiedArticles={message.verified_articles}
              classification={message.classification}
              onSelectRef={onSelectSourceRef}
              onClarifyingSelect={handleClarifyingSelect}
            />
          ))}

          {loading ? (
            <div className="pl-10">
              <StreamingLoader
                content={streamingContent}
                phase={streamingPhase}
              />
            </div>
          ) : null}
        </div>
      </div>

      {showBackToBottom ? (
        <button
          type="button"
          onClick={() => { shouldAutoScrollRef.current = true; scrollToBottom(true); setShowBackToBottom(false) }}
          className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-1.5 text-xs font-medium text-[color:var(--ink-soft)] shadow-[var(--shadow-2)] transition-all hover:text-[color:var(--ink)]"
        >
          <ArrowDown size={13} />
          Voltar ao fim
        </button>
      ) : null}

      <div className="shrink-0 px-2 pb-2 pt-2 sm:px-2">
        <div className="mx-auto max-w-3xl">
          <ChatComposer
            value={question}
            onChange={setQuestion}
            onSubmit={handleSubmit}
            loading={loading}
            voiceState={voiceState}
            onVoiceToggle={handleVoiceToggle}
            onOpenPdfPicker={() => fileInputRef.current?.click()}
            activeDocument={activeDocument}
            pendingAttachment={pendingAttachment}
            onClearActiveDocument={() => onSetConversationActiveDocument?.(selectedConversation?.id, null)}
            onClearPendingAttachment={() => setPendingAttachment(null)}
          />
          <p className="mt-2 text-center text-[10px] leading-relaxed text-[color:var(--ink-soft)]/70">
            O jURIS-APP pode cometer erros. Não substitui aconselhamento jurídico profissional. <InfoTooltip content="Este assistente utiliza inteligencia artificial para pesquisar legislacao angolana. As respostas sao geradas com base no corpus de diplomas indexados e devem ser verificadas por um profissional." />
          </p>
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handlePdfSelection} />
        </div>
      </div>
    </section>
  )
}
