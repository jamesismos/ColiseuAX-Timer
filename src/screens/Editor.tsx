import { useState } from 'react'
import { Chips, Page, Stepper } from '../components/ui'
import { TEMPLATES, TYPE_LABEL, blankTimer, buildPhases, formatTime, newId, totalSeconds, type TimerConfig, type TimerType } from '../lib/engine'
import { go, goBack } from '../lib/nav'
import { useTimers } from '../lib/storage'

export default function Editor({ id }: { id: string }) {
  const { list, save, remove } = useTimers()
  const existing = list.find((t) => t.id === id)
  const template = TEMPLATES.find((t) => t.id === id)
  const [t, setT] = useState<TimerConfig>(() => {
    if (existing) return existing
    if (template) return { ...template, id: newId(), name: template.name }
    return blankTimer()
  })
  const patch = (p: Partial<TimerConfig>) => setT((cur) => ({ ...cur, ...p }))
  const total = totalSeconds(buildPhases(t))
  const type = t.type
  const usesRest = type === 'rounds' || type === 'tabata' || type === 'circuit' || type === 'openmat'
  const usesRounds = usesRest

  const commit = (run: boolean) => {
    const clean = { ...t, name: t.name.trim() || 'Timer sem nome' }
    save(clean)
    if (run) go(`/run/${clean.id}`)
    else goBack()
  }

  return (
    <Page title={existing ? 'Editar timer' : 'Novo timer'}>
      <label className="field">
        <span>Nome</span>
        <input value={t.name} onChange={(e) => patch({ name: e.target.value })} maxLength={40} />
      </label>

      <div className="field">
        <span>Tipo</span>
        <Chips<TimerType>
          value={type}
          onChange={(v) => patch({ type: v })}
          options={(Object.keys(TYPE_LABEL) as TimerType[]).map((k) => ({ value: k, label: TYPE_LABEL[k] }))}
        />
      </div>

      {type !== 'countup' && <Stepper label="Preparação" value={t.prep} onChange={(n) => patch({ prep: n })} steps={[5, 30]} max={600} time />}
      {type !== 'countup' && (
        <Stepper
          label={type === 'countdown' ? 'Tempo' : type === 'circuit' ? 'Tempo por estação' : 'Tempo de round'}
          value={t.work}
          onChange={(n) => patch({ work: n })}
          steps={[5, 60]}
          min={5}
          max={36000}
          time
        />
      )}
      {usesRest && <Stepper label="Descanso" value={t.rest} onChange={(n) => patch({ rest: n })} steps={[5, 30]} max={1800} time />}
      {usesRounds && <Stepper label={type === 'circuit' ? 'Voltas' : 'Rounds'} value={t.rounds} onChange={(n) => patch({ rounds: n })} min={1} max={99} steps={[1, 5]} />}
      {type === 'circuit' && <Stepper label="Estações" value={t.stations} onChange={(n) => patch({ stations: n })} min={1} max={30} steps={[1, 5]} />}

      <p className="muted">{type === 'countup' ? 'Cronômetro sem limite de tempo.' : `Duração total: ${formatTime(total)}`}</p>

      <div className="actions">
        <button className="btn primary" onClick={() => commit(true)}>
          Salvar e iniciar
        </button>
        <button className="btn" onClick={() => commit(false)}>
          Salvar
        </button>
        {existing && (
          <button
            className="btn danger"
            onClick={() => {
              remove(existing.id)
              goBack()
            }}
          >
            Excluir
          </button>
        )}
      </div>
    </Page>
  )
}
