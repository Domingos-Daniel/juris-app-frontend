import { useState } from 'react'
import { Landmark, SlidersHorizontal, ArrowRight, Check } from 'lucide-react'

export function OnboardingTour({ userName, onFinish }) {
  const [step, setStep] = useState(1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[var(--shadow-3)] animate-[fadeIn_0.3s_ease-out]">
        {step === 1 ? (
          <div className="p-6 sm:p-8">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--accent)] text-white shadow-[var(--shadow-2)]">
              <Landmark size={24} />
            </div>
            <h2 className="text-center font-[family-name:var(--font-serif)] text-2xl font-semibold text-[color:var(--ink)]">
              Bem-vindo, {userName}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-[color:var(--ink-soft)]">
              O <strong>jURIS-APP</strong> é o seu assistente jurídico angolano com inteligência artificial.
            </p>
            <div className="mt-5 space-y-2.5">
              {[
                { title: 'Pesquise leis', desc: 'Pergunte sobre qualquer área do direito angolano e receba respostas com citações e referências.' },
                { title: 'Carregue documentos', desc: 'Anexe PDFs e o assistente usa esses documentos como fonte principal nas respostas.' },
                { title: 'Consulte jurisprudência', desc: 'Veja acórdãos do Tribunal Supremo e do Tribunal Constitucional.' },
                { title: 'Use a voz', desc: 'Fale com o assistente — ele ouve e responde em áudio.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[color:var(--panel-muted)] px-3.5 py-2.5">
                  <Check size={15} className="mt-0.5 shrink-0 text-[color:var(--success)]" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--ink)]">{item.title}</p>
                    <p className="text-xs text-[color:var(--ink-soft)]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[color:var(--accent-hover)] active:scale-[0.97]">
              Continuar <ArrowRight size={14} />
            </button>
            <button onClick={() => onFinish({ tone: 'formal', audience: 'auto', detail_level: 'normal', language_style: 'acessivel', response_format: 'auto' })} className="mt-2 w-full rounded-[var(--radius-md)] px-4 py-2 text-xs font-medium text-[color:var(--ink-soft)] transition-colors hover:bg-[color:var(--panel-muted)]">
              Saltar e configurar depois
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--gold)]/10 text-[color:var(--gold)] shadow-[var(--shadow-2)]">
              <SlidersHorizontal size={24} />
            </div>
            <h2 className="text-center font-[family-name:var(--font-serif)] text-2xl font-semibold text-[color:var(--ink)]">
              Como prefere as respostas?
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-center text-sm text-[color:var(--ink-soft)]">
              Pode alterar estas preferências a qualquer momento nas <strong>Definições</strong>.
            </p>

            <AIPrefForm onFinish={onFinish} skipText="Usar padrão" />
          </div>
        )}
      </div>
    </div>
  )
}

function AIPrefForm({ onFinish, skipText }) {
  const [form, setForm] = useState({
    tone: 'formal',
    audience: 'auto',
    detail_level: 'normal',
    language_style: 'acessivel',
    response_format: 'auto',
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="mt-5 space-y-3.5">
      {[
        { key: 'tone', label: 'Tom de resposta', desc: 'Como o assistente fala consigo',
          options: [
            { v: 'formal', l: 'Formal', d: 'Sério e profissional' },
            { v: 'didatico', l: 'Explicativo', d: 'Ensina como um professor' },
            { v: 'simples', l: 'Conversa', d: 'Linguagem do dia a dia' },
          ]},
        { key: 'audience', label: 'Nível de conhecimento', desc: 'O quanto sabe sobre leis',
          options: [
            { v: 'auto', l: 'Automático', d: 'O sistema escolhe por si' },
            { v: 'leigo', l: 'Básico', d: 'Não sabe nada de leis' },
            { v: 'tecnico', l: 'Avançado', d: 'É jurista ou advogado' },
          ]},
        { key: 'detail_level', label: 'Tamanho da resposta', desc: 'Quão longa deve ser a explicação',
          options: [
            { v: 'breve', l: 'Curta', d: 'Resposta direta, sem rodeios' },
            { v: 'normal', l: 'Normal', d: 'Nem curta nem longa' },
            { v: 'detalhado', l: 'Completa', d: 'Explicação aprofundada' },
          ]},
        { key: 'language_style', label: 'Tipo de linguagem', desc: 'Palavras técnicas ou simples',
          options: [
            { v: 'juridico', l: 'Jurídico', d: 'Termos técnicos de direito' },
            { v: 'acessivel', l: 'Acessível', d: 'Palavras que todos entendem' },
          ]},
        { key: 'response_format', label: 'Formato da resposta', desc: 'Como a resposta é organizada',
          options: [
            { v: 'auto', l: 'Automático', d: 'O sistema escolhe por si' },
            { v: 'paragrafos', l: 'Texto', d: 'Parágrafos corridos' },
            { v: 'topicos', l: 'Tópicos', d: 'Pontos organizados' },
          ]},
      ].map(({ key, label, desc, options }) => (
        <div key={key}>
          <div className="mb-1.5 flex items-end justify-between">
            <label className="text-xs font-semibold text-[color:var(--ink)]">{label}</label>
            <span className="text-[10px] text-[color:var(--ink-soft)]/70">{desc}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {options.map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => update(key, opt.v)}
                title={opt.d}
                className={`flex-1 min-w-[60px] rounded-[var(--radius-sm)] border px-2 py-2 text-xs font-medium transition-all ${
                  form[key] === opt.v
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                    : 'border-[color:var(--stroke)] text-[color:var(--ink-soft)] hover:bg-[color:var(--panel-muted)]'
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => onFinish(form)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[color:var(--accent-hover)] active:scale-[0.97]">
        Começar <ArrowRight size={14} />
      </button>
      {skipText ? (
        <button onClick={() => onFinish(form)} className="mt-2 w-full rounded-[var(--radius-md)] px-4 py-2 text-xs font-medium text-[color:var(--ink-soft)] transition-colors hover:bg-[color:var(--panel-muted)]">
          {skipText}
        </button>
      ) : null}
    </div>
  )
}
