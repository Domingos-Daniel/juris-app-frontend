import { API_BASE_URL } from '../constants/app'

async function request(path, options = {}, token = '') {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const contentType = response.headers.get('content-type') || ''
  if (response.status === 204) {
    return { ok: true }
  }

  const readPayload = async () => {
    if (contentType.includes('application/json')) {
      return response.json()
    }
    const text = await response.text()
    return { raw_text: text }
  }

  if (!response.ok) {
    const payload = await readPayload().catch(() => ({}))
    const detail = payload.detail || `Erro HTTP ${response.status}`
    throw new Error(detail)
  }

  const payload = await readPayload()
  if (!contentType.includes('application/json')) {
    throw new Error(`Resposta inesperada da API em ${path}: esperado JSON e recebido ${contentType || 'conteudo sem content-type'}`)
  }
  return payload
}

export async function fetchHealth() {
  return request('/health')
}

export async function loginRequest(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function registerRequest(name, email, phone, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password }),
  })
}

export async function updateProfileRequest(token, name, email, phone) {
  return request('/auth/me', {
    method: 'PUT',
    body: JSON.stringify({ name, email, phone }),
  }, token)
}

export async function updatePreferencesRequest(token, prefs) {
  return request('/auth/me/preferences', {
    method: 'PUT',
    body: JSON.stringify(prefs),
  }, token)
}

export async function fetchPreferences(token) {
  return request('/auth/me/preferences', {}, token)
}

export async function fetchMe(token) {
  return request('/auth/me', {}, token)
}

export async function sendChatQuestion(question, provider, conversationHistory = [], chatId = null, activeDocumentId = null, token = '') {
  return request(
    '/chat',
    {
      method: 'POST',
      body: JSON.stringify({
        question,
        provider,
        conversation_history: conversationHistory,
        chat_id: chatId,
        active_document_id: activeDocumentId,
      }),
    },
    token,
  )
}

export async function preflightChatQuestion(question, provider, conversationHistory = [], chatId = null, token = '') {
  const response = await fetch(`${API_BASE_URL}/chat/preflight`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      question,
      provider,
      conversation_history: conversationHistory,
      chat_id: chatId,
    }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || `Preflight HTTP ${response.status}`)
  }

  return response.json()
}

export async function sendChatQuestionStream(question, provider, conversationHistory = [], chatId = null, activeDocumentId = null, token = '') {
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      question,
      provider,
      conversation_history: conversationHistory,
      chat_id: chatId,
      active_document_id: activeDocumentId,
    }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || `Erro HTTP ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  return {
    async *[Symbol.asyncIterator]() {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))
          yield data
        }
      }
      if (buffer.trim().startsWith('data: ')) {
        yield JSON.parse(buffer.trim().slice(6))
      }
    },
  }
}

export async function triggerIngestion(token) {
  return request('/docs/ingest', { method: 'POST' }, token)
}

export async function fetchDocuments(token) {
  return request('/docs', {}, token)
}

export async function fetchDocumentPreview(documentId, token) {
  return request(`/docs/${documentId}/preview`, {}, token)
}

export async function uploadPdfDocument(file, token) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/docs/upload', { method: 'POST', body: formData }, token)
}

export async function renameDocument(documentId, displayName, token) {
  return request(`/docs/${documentId}/rename`, {
    method: 'PATCH',
    body: JSON.stringify({ display_name: displayName }),
  }, token)
}

export async function activateDocumentInChat(documentId, chatId, token) {
  return request(`/docs/${documentId}/use`, {
    method: 'POST',
    body: JSON.stringify({ chat_id: chatId || null }),
  }, token)
}

export async function deleteChat(chatId, token) {
  return request(`/chats/${chatId}`, { method: 'DELETE' }, token)
}

export async function deleteAllChats(token) {
  return request('/chats', { method: 'DELETE' }, token)
}

export async function reprocessDocument(documentId, token) {
  return request(`/docs/${documentId}/reprocess`, { method: 'POST' }, token)
}

export async function deleteDocument(documentId, token) {
  return request(`/docs/${documentId}`, { method: 'DELETE' }, token)
}

export async function fetchChats(token) {
  return request('/chats', {}, token)
}

export async function fetchCatalog(token) {
  return request('/catalog', {}, token)
}
