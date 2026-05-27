export const STORAGE_KEYS = {
  theme: 'tribunal:theme',
  appState: 'tribunal:app-state',
  auth: 'tribunal:auth',
}

export const NAV_ITEMS = [
  { id: 'chat', label: 'Nova Consulta' },
  { id: 'documents', label: 'Meus Documentos' },
  { id: 'library', label: 'Biblioteca Juridica' },
  { id: 'settings', label: 'Definicoes' },
]

export const MOTORS = [
  { id: 'motorD', label: 'DeepSeek', provider: 'deepseek' },
]

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || '').trim() ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://127.0.0.1:8000')
