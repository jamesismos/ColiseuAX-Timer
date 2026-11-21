import { useState, type ReactNode } from 'react'
import { formatTime } from '../lib/engine'
import { goBack } from '../lib/nav'
import { useSettings } from '../lib/storage'

export function Logo({ className = '' }: { className?: string }) {
  const [s] = useSettings()
  const [broken, setBroken] = useState(false)
  const src = s.logoData || `${import.meta.env.BASE_URL}logo.png`
  // Logo vazia por enquanto: sem arquivo, nada é exibido.
  if (!s.logoData && broken) return null
  return <img className={`logo ${className}`} src={src} alt="" onError={() => setBroken(true)} />
}

export function Brand() {
  const [s] = useSettings()
  return (
    <div className="brand">
      <Logo />
      <div className="brand-text">
        <strong>{s.academy}</strong>
        {s.team && <span>{s.team}</span>}
      </div>
    </div>
  )
}

export function Page({ title, children, actions, back = true }: { title: string; children: ReactNode; actions?: ReactNode; back?: boolean }) {
  return (
    <main className="page">
      <header className="page-head">
        {back && (
          <button className="btn ghost" onClick={goBack} aria-label="Voltar">
            ← Voltar
          </button>
        )}
        <h1>{title}</h1>
        <div className="spacer" />
        {actions}
      </header>
      {children}
    </main>
  )
}

export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 3600,
  steps = [1, 10],
  time = false,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  steps?: [number, number]
  time?: boolean // true: valores em segundos exibidos como mm:ss
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)))
  const [small, large] = steps
  const tag = (n: number) => (!time ? String(n) : n >= 60 && n % 60 === 0 ? `${n / 60}m` : `${n}s`)
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-row">
        <button className="btn small" onClick={() => set(value - large)} aria-label={`Diminuir ${tag(large)}`}>
          −{tag(large)}
        </button>
        <button className="btn small" onClick={() => set(value - small)} aria-label={`Diminuir ${tag(small)}`}>
          −{tag(small)}
        </button>
        <output className="stepper-value">{time ? formatTime(value) : value}</output>
        <button className="btn small" onClick={() => set(value + small)} aria-label={`Aumentar ${tag(small)}`}>
          +{tag(small)}
        </button>
        <button className="btn small" onClick={() => set(value + large)} aria-label={`Aumentar ${tag(large)}`}>
          +{tag(large)}
        </button>
      </div>
    </div>
  )
}

export function Chips<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="chips" role="radiogroup">
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={o.value === value} className={`chip ${o.value === value ? 'on' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
