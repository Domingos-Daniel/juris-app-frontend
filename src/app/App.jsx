import { useEffect, useRef, useState } from 'react'
import { fetchHealth } from '../shared/services/apiClient'
import { useAppState } from '../shared/hooks/useAppState'
import { useTheme } from '../shared/hooks/useTheme'
import { useAuth } from '../shared/hooks/useAuth'
import { AppShell } from './AppShell'
import { Landmark, Eye, EyeOff, CheckCircle } from 'lucide-react'

function Toast({ visible, message }) {
  if (!visible || !message) return null
  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-800 shadow-[var(--shadow-3)] dark:border-green-800 dark:bg-green-950 dark:text-green-200">
        <CheckCircle size={18} />
        {message}
      </div>
    </div>
  )
}

function LoginScreen({ onLogin, loading, theme }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Admin123@')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await onLogin(username, password)
    } catch (err) {
      setError(err.message || 'Falha ao autenticar')
    }
  }

  return (
    <div data-theme={theme} className="flex min-h-[100dvh] items-center justify-center bg-[color:var(--bg)] px-4 text-[color:var(--ink)]">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--accent)] text-white shadow-[var(--shadow-2)]">
            <Landmark size={24} />
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-semibold text-[color:var(--ink)]">jURIS-APP</h1>
          <p className="mt-1.5 text-sm text-[color:var(--ink-soft)]">Assistente Juridico Angolano</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[var(--radius-xl)] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 shadow-[var(--shadow-3)] sm:p-8">
          <h2 className="text-lg font-semibold text-[color:var(--ink)]">Entrar na plataforma</h2>
          <p className="mt-1 text-sm text-[color:var(--ink-soft)]">Insira as suas credenciais para aceder ao sistema.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--ink)]">Utilizador</label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[color:var(--stroke)] bg-[color:var(--panel-muted)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-glow)]"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--ink)]">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[color:var(--stroke)] bg-[color:var(--panel-muted)] px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-glow)]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--ink-soft)] transition-colors hover:text-[color:var(--ink)]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-[var(--radius-md)] border border-red-200 bg-[color:var(--danger-soft)] px-3.5 py-2.5 text-sm text-red-600 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-[var(--radius-md)] bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-xs)] transition-all hover:bg-[color:var(--accent-hover)] hover:shadow-[var(--shadow-1)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[color:var(--ink-soft)]">
          Este sistema oferece apoio informativo e não substitui aconselhamento jurídico profissional.
        </p>
      </div>
    </div>
  )
}

export function App() {
  const { theme, toggleTheme } = useTheme()
  const { token, user, loading: authLoading, isAuthenticated, login, logout } = useAuth()
  const {
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
  } = useAppState(token)
  const [healthOk, setHealthOk] = useState(false)
  const [toast, setToast] = useState(null)
  const prevAuthRef = useRef(false)

  useEffect(() => {
    let mounted = true
    fetchHealth()
      .then((payload) => {
        if (mounted) setHealthOk(payload.status === 'ok')
      })
      .catch(() => {
        if (mounted) setHealthOk(false)
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (isAuthenticated && !prevAuthRef.current && user) {
      setToast({ message: `Bem-vindo, ${user.name}` })
      startNewConversation()
    }
    prevAuthRef.current = isAuthenticated
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  const handleLogin = async (username, password) => {
    try {
      return await login(username, password)
    } catch (err) {
      throw err
    }
  }

  if (authLoading) {
    return (
      <div data-theme={theme} className="flex min-h-[100dvh] items-center justify-center bg-[color:var(--bg)] text-[color:var(--ink-soft)]">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 rounded-full border-2 border-[color:var(--accent)] border-t-transparent animate-spin" />
          <span className="text-sm">A carregar sessão...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toast visible={!!toast?.message} message={toast?.message} />
        <LoginScreen onLogin={handleLogin} loading={authLoading} theme={theme} />
      </>
    )
  }

  return (
    <>
      <Toast visible={!!toast?.message} message={toast?.message} />
      <AppShell
        healthOk={healthOk}
        theme={theme}
        onToggleTheme={toggleTheme}
        state={state}
        selectedConversation={selectedConversation}
        sidebarConversations={sidebarConversations}
        selectedMotor={selectedMotor}
        setMotor={setMotor}
        setActiveSection={setActiveSection}
        appendMessagePair={appendMessagePair}
        selectConversation={selectConversation}
        deleteConversation={deleteConversation}
        deleteAllConversations={deleteAllConversations}
        startNewConversation={startNewConversation}
        renameConversation={renameConversation}
        setConversationActiveDocument={setConversationActiveDocument}
        addUploadedDocument={addUploadedDocument}
        removeDocument={removeDocument}
        authToken={token}
        currentUser={user}
        onLogout={logout}
        onHydrateFromServer={hydrateFromServer}
      />
    </>
  )
}
