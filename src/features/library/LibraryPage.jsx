import { useState, useEffect } from 'react'
import { SurfaceCard } from '../../shared/ui/SurfaceCard'
import { fetchCatalog } from '../../shared/services/apiClient'
import { useAuth } from '../../shared/hooks/useAuth'
import { CheckCircle, Clock, BookOpen } from 'lucide-react'

export function LibraryPage() {
  const { token } = useAuth()
  const [catalog, setCatalog] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoading(true)
        const response = await fetchCatalog(token)
        setCatalog(response.items || [])
      } catch (err) {
        console.error('Error fetching catalog:', err)
        setError('Nao foi possivel carregar a biblioteca.')
      } finally {
        setIsLoading(false)
      }
    }
    loadCatalog()
  }, [token])

  const validatedItems = catalog.filter(item => item.status === 'Validado no corpus')
  const pendingItems = catalog.filter(item => item.status !== 'Validado no corpus')

  return (
    <section className="fade-rise space-y-5 py-2">
      {/* Header */}
      <div>
        <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">Biblioteca Juridica</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[color:var(--ink-soft)]">
          Diplomas indexados, validados e utilizados pelo assistente nas respostas fundamentadas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SurfaceCard className="p-4">
          <div className="flex items-center gap-2 text-[color:var(--success)]">
            <CheckCircle size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Validados</span>
          </div>
          <div className="mt-2 font-[family-name:var(--font-serif)] text-3xl font-semibold text-[color:var(--ink)]">
            {isLoading ? '—' : validatedItems.length}
          </div>
        </SurfaceCard>
        <SurfaceCard className="p-4">
          <div className="flex items-center gap-2 text-[color:var(--warning)]">
            <Clock size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Pendentes</span>
          </div>
          <div className="mt-2 font-[family-name:var(--font-serif)] text-3xl font-semibold text-[color:var(--ink)]">
            {isLoading ? '—' : pendingItems.length}
          </div>
        </SurfaceCard>
        <SurfaceCard className="col-span-2 p-4 sm:col-span-1">
          <div className="flex items-center gap-2 text-[color:var(--accent)]">
            <BookOpen size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
          </div>
          <div className="mt-2 font-[family-name:var(--font-serif)] text-3xl font-semibold text-[color:var(--ink)]">
            {isLoading ? '—' : catalog.length}
          </div>
        </SurfaceCard>
      </div>

      {/* Loading / Error */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-sm text-[color:var(--ink-soft)]">
          <span className="mr-2 h-4 w-4 rounded-full border-2 border-[color:var(--accent)] border-t-transparent animate-spin" />
          Carregando biblioteca...
        </div>
      ) : null}
      {error ? <div className="rounded-[var(--radius-md)] border border-red-200 bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* Validated legislation grid */}
      {!isLoading && !error && validatedItems.length > 0 ? (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[color:var(--ink-soft)]">Cobertura validada</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {validatedItems.map((item) => (
              <SurfaceCard key={item.title} className="group p-4 transition-all hover:shadow-[var(--shadow-2)]">
                <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-[color:var(--success-soft)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--success)]">
                  <CheckCircle size={11} />
                  {item.status}
                </div>
                <h4 className="font-[family-name:var(--font-serif)] text-lg font-semibold leading-tight text-[color:var(--ink)]">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">{item.scope}</p>
              </SurfaceCard>
            ))}
          </div>
        </div>
      ) : null}

      {!isLoading && !error && validatedItems.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--stroke)] p-8 text-center text-sm text-[color:var(--ink-soft)]">
          Nenhum diploma validado ainda.
        </div>
      ) : null}

      {/* Pending items */}
      {!isLoading && !error && pendingItems.length > 0 ? (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[color:var(--ink-soft)]">Em expansao</h3>
          <div className="space-y-2">
            {pendingItems.map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--stroke)] bg-[color:var(--panel-muted)] px-4 py-3">
                <Clock size={14} className="shrink-0 text-[color:var(--warning)]" />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-[color:var(--ink)]">{item.title}</span>
                  <span className="ml-2 text-sm text-[color:var(--ink-soft)]">— {item.scope}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
