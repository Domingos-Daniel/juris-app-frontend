import { Menu, MoonStar, SunMedium, X } from 'lucide-react'
import { PanelRightClose, PanelRightOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { StatusBadge } from '../shared/ui/StatusBadge'
import { LegalNoticeBanner, SidebarNav, ShellActionButtons, TopBar } from '../shared/ui/AppShellParts'
import { ArticleViewer } from '../shared/ui/ArticleViewer'
import { ReferenceList } from '../shared/ui/ReferenceList'
import { ChatWorkspace } from '../features/chat/ChatWorkspace'
import { DocumentsPage } from '../features/documents/DocumentsPage'
import { LibraryPage } from '../features/library/LibraryPage'
import { SettingsPage } from '../features/settings/SettingsPage'

function IconButton({ onClick, label, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--ink-soft)] transition-all hover:bg-[color:var(--panel-muted)] hover:text-[color:var(--ink)] active:scale-95 ${className}`}
      aria-label={label}
    >
      {children}
    </button>
  )
}

export function AppShell({
  healthOk,
  theme,
  onToggleTheme,
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
  authToken,
  currentUser,
  onLogout,
  onHydrateFromServer,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [rightPanelVisible, setRightPanelVisible] = useState(true)
  const [highlightArticle, setHighlightArticle] = useState(false)
  const [selectedSourceRef, setSelectedSourceRef] = useState(null)
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)

  // Sync URL → activeSection on load/back-button
  useEffect(() => {
    const path = location.pathname.replace(/^\/+/, '')
    const section = path || 'chat'
    if (state.activeSection !== section) {
      setActiveSection(section)
    }
  }, [location.pathname])

  // Route-aware section change handler
  const handleSectionChange = (section) => {
    setMobileLeftOpen(false)
    setActiveSection(section)
    const path = section === 'chat' ? '/' : `/${section}`
    if (location.pathname !== path) {
      navigate(path, { replace: true })
    }
  }

  const handleSelectSourceRef = (source) => {
    setSelectedSourceRef(source)
    setHighlightArticle(true)
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches
    if (isDesktop) {
      setRightPanelVisible(true)
    } else {
      setMobileRightOpen(true)
    }
  }

  useEffect(() => {
    if (!highlightArticle) {
      return undefined
    }
    const timer = setTimeout(() => setHighlightArticle(false), 750)
    return () => clearTimeout(timer)
  }, [highlightArticle])

  const latestAssistant =
    selectedConversation?.messages
      ?.slice()
      .reverse()
      .find((message) => message.role === 'assistant') || null
  const activeSource = selectedSourceRef || latestAssistant?.sources?.[0] || null
  const hasAnySources = Boolean(latestAssistant?.sources?.length)
  const hasSources = hasAnySources && rightPanelVisible
  const isChatSection = state.activeSection === 'chat'

  const handleSelectConversation = (id) => selectConversation(id)
  const handleNewConversation = () => {
    startNewConversation()
    handleSectionChange('chat')
  }

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[color:var(--bg)] text-[color:var(--ink)]">
      {/* Mobile overlay */}
      <button
        type="button"
        onClick={() => { setMobileLeftOpen(false); setMobileRightOpen(false) }}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 xl:hidden ${mobileLeftOpen || mobileRightOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-label="Fechar paineis"
      />

      {/* Desktop sidebar — slide animation */}
      <div className={`hidden xl:block h-full shrink-0 transition-[margin] duration-300 ease-out ${desktopSidebarOpen ? 'ml-0' : 'ml-[-280px]'}`}>
        <div className="w-[280px]">
          <SidebarNav
            activeSection={state.activeSection}
            onSectionChange={handleSectionChange}
            conversations={sidebarConversations}
            activeConversationId={selectedConversation?.id || null}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onRenameConversation={renameConversation}
            onDeleteConversation={deleteConversation}
            onDeleteAllConversations={deleteAllConversations}
            motor={state.motor}
            onMotorChange={setMotor}
            currentUser={currentUser}
            onLogout={onLogout}
            className="flex shrink-0 sticky top-0"
          />
        </div>
      </div>

      {/* Mobile sidebar */}
      <SidebarNav
        activeSection={state.activeSection}
        onSectionChange={handleSectionChange}
        conversations={sidebarConversations}
        activeConversationId={selectedConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        motor={state.motor}
        onMotorChange={setMotor}
        currentUser={currentUser}
        onLogout={onLogout}
        onClose={() => setMobileLeftOpen(false)}
        className={`fixed left-0 top-0 z-40 flex xl:hidden transition-transform duration-300 ease-out ${mobileLeftOpen ? 'translate-x-0' : '-translate-x-full'}`}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {/* Top bar */}
        <TopBar
          className="shrink-0"
          leftNode={
            <>
              <IconButton onClick={() => setDesktopSidebarOpen((prev) => !prev)} label="Alternar menu lateral" className="hidden xl:grid">
                {desktopSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
              </IconButton>
              <IconButton onClick={() => setMobileLeftOpen(true)} label="Abrir menu lateral" className="xl:hidden">
                <Menu size={16} />
              </IconButton>
            </>
          }
          centerNode={<StatusBadge healthy={healthOk} />}
          rightNode={
            <>
              <IconButton onClick={onToggleTheme} label="Alternar tema">
                {theme === 'light' ? <MoonStar size={15} /> : <SunMedium size={15} />}
              </IconButton>
              {isChatSection ? (
                <IconButton
                  onClick={() => {
                    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches
                    if (isDesktop) { setRightPanelVisible((prev) => !prev) } else { setMobileRightOpen(true) }
                  }}
                  label={rightPanelVisible ? 'Ocultar referencias' : 'Mostrar referencias'}
                >
                  {rightPanelVisible ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
                </IconButton>
              ) : null}
            </>
          }
        />

        {/* Content area */}
        <div className="flex flex-1 min-h-0 min-w-0">
          <section className="flex flex-1 min-h-0 min-w-0 flex-col px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6">



            {isChatSection ? (
              <div className="flex-1 min-h-0">
                <ChatWorkspace
                  selectedConversation={selectedConversation}
                  draftActiveDocumentId={state.draftActiveDocumentId}
                  documents={state.documents || []}
                  provider={selectedMotor.provider}
                  onAppendMessagePair={appendMessagePair}
                  onSelectSourceRef={handleSelectSourceRef}
                  onSetConversationActiveDocument={setConversationActiveDocument}
                  onAddUploadedDocument={addUploadedDocument}
                  authToken={authToken}
                  onRefreshAppState={onHydrateFromServer}
                />
              </div>
            ) : null}

            {state.activeSection === 'documents' ? (
              <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
                <DocumentsPage documents={state.documents || []} onAddUploadedDocument={addUploadedDocument} onRemoveDocument={removeDocument} authToken={authToken} onRefreshDocuments={onHydrateFromServer} onUseDocument={setConversationActiveDocument} onStartNewConversation={startNewConversation} onOpenChatSection={() => setActiveSection('chat')} />
              </div>
            ) : null}
            {state.activeSection === 'library' ? (
              <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
                <LibraryPage />
              </div>
            ) : null}
            {state.activeSection === 'settings' ? (
              <div className="flex-1 min-h-0 overflow-y-auto custom-scroll">
                <SettingsPage theme={theme} toggleTheme={onToggleTheme} motor={state.motor} onMotorChange={setMotor} />
              </div>
            ) : null}
          </section>

          {/* Desktop right panel — slide animation */}
          <div className={`hidden xl:block h-full shrink-0 transition-all duration-300 ease-out ${isChatSection && hasSources ? 'w-[340px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
            <div className="w-[340px] h-full">
              <aside className="custom-scroll h-full space-y-3 overflow-y-auto border-l border-[color:var(--stroke)] bg-[color:var(--bg-elev)] p-4">
                <ArticleViewer source={activeSource} highlight={highlightArticle} />
                <ReferenceList sources={latestAssistant?.sources || []} />
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile right panel */}
      {isChatSection && hasAnySources ? (
        <aside
          className={`custom-scroll fixed right-0 top-0 z-40 h-screen w-[88vw] max-w-[360px] space-y-3 overflow-y-auto border-l border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 shadow-[var(--shadow-3)] xl:hidden transition-transform duration-300 ease-out ${mobileRightOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[color:var(--ink-soft)]">Referencias</h3>
            <IconButton onClick={() => setMobileRightOpen(false)} label="Fechar referencias">
              <X size={14} />
            </IconButton>
          </div>
          <ArticleViewer source={activeSource} highlight={highlightArticle} />
          <ReferenceList sources={latestAssistant.sources} />
        </aside>
      ) : null}
    </div>
  )
}
