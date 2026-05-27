import { API_BASE_URL } from '../../shared/constants/app'
import { SurfaceCard } from '../../shared/ui/SurfaceCard'
import { MoonStar, SunMedium, BrainCircuit, Server } from 'lucide-react'

export function SettingsPage({ theme, toggleTheme, motor, onMotorChange }) {
  return (
    <section className="fade-rise space-y-5 py-2">
      <div>
        <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">Definicoes</h2>
        <p className="mt-1.5 text-sm text-[color:var(--ink-soft)]">Personaliza o comportamento da interface e da integracao com o backend.</p>
      </div>

      {/* Theme */}
      <SurfaceCard className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {theme === 'light' ? <SunMedium size={20} className="text-[color:var(--gold)]" /> : <MoonStar size={20} className="text-[color:var(--accent)]" />}
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--ink)]">Tema visual</h3>
              <p className="text-xs text-[color:var(--ink-soft)]">Alterna entre claro e escuro</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-[var(--radius-md)] border border-[color:var(--stroke)] bg-[color:var(--panel-muted)] px-3.5 py-2 text-sm font-medium text-[color:var(--ink)] transition-all hover:bg-[color:var(--accent-soft)] active:scale-[0.97]"
          >
            {theme === 'light' ? 'Escuro' : 'Claro'}
          </button>
        </div>
      </SurfaceCard>

      {/* Motor de IA */}
      <SurfaceCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)]/10">
            <BrainCircuit size={18} className="text-[color:var(--accent)]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[color:var(--ink)]">Modelo de linguagem</h3>
            <p className="text-xs text-[color:var(--ink-soft)]">
              Motor <span className="font-medium text-[color:var(--accent)]">DeepSeek</span> ativo &mdash; respostas geradas com compreensão contextual
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      </SurfaceCard>

      {/* API info */}
      <SurfaceCard className="p-5">
        <div className="flex items-center gap-3">
          <Server size={20} className="text-[color:var(--ink-soft)]" />
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--ink)]">Backend API</h3>
            <p className="mt-0.5 text-xs font-mono text-[color:var(--accent)]">{API_BASE_URL}</p>
          </div>
        </div>
      </SurfaceCard>
    </section>
  )
}
