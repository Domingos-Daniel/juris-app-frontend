import { useCallback, useEffect, useMemo, useState } from 'react'
import { MOTORS, STORAGE_KEYS } from '../constants/app'
import { fetchChats, fetchDocuments, deleteChat, deleteAllChats } from '../services/apiClient'

function uuid() {
  try { return crypto.randomUUID() } catch {}
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const defaultState = {
  motor: 'motorD',
  activeSection: 'chat',
  conversations: [],
  documents: [],
  activeConversationId: null,
  isDraftConversation: false,
  draftActiveDocumentId: null,
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.appState)
    if (!raw) {
      return defaultState
    }
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

function trimConversation(conv) {
  if (!conv.messages || conv.messages.length <= 20) return conv
  return { ...conv, messages: conv.messages.slice(-20) }
}

function aggressiveTrim(conv) {
  const msgs = (conv.messages || []).slice(-10).map((m) => ({
    ...m,
    content: m.content.length > 500 ? m.content.slice(0, 500) + '...' : m.content,
  }))
  return { ...conv, messages: msgs }
}

function mapChatFromApi(chat) {
  return {
    id: chat.id,
    title: chat.title,
    createdAt: chat.created_at,
    updatedAt: chat.updated_at,
    activeDocumentId: chat.active_document_id || null,
    messages: (chat.messages || []).map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.created_at,
      sources: message.sources || [],
      provider_used: message.provider_used || null,
      answer_mode: message.answer_mode || null,
      confidence: message.confidence || null,
      validation_issues: message.validation_issues || [],
      clarifying_questions: message.clarifying_questions || [],
      legal_basis: message.legal_basis || [],
      verified_articles: message.verified_articles || [],
      classification: message.classification || null,
    })),
  }
}

function mapDocumentFromApi(item) {
  return {
    id: item.id,
    filename: item.filename,
    display_name: item.display_name,
    storage_path: item.storage_path,
    mime_type: item.mime_type,
    size_bytes: item.size_bytes,
    status: item.status,
    created_at: item.created_at,
    page_count: item.page_count,
    chunks_created: item.chunks_created,
    extraction_mode: item.extraction_mode,
    quality_status: item.quality_status,
    summary: item.summary,
    preview_text: item.preview_text,
    category: item.category,
    usage_count: item.usage_count,
    last_used_at: item.last_used_at,
  }
}

export function useAppState(token) {
  const [state, setState] = useState(readState)

  const persistWith = (updater) => {
    setState((current) => {
      const next = updater(current)
      try {
        const trimmed = { ...next, conversations: next.conversations.map(trimConversation) }
        localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(trimmed))
      } catch {
        try {
          const aggressive = { ...next, conversations: next.conversations.map(aggressiveTrim) }
          localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(aggressive))
        } catch {
          // storage full — keep state in memory only, UI stays functional
        }
      }
      return next
    })
  }

  const hydrateFromServer = useCallback(async () => {
    if (!token) {
      return
    }
    const [chatPayload, documentPayload] = await Promise.all([fetchChats(token), fetchDocuments(token)])
    setState((current) => {
      const next = {
        ...current,
        conversations: (chatPayload.items || []).map(mapChatFromApi),
        documents: (documentPayload.items || []).map(mapDocumentFromApi),
      }
      try {
        const trimmed = { ...next, conversations: next.conversations.map(trimConversation) }
        localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(trimmed))
      } catch {
        try {
          const aggressive = { ...next, conversations: next.conversations.map(aggressiveTrim) }
          localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(aggressive))
        } catch {
          // storage full — keep state in memory
        }
      }
      return next
    })
  }, [token])

  useEffect(() => {
    const id = window.setTimeout(() => {
      hydrateFromServer().catch(() => {
        // keep current UI state if backend sync fails
      })
    }, 0)
    return () => window.clearTimeout(id)
  }, [hydrateFromServer])

  const setMotor = (motor) => persistWith((current) => ({ ...current, motor }))
  const setActiveSection = (activeSection) => persistWith((current) => ({ ...current, activeSection }))

  const startNewConversation = () => {
    persistWith((current) => ({
      ...current,
      activeSection: 'chat',
      activeConversationId: null,
      isDraftConversation: true,
      draftActiveDocumentId: null,
    }))
  }

  const appendMessagePair = ({ chat_id, question, answer, sources, provider_used, createdAt, active_document_id, answer_mode, confidence, validation_issues, clarifying_questions, legal_basis, verified_articles, classification }) => {
    persistWith((current) => {
      const active =
        current.conversations.find((item) => item.id === current.activeConversationId) || {
          id: null,
          title: 'Nova Consulta',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activeDocumentId: current.draftActiveDocumentId || null,
          messages: [],
        }

      const now = new Date().toISOString()
      const userMessage = {
        id: uuid(),
        role: 'user',
        content: question,
        createdAt,
      }
      const assistantMessage = {
        id: uuid(),
        role: 'assistant',
        content: answer,
        createdAt,
        sources: sources || [],
        provider_used,
        answer_mode: answer_mode || null,
        confidence: confidence || null,
        validation_issues: validation_issues || [],
        clarifying_questions: clarifying_questions || [],
        legal_basis: legal_basis || [],
        verified_articles: verified_articles || [],
        classification: classification || null,
      }

      const nextConversation = {
        ...active,
        id: chat_id || active.id,
        title: active.messages.length ? active.title : question,
        updatedAt: now,
        activeDocumentId: active_document_id || active.activeDocumentId || null,
        messages: [...active.messages, userMessage, assistantMessage],
      }

      const remaining = current.conversations.filter((item) => item.id !== nextConversation.id)
      const conversations = [nextConversation, ...remaining]

      return {
        ...current,
        activeSection: 'chat',
        activeConversationId: nextConversation.id,
        isDraftConversation: false,
        draftActiveDocumentId: null,
        conversations,
      }
    })
  }

  const selectConversation = (conversationId) =>
    persistWith((current) => ({ ...current, activeConversationId: conversationId, activeSection: 'chat', isDraftConversation: false }))

  const deleteConversation = (conversationId) => {
    // Remove from state first (optimistic)
    const conversations = state.conversations.filter((conversation) => conversation.id !== conversationId)
    const activeConversationId =
      state.activeConversationId === conversationId ? (conversations[0]?.id ?? null) : state.activeConversationId

    persistWith((current) => ({
      ...current,
      activeSection: 'chat',
      activeConversationId,
      isDraftConversation: false,
      draftActiveDocumentId: null,
      conversations,
    }))

    // Delete from backend (fire-and-forget)
    if (conversationId && token) {
      deleteChat(conversationId, token).catch(() => {})
    }
  }

  const deleteAllConversations = async () => {
    if (token) {
      try { await deleteAllChats(token) } catch {}
    }
    persistWith((current) => ({
      ...current,
      activeSection: 'chat',
      activeConversationId: null,
      isDraftConversation: false,
      draftActiveDocumentId: null,
      conversations: [],
    }))
  }

  const renameConversation = (conversationId, title) => {
    const normalized = (title || '').trim()
    if (!normalized) {
      return
    }

    const conversations = state.conversations.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            title: normalized,
            updatedAt: new Date().toISOString(),
          }
        : conversation,
    )

    persistWith((current) => ({ ...current, conversations }))
  }

  const setConversationActiveDocument = (conversationId, documentId) => {
    if (!conversationId) {
      persistWith((current) => ({ ...current, draftActiveDocumentId: documentId || null, isDraftConversation: true, activeSection: 'chat' }))
      return
    }
    persistWith((current) => {
      const conversations = current.conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, activeDocumentId: documentId || null } : conversation,
      )
      return { ...current, conversations }
    })
  }

  const addUploadedDocument = (document) => {
    const mapped = mapDocumentFromApi(document)
    persistWith((current) => {
      const documents = [mapped, ...current.documents.filter((item) => item.id !== mapped.id)]
      return { ...current, documents }
    })
    return mapped
  }

  const removeDocument = (documentId) => {
    persistWith((current) => ({
      ...current,
      documents: current.documents.filter((item) => item.id !== documentId),
      conversations: current.conversations.map((conversation) =>
        conversation.activeDocumentId === documentId ? { ...conversation, activeDocumentId: null } : conversation,
      ),
      draftActiveDocumentId: current.draftActiveDocumentId === documentId ? null : current.draftActiveDocumentId,
    }))
  }

  const selectedConversation = useMemo(() => {
    if (state.isDraftConversation) {
      return {
        id: null,
        title: 'Nova Consulta',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activeDocumentId: state.draftActiveDocumentId || null,
        messages: [],
      }
    }

    return state.conversations.find((item) => item.id === state.activeConversationId) || state.conversations[0] || null
  }, [state.conversations, state.activeConversationId, state.isDraftConversation, state.draftActiveDocumentId])

  const sidebarConversations = useMemo(
    () =>
      state.conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        updatedAt: conv.updatedAt,
        preview:
          conv.messages
            .slice()
            .reverse()
            .find((message) => message.role === 'assistant')?.content || '',
      })),
    [state.conversations],
  )

  const selectedMotor = MOTORS.find((motor) => motor.id === state.motor) || MOTORS[0]

  return {
    state,
    selectedConversation,
    sidebarConversations,
    selectedMotor,
    setMotor,
    setActiveSection,
    appendMessagePair,
    selectConversation,
    deleteConversation,
    deleteAllConversations,
    startNewConversation,
    renameConversation,
    setConversationActiveDocument,
    addUploadedDocument,
    removeDocument,
    hydrateFromServer,
  }
}
