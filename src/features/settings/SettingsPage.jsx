import { useState } from 'react'
import { API_BASE_URL } from '../../shared/constants/app'
import { SurfaceCard } from '../../shared/ui/SurfaceCard'
import { InfoTooltip } from '../../shared/ui/InfoTooltip'
import { MoonStar, SunMedium, BrainCircuit, Server, User, Mail, Phone, Save } from 'lucide-react'
import { updateProfileRequest, updatePreferencesRequest } from '../../shared/services/apiClient'

export function SettingsPage({ theme, toggleTheme, motor, onMotorChange, currentUser, authToken, onProfileUpdate }) {
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  })
  const [profileMsg, setProfileMsg] = useState('')

  const [prefs, setPrefs] = useState({
    tone: currentUser?.ai_preferences?.tone || 'formal',
    audience: currentUser?.ai_preferences?.audience || 'auto',
    detail_level: currentUser?.ai_preferences?.detail_level || 'normal',
    language_style: currentUser?.ai_preferences?.language_style || 'acessivel',
    response_format: currentUser?.ai_preferences?.response_format || 'auto',
  })
  const [prefsMsg, setPrefsMsg] = useState('')

  const saveProfile = async () => {
    try {
      await updateProfileRequest(authToken, profile.name, profile.email, profile.phone)
      onProfileUpdate?.()
      setProfileMsg('Perfil atualizado')
      setTimeout(() => setProfileMsg(''), 3000)
    } catch { setProfileMsg('Erro ao guardar') }
  }

  const savePrefs = async () => {
    try {
      await updatePreferencesRequest(authToken, prefs)
      setPrefsMsg('Preferencias guardadas')
      setTimeout(() => setPrefsMsg(''), 3000)
    } catch { setPrefsMsg('Erro ao guardar') }
  }

  return (
    <section className="fade-rise space-y-5 py-2">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl">Definicoes</h2>
          <InfoTooltip content="Configure o tema visual, perfil pessoal, preferencias de IA e informacoes do backend." />
        </div>
        <p className="mt-1.5 text-sm text-[color:var(--ink-soft)]">Personaliza o comportamento da interface e do assistente juridico.</p>
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
          <button onClick={toggleTheme} className="rounded-[var(--radius-md)] border border-[color:var(--stroke)] bg-[color:var(--panel-muted)] px-3.5 py-2 text-sm font-medium text-[color:var(--ink)] transition-all hover:bg-[color:var(--accent-soft)] active:scale-[0.97]">
            {theme === 'light' ? 'Escuro' : 'Claro'}
          </button>
        </div>
      </SurfaceCard>

      {/* Profile */}
      <SurfaceCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)]/10">
            <User size={18} className="text-[color:var(--accent)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--ink)]">Perfil</h3>
            <p className="text-xs text-[color:var(--ink-soft)]">Os seus dados pessoais</p>
          </div>
        </div>
        <div className="space-y-3">
          <InputRow icon={<User size={14} />} label="Nome completo" value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
          <InputRow icon={<Mail size={14} />} label="Email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} type="email" />
          <InputRow icon={<Phone size={14} />} label="Telefone" value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
          <div className="flex items-center gap-3">
            <button onClick={saveProfile} className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[color:var(--accent)] px-3.5 py-2 text-xs font-medium text-white transition-all hover:bg-[color:var(--accent-hover)] active:scale-[0.97]">
              <Save size={12} /> Guardar perfil
            </button>
            {profileMsg ? <span className="text-xs text-[color:var(--success)]">{profileMsg}</span> : null}
          </div>
        </div>
      </SurfaceCard>

      {/* AI Preferences */}
      <SurfaceCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--gold)]/10">
            <BrainCircuit size={18} className="text-[color:var(--gold)]" />
          </div>
          <div>
          <h3 className="text-sm font-semibold text-[color:var(--ink)]">Como a IA responde</h3>
          <p className="text-xs text-[color:var(--ink-soft)]">Personalize o comportamento do assistente</p>
          </div>
        </div>
        <div className="space-y-3.5">
          <SelectRow label="Modo de falar" desc="Como o assistente se comunica" value={prefs.tone} onChange={(v) => setPrefs((p) => ({ ...p, tone: v }))} options={[
            { v: 'formal', l: 'Formal', d: 'Linguagem seria e profissional' },
            { v: 'didatico', l: 'Explicador', d: 'Ensina como um professor' },
            { v: 'simples', l: 'Conversa', d: 'Linguagem do dia-a-dia' },
          ]} />
          <SelectRow label="Nivel de conhecimento" desc="O quanto sabe de leis" value={prefs.audience} onChange={(v) => setPrefs((p) => ({ ...p, audience: v }))} options={[
            { v: 'auto', l: 'Autom.', d: 'O sistema decide' },
            { v: 'leigo', l: 'Basico', d: 'Nao sabe nada de leis' },
            { v: 'tecnico', l: 'Avancado', d: 'E jurista ou advogado' },
          ]} />
          <SelectRow label="Tamanho da resposta" desc="Quao longa a explicacao" value={prefs.detail_level} onChange={(v) => setPrefs((p) => ({ ...p, detail_level: v }))} options={[
            { v: 'breve', l: 'Curta', d: 'Resposta directa' },
            { v: 'normal', l: 'Normal', d: 'Nem curta nem longa' },
            { v: 'detalhado', l: 'Completa', d: 'Explicacao aprofundada' },
          ]} />
          <SelectRow label="Tipo de palavras" desc="Termos tecnicos ou populares" value={prefs.language_style} onChange={(v) => setPrefs((p) => ({ ...p, language_style: v }))} options={[
            { v: 'juridico', l: 'Juridico', d: 'Termos de direito' },
            { v: 'acessivel', l: 'Popular', d: 'Todos entendem' },
          ]} />
          <SelectRow label="Apresentacao" desc="Como a resposta e organizada" value={prefs.response_format} onChange={(v) => setPrefs((p) => ({ ...p, response_format: v }))} options={[
            { v: 'auto', l: 'Autom.', d: 'O sistema escolhe' },
            { v: 'paragrafos', l: 'Texto', d: 'Paragrafos corridos' },
            { v: 'topicos', l: 'Lista', d: 'Pontos organizados' },
          ]} />
          <div className="flex items-center gap-3">
            <button onClick={savePrefs} className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[color:var(--gold)] px-3.5 py-2 text-xs font-medium text-white transition-all hover:brightness-110 active:scale-[0.97]">
              <Save size={12} /> Guardar preferencias
            </button>
            {prefsMsg ? <span className="text-xs text-[color:var(--success)]">{prefsMsg}</span> : null}
          </div>
        </div>
      </SurfaceCard>

      {/* Motor / API */}
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

function InputRow({ icon, label, value, onChange, type }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="shrink-0 text-[color:var(--ink-soft)]">{icon}</span>
      <div className="flex-1">
        <span className="text-[10px] font-medium text-[color:var(--ink-soft)]">{label}</span>
        <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 w-full rounded-[var(--radius-sm)] border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1.5 text-sm outline-none focus:border-[color:var(--accent)]" />
      </div>
    </div>
  )
}

function SelectRow({ label, desc, value, onChange, options }) {
  return (
    <div>
      <div className="mb-1 flex items-end justify-between">
        <span className="text-xs font-semibold text-[color:var(--ink)]">{label}</span>
        {desc ? <span className="text-[10px] text-[color:var(--ink-soft)]/70">{desc}</span> : null}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button key={opt.v} type="button" onClick={() => onChange(opt.v)}
            title={opt.d || ''}
            className={`flex-1 min-w-[55px] rounded-[var(--radius-sm)] border px-2 py-1.5 text-xs font-medium transition-all ${
              value === opt.v ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]' : 'border-[color:var(--stroke)] text-[color:var(--ink-soft)] hover:bg-[color:var(--panel-muted)]'
            }`}
          >{opt.l}</button>
        ))}
      </div>
    </div>
  )
}
