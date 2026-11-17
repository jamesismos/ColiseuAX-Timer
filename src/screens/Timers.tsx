import { useEffect, useRef } from 'react'
import { Page } from '../components/ui'
import { TEMPLATES, TYPE_LABEL, buildPhases, formatTime, totalSeconds, type TimerConfig } from '../lib/engine'
import { go } from '../lib/nav'
import { useTimers } from '../lib/storage'

function Row({ t, own, first }: { t: TimerConfig; own: boolean; first?: React.Ref<HTMLButtonElement> }) {
  const total = totalSeconds(buildPhases(t))
  return (
    <div className="row">
      <button ref={first} className="btn row-main" onClick={() => go(`/run/${t.id}`)}>
        <strong>{t.name}</strong>
        <span className="muted">
          {TYPE_LABEL[t.type]}
          {t.type === 'countup' ? '' : ` · ${formatTime(total)}`}
        </span>
      </button>
      <button className="btn" onClick={() => go(`/edit/${t.id}`)}>
        {own ? 'Editar' : 'Personalizar'}
      </button>
    </div>
  )
}

export default function Timers() {
  const { list } = useTimers()
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => first.current?.focus(), [])
  return (
    <Page
      title="Timers"
      actions={
        <button className="btn primary" onClick={() => go('/edit/new')}>
          + Novo timer
        </button>
      }
    >
      {list.length > 0 && (
        <section>
          <h2>Meus timers</h2>
          {list.map((t, i) => (
            <Row key={t.id} t={t} own first={i === 0 ? first : undefined} />
          ))}
        </section>
      )}
      <section>
        <h2>Modelos</h2>
        {TEMPLATES.map((t, i) => (
          <Row key={t.id} t={t} own={false} first={list.length === 0 && i === 0 ? first : undefined} />
        ))}
      </section>
    </Page>
  )
}
